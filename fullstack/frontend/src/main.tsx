import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'   /*createRoot es una funcion que se encarga de crear el punto de montaje de la aplicacion en el DOM*/
import './index.css'    /*Se importa el archivo CSS principal*/
import App from './App.tsx'    /*Se importa el componente principal*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>  {/*StrictMode duplica la ejecucion de ciertos componentes para detectar errores en el codigo*/}
    <App />   {/*App es el componente principal*/}
  </StrictMode>,  
)
