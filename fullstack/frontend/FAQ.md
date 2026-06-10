### 📁 1. Las Carpetas Principales

* **`node_modules/` (El depósito gigante):** Acá viven todas las herramientas que instalaste al hacer `npm install` (como React, Vite, etc.). Pesa muchísimo y **nunca, jamás tenés que tocar nada acá adentro**. Tampoco se sube a GitHub.
* **`public/` (La vidriera):** Acá ponés cosas que querés que se publiquen tal cual, sin que Vite las procese. Por ejemplo, el icono de la pestañita del navegador (`vite.svg`).
* **`src/` (Tu espacio de trabajo):** *Source* (Código Fuente). **El 99% de tu Trabajo Práctico lo vas a escribir acá adentro.** Acá van a crear sus pantallas, componentes y lógica.

---

### ⚛️ 2. El corazón de React (Cómo funciona la magia)

Estos son los archivos que hacen que tu página se vea en el navegador. Trabajan en equipo haciendo una cadena:

1. **`index.html` (El lienzo en blanco):** Si lo abrís, vas a ver que es un HTML casi vacío con un simple `<div id="root"></div>`. Es la única página real de tu sitio.
2. **`src/main.tsx` (El pintor):** Este archivo agarra a React, busca ese `div` vacío del HTML y le dice: *"A partir de ahora, React toma el control de este espacio y va a dibujar todo acá adentro"*.
3. **`src/App.tsx` (Tu primera pintura):** Es el componente principal. El código que viste cuando abriste la página en tu navegador (los logos, el botón del contador) sale de este archivo.
4. **`src/index.css` y `src/App.css`:** Los archivos de diseño. El `index` es para estilos globales de toda la página, y el `App` es solo para ese componente.

---

### ⚙️ 3. Los archivos de configuración (La sala de máquinas)

La mayoría de estos archivos se configuran solos y rara vez vas a tener que abrirlos, pero está bueno saber qué hacen:

* **`package.json`:** Como charlamos antes, es el DNI del proyecto. Anota qué scripts podés correr (como `npm run dev`) y qué librerías tenés instaladas.
* **`package-lock.json`:** Es el registro contable de Node. Anota la versión *exacta al milímetro* de cada pequeña cosita instalada en `node_modules` para que, si tu amigo instala el proyecto mañana, le baje exactamente lo mismo que a vos y no haya conflictos.
* **`.gitignore` (El patovica):** Es una lista de las cosas que Git tiene prohibido subir a GitHub (como la pesada carpeta `node_modules` o contraseñas secretas).
* **`vite.config.ts`:** Las configuraciones del servidor de Vite. Si el día de mañana quieren cambiar en qué puerto corre la página, lo hacen acá.
* **`tsconfig.json` (y sus hermanos):** Como eligieron usar TypeScript, estos archivos contienen las reglas estrictas de cómo TypeScript va a vigilar que no cometan errores al escribir el código.
* **`eslint.config.js`:** Es un "corrector ortográfico" de código. Es una herramienta (ESLint) que te va a subrayar en rojo si escribís una variable que no usás o si el código está desprolijo.