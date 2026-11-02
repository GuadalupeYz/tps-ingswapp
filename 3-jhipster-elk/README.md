# TP 3: Gestión de logs con JHipster + ELK

Aplicación **JHipster** (el *Blog App* de la clase) que envía sus logs al stack **ELK**: Logstash los recibe, filtra y enmascara datos sensibles, Elasticsearch los guarda y Kibana permite buscarlos, graficarlos y alertar.

```
┌──────────────────────┐  JSON por TCP :5000  ┌──────────────┐      ┌───────────────┐      ┌──────────┐
│ JHipster (blog)      │ ───────────────────▶ │  Logstash    │ ───▶ │ Elasticsearch │ ◀─── │  Kibana  │
│ Logback +            │                      │ filtra y     │      │ jhipster-logs-│      │ :5601    │
│ LogstashTcpAppender  │                      │ enmascara    │      │ AAAA.MM.DD    │      │          │
└──────────────────────┘                      └──────────────┘      └───────────────┘      └──────────┘
```

## Estructura

```
3-jhipster-elk/
├── blog/                          # App JHipster 9.4 (Spring Boot 4 + Angular), generada desde blog.jh
│   ├── blog.jh                    # Definición JDL: entidades Blog, Post y Tag
│   └── src/...
└── elk/
    ├── docker-compose.yml         # Elasticsearch, Logstash y Kibana 9.4.6
    ├── logstash/pipeline/logstash.conf   # Entrada TCP, filtros y salida a Elasticsearch
    └── kibana-setup.sh            # Crea la política de retención (ILM) y el data view en Kibana
```

## Qué se configuró

### 1. JHipster envía los logs a Logstash

- En `blog/src/main/resources/config/application-dev.yml`: `jhipster.logging.logstash.enabled: true` (host `localhost`, puerto `5000`, buffer asíncrono de 512 eventos). Si Logstash no responde, la app sigue funcionando.
- En `blog/pom.xml` se agregó la dependencia **`logstash-logback-encoder`**. En JHipster 9 viene como *opcional* dentro de `jhipster-framework`, así que sin ella la app no podía armar el appender de Logstash.
- Cada log viaja como JSON con `@timestamp`, `level`, `logger_name`, `thread_name`, `app_name`, `app_port` y, si hay error, `stack_trace`.

### 2. Logs con contexto en el código (`kv()`)

`kv()` agrega el valor al mensaje **y** lo guarda como un campo propio en Elasticsearch, para poder filtrar por él:

| Dónde | Log | Campos |
|-------|-----|--------|
| `PostResource.createPost` | `INFO Post creado` | `postId`, `blogId` |
| `PostResource.deletePost` | `WARN Se intentó borrar un post que no existe` / `INFO Post borrado` | `postId` |
| `AuthenticateController.authorize` | `WARN Login fallido` / `INFO Login exitoso` | `usuario`, `motivo` |

Los logins se registran porque son eventos de seguridad (OWASP Logging Cheat Sheet). Se registra **el usuario y el motivo, nunca la contraseña**.

### 3. Logstash filtra y enmascara (la "doble red")

`elk/logstash/pipeline/logstash.conf`:
- **Elimina** los campos `password`, `token` y `authorization` si algún log los trae.
- **Enmascara tarjetas**: `4111111111111111` → `************1111`.
- **Enriquece** cada evento con `env: dev`.
- Guarda en índices diarios `jhipster-logs-AAAA.MM.DD`.

### 4. Retención con ILM

`kibana-setup.sh` crea la política `jhipster-logs` (a los 7 días el índice pasa a solo lectura y a los 30 se borra) y una plantilla que la aplica a todos los índices `jhipster-logs-*`. También crea el data view **"Logs de JHipster"** en Kibana.

## Cómo ejecutarlo

> Requiere Docker, Java 21 y unos 8 GB de disco libres. La primera vez descarga las imágenes de Elastic (~7 GB descomprimidas) y las dependencias de Maven y npm.

**1. Levantar ELK** (tarda 1-2 minutos):

    cd 3-jhipster-elk/elk
    docker compose up -d

**2. Configurar Elasticsearch y Kibana** (una sola vez):

    ./kibana-setup.sh

**3. Levantar la app** (en otra terminal; la primera vez compila el frontend y tarda varios minutos):

    cd 3-jhipster-elk/blog
    ./mvnw

**4. Usar la app** en http://localhost:8080 (usuario `admin`, contraseña `admin`): equivocarse de contraseña un par de veces, entrar, crear un Blog y un Post, borrar un Post.

**5. Ver los logs** en Kibana: http://localhost:5601 → menú → **Discover** → data view **Logs de JHipster**.

Para apagar todo: `Ctrl+C` en la app y `docker compose down` en `elk/` (con `docker compose down -v` se borran también los logs guardados).

## Consultas KQL para mostrar en Kibana

| Consulta | Para qué |
|----------|----------|
| `level : "WARN" or level : "ERROR"` | Todo lo que merece atención |
| `message : "Login fallido"` | Intentos de login fallidos (posible fuerza bruta) |
| `usuario : "admin"` | Todo lo que hizo un usuario |
| `postId : 9999` | Seguir un post por su ID (campo creado con `kv()`) |
| `not logger_name : *Health*` | Sacar el ruido de los health checks |

## Prueba de los filtros de Logstash

Enviar a mano un log "malo" con una tarjeta y una contraseña:

    echo '{"level":"ERROR","app_name":"prueba-filtros","message":"Pago rechazado con tarjeta 4111111111111111","password":"Qwerty123","token":"abc"}' > /dev/tcp/127.0.0.1/5000

En Discover, con `app_name : "prueba-filtros"`, el mensaje aparece como `Pago rechazado con tarjeta ************1111` y **no** existen los campos `password` ni `token`.

## Extras en Kibana (desde la interfaz)

- **Dashboard** (Analytics → Dashboards → Create → Lens): por ejemplo, logs por nivel a lo largo del tiempo, o un contador de `Login fallido`.
- **Alerta** (Stack Management → Rules → Create rule → *Elasticsearch query*): data view `jhipster-logs-*`, consulta `message : "Login fallido"`, condición *count > 5 en los últimos 5 minutos* → posible fuerza bruta.

## Decisiones y problemas resueltos

- **`logstash-logback-encoder` faltante:** con `logstash.enabled: true` la app necesitaba esa librería y JHipster 9 no la incluye por defecto. Se agregó en el `pom.xml` con la misma versión que usa JHipster (9.0).
- **Disco casi lleno:** Elasticsearch pone los índices en *solo lectura* cuando el disco supera el 85 %. Para una máquina de desarrollo se desactivó ese umbral (`cluster.routing.allocation.disk.threshold_enabled=false`).
- **Poca memoria:** Elasticsearch con 512 MB de heap y Logstash con 256 MB. El stack completo usa unos 2,5 GB de RAM.
- **Sin seguridad en Elastic:** para simplificar el entorno local se desactivó (`xpack.security.enabled=false`) y los puertos solo escuchan en `127.0.0.1`. En producción hay que activar usuarios, roles y TLS, como muestran las diapositivas.
- **Base de datos:** H2 en disco para desarrollo, así no hace falta otro contenedor. Para producción, el JDL define PostgreSQL.
