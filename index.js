const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Conexión modular a la base de datos
const connectDB = require('./config/db');
connectDB();

app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Usar rutas modulares
const userRoutes = require('./routes/users');
app.use(userRoutes);

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
