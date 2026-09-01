import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'   /*createRoot is a function responsible for creating the mount point for the application in the DOM*/
import './index.css'    /*Imports the main CSS file*/
import App from './App.tsx'    /*Imports the main component*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>  {/*StrictMode duplica la ejecucion de ciertos componentes para detectar errores en el codigo*/}
    <App />   {/*App es el componente principal*/}
  </StrictMode>,  
)
