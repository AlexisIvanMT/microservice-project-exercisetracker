const mongoose = require('mongoose');

const connectDB = () => {
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('✅ Conectado a la base de datos');
      console.log('Estado:', mongoose.connection.readyState);
    })
    .catch(err => {
      console.error('❌ Error al conectar a la base de datos:', err);
    });
};

module.exports = connectDB;
