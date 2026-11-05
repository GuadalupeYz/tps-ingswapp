// Datos de prueba separados de los tests (buena práctica vista en clase).
export const datos = {
  // Texto del link de la sección en el menú de Infobae
  seccion: /^Tecno(logía)?$/,
  // URL esperada de la sección y de una noticia de esa sección (/tecno/AAAA/MM/DD/titulo/)
  urlSeccion: /\/tecno\/?$/,
  urlNoticia: /\/tecno\/\d{4}\/\d{2}\/\d{2}\/.+/,
  tituloPortada: /Infobae/,
  tituloSeccion: /Tecnolog/i,
};
