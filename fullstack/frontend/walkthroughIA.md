# Guía de Iniciación: De HTML/CSS a React + Tailwind

¡Felicitaciones por haber llegado hasta acá con el diseño visual de tu sistema! Como tu base es HTML y CSS, dar el salto a **React** y **Tailwind** puede parecer intimidante, pero en realidad es como escribir HTML con "superpoderes".

Esta guía te ayudará a entender cómo está armado el código que generamos y cómo podés empezar a modificarlo vos mismo.

---

## 1. El Concepto Principal: Componentes (Los "Ladrillos")

En HTML tradicional, solemos escribir una página entera de principio a fin (ej: `index.html`, `inscripciones.html`). 
En **React**, dividimos la interfaz en piezas pequeñas y reutilizables llamadas **Componentes**.

Si revisás la carpeta `src/components`, vas a ver archivos como:
- `Sidebar.tsx` (La barra lateral)
- `Topbar.tsx` (La barra superior)
- `Inscripciones.tsx` (La pantalla de inscripciones)

**¿Qué es un archivo `.tsx`?**
Es simplemente un archivo que mezcla lógica (JavaScript/TypeScript) con etiquetas visuales (HTML). En React, a esa sintaxis que parece HTML dentro de JavaScript se le llama **JSX**.

### Ejemplo comparativo

**HTML Tradicional:**
```html
<div class="boton">
  <button>Hacer click</button>
</div>
```

**React (Componente .tsx):**
```tsx
export default function MiBoton() {
  return (
    <div className="boton">
      <button>Hacer click</button>
    </div>
  )
}
```
> [!NOTE]  
> Notarás que en vez de usar `class="..."`, en React usamos `className="..."`. ¡Esa es casi la única diferencia a nivel etiquetas!

---

## 2. TailwindCSS: CSS directamente en el HTML

Me comentaste que sabés algo de CSS. En vez de ir a un archivo `style.css` y escribir `.boton { color: white; background: blue; padding: 10px; }`, usamos **TailwindCSS**.

Tailwind te permite aplicar estilos escribiendo clases predefinidas directamente en el `className`.

**Ejemplos de traducción:**
- `bg-blue-600` = `background-color: #2563eb;`
- `text-white` = `color: white;`
- `p-4` = `padding: 1rem;` (16px)
- `rounded-lg` = `border-radius: 0.5rem;`
- `flex justify-between` = `display: flex; justify-content: space-between;`

Si querés cambiar un color en tu código, solo tenés que buscar en el `.tsx` la clase (por ejemplo `bg-indigo-600`) y cambiarla por `bg-red-600` o `bg-emerald-600`.

---

## 3. Estado (State): La "Memoria" de React

En HTML tradicional, si querés que un modal se abra o se cierre, tenés que escribir JavaScript con `document.getElementById` y cambiarle el `display: none` a `display: block`.

En React, usamos algo llamado **Estado** (`useState`). Es una variable que, cuando cambia, **React actualiza la pantalla automáticamente**.

```tsx
import { useState } from 'react'

export default function MiPantalla() {
  // modalAbierto es la variable (true o false)
  // setModalAbierto es la función para cambiar esa variable
  const [modalAbierto, setModalAbierto] = useState(false)

  return (
    <div>
      <button onClick={() => setModalAbierto(true)}>Abrir Modal</button>

      {/* Si modalAbierto es true, dibuja el HTML del modal */}
      {modalAbierto && (
        <div className="modal">
          <h1>Hola soy el modal</h1>
          <button onClick={() => setModalAbierto(false)}>Cerrar</button>
        </div>
      )}
    </div>
  )
}
```

---

## 4. TypeScript: El detector de errores

Vas a notar que algunos archivos dicen `interface` o tienen cosas raras como `(e: React.FormEvent)`. 
Eso es **TypeScript**. Básicamente, es una herramienta de seguridad que revisa el código *mientras* escribís y te avisa si estás tratando de sumar un texto con un número, o si escribiste mal el nombre de una variable. Como principiante, podés ignorarlo bastante; sirve para ayudarte a no equivocarte.

---

## 5. Manos a la Obra: Cómo empezar a modificar

Si querés meter mano, te sugiero estos pasos:

1. **Asegurate de que la consola siga corriendo** (`npm run dev`). De esa forma, cada vez que guardes un archivo, el navegador se actualizará solo.
2. **Abrí el archivo `src/components/Sidebar.tsx`**.
   - Buscá la palabra `"Cursos"` y cambiala por `"Gestión de Cursos"`. Guardá el archivo y mirá el navegador.
   - Buscá el color `bg-indigo-600` de algún botón y cambialo por `bg-blue-600`.
3. **Abrí `src/components/Comisiones.tsx`**.
   - Bajá hasta donde están definidos los `comisionesEjemplo`.
   - Modificá el nombre del docente, guardá y mirá cómo se actualiza.
   - Tratá de encontrar el HTML (abajo en la zona del `return`) donde se dibuja el título `"Comisiones"` y cambiale el tamaño (`text-xl` a `text-3xl`).

> [!TIP]
> Si en algún momento rompés algo y la pantalla queda en blanco, la consola te va a decir en qué línea está el error. ¡No tengas miedo de romper cosas! Podés usar `Ctrl + Z` en tu editor para volver atrás, o pedirme ayuda para solucionarlo.

## ¿Qué archivo hace qué?

- **`src/main.tsx`**: El punto de entrada principal (no hace falta tocarlo).
- **`src/App.tsx`**: El esqueleto de la aplicación. Acá decidimos qué pantalla mostrar (`<Pagos />`, `<Cursos />`, etc.) según qué botón se haya tocado en la barra lateral.
- **`src/components/...`**: Cada archivo acá adentro es una "pantalla" o una sección. Si querés cambiar la tabla de alumnos, vas a `Alumnos.tsx`. Si querés cambiar los cobros, vas a `Pagos.tsx`.

¡Éxitos toqueteando el código!
