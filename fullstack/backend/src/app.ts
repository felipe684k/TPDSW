
import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Fijate cómo ahora le aclaramos a TS qué tipo de dato son req y res
app.get('/', (req: Request, res: Response) => {
    res.json({ 
        mensaje: "¡El Backend ahora funciona 100% con TypeScript! 🚀" 
    });
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en: http://localhost:${PORT}`);
});