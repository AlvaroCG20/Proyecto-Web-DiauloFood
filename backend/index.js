const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
