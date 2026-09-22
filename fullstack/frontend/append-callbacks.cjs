const fs = require('fs');
const filePath = 'C:\\Users\\Francisco\\.gemini\\antigravity\\brain\\c3a2a05c-7ccb-48d9-b8f1-2a873ac57316\\conceptos_react.md';

const newContent = `
## 8. Los Callbacks: Comunicación del Hijo al Padre

En React, los datos normalmente fluyen hacia abajo (del Padre al Hijo). ¿Pero cómo hace un Hijo (\`<Login>\`) para avisarle al Padre (\`App.tsx\`) que algo importante pasó (por ejemplo, que el usuario se logueó)? 

Usamos **Callbacks**.

El Padre **crea una función sin nombre (anónima) pero NO la ejecuta**. Se la envía como un paquete de instrucciones al Hijo:

\`\`\`javascript
// App.tsx (El Padre)
<Login onLogin={(role, data) => {
  // Estas instrucciones están "dormidas"
  setUserRole(role);
  setUserData(data);
}} />
\`\`\`

Fijate que en \`App.tsx\` las variables \`role\` y \`data\` no tienen ningún valor todavía. Son solo parámetros vacíos esperando ser llenados. El Padre simplemente dice: *"Tomá este control remoto. Cuando decidas apretarlo, lo primero que me mandes lo voy a bautizar 'role', y lo segundo 'data'"*.

El Hijo recibe ese control remoto, hace todo el trabajo sucio (hablar con la base de datos, validar la contraseña), y **es el Hijo quien aprieta el gatillo y le inyecta los valores reales**:

\`\`\`javascript
// Login.tsx (El Hijo)
const respuestaDelServidor = await fetch('...');
const datosReales = await respuestaDelServidor.json();

// ¡Acá el hijo ejecuta la función y le manda los datos al Padre!
onLogin(datosReales.role, datosReales);
\`\`\`

En el milisegundo en que el Hijo hace \`onLogin(...)\`, esa información viaja hacia arriba, las variables vacías del Padre se llenan con los datos reales, y el código del Padre por fin se ejecuta. Es la forma perfecta de separar responsabilidades.
`;

fs.appendFileSync(filePath, newContent, 'utf8');
console.log('Appended Callbacks section');
