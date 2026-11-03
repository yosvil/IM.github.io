# SEIDP – Sistema de Evaluación Integral del Desarrollo Personal
Abre `index.html` con doble clic (navegador moderno). Sin servidor, base de datos, cuentas, CDN ni almacenamiento: los datos solo existen en memoria y se pierden al cerrar o recargar.

## Estructura
- `index.html` – interfaz · `css/styles.css` – estilos · `js/evaluation.js` – pesos, escalas, fórmulas y reglas de recomendación · `js/app.js` – formulario, dashboard, gráficos, PDF y reinicio
- `vendor/` – Chart.js, jsPDF y jsPDF-AutoTable (copias locales) · `assets/logo.svg` – logotipo editable · `docs/` – metodología

## Personalizar
- Pesos y preguntas: `MODEL.ind` y `MODEL.q` en `js/evaluation.js` (los pesos deben sumar 1).
- Colores: variables `:root` en `css/styles.css` y `fillColor` en `js/app.js`. Logo: reemplaza `assets/logo.svg`.

## Pruebas realizadas / limitaciones
Ver `docs/modelo-evaluacion.md`. El diseño no se probó visualmente en navegador y el PDF no se abrió en un visor; verifícalos antes de uso real.
