const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const garzonesRoutes = require('./routes/garzones');
app.use('/garzones', garzonesRoutes);

const tablesRoutes = require('./routes/tables');  
app.use('/tables', tablesRoutes);                

const productsRoutes = require('./routes/products');
app.use('/products', productsRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});
