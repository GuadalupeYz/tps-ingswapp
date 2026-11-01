// Datos de prueba separados de los tests (buena práctica vista en clase).
export const libroBuscado = {
  // Búsqueda simple (caja principal del catálogo)
  busqueda: 'UML y patrones',
  // Búsqueda avanzada: un término por cada campo
  terminosAvanzada: ['UML', 'patrones'],
  // Expresión regular para no depender de mayúsculas/minúsculas ni de subtítulos
  tituloEsperado: /UML y patrones/i,
};
