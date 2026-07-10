# Presupuesto para Provincia Fondos — Teo Coop

Sitio estático de una sola página (sin build step) con la propuesta comercial de El Maizal Coop y Teo Coop, con la identidad de marca de Teo Coop.

## Ver en local

Abrí `index.html` con cualquier servidor estático, por ejemplo:

```
npx serve .
```

## Deploy a Vercel

Con la Vercel CLI:

```
npx vercel --prod
```

O arrastrando esta carpeta al dashboard de [vercel.com/new](https://vercel.com/new) — es un sitio estático, no requiere build command ni framework preset (elegir "Other").

## Editar contenido

- `index.html` — contenido y estructura de las secciones
- `css/style.css` — estilos, tokens de color (claro `#f6f5f2` / oscuro `#1b202d`) en `:root`
- `js/main.js` — theme toggle, dot-nav, animaciones de scroll (reveal, contadores, parallax de portada, tilt de tarjetas)
- `assets/teo-logo-mark.png` — isotipo de Teo Coop, usado como máscara CSS para poder recolorearlo según el tema
