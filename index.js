const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const mongoose = require('mongoose'); // para conectarse a la base de datos
const Schema = mongoose.Schema; // para crear el esquema de la base de datos

// ==============================
// Conectar a la base de datos
// mongoose.connect() es un método que se utiliza para conectarse a la base de datos  
// ==============================
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Conectado a la base de datos');
    console.log('Estado:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:', err);
  });


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// ==============================
// Esquema de la base de datos de los usuarios
// ==============================
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  exercises: [{
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

// ==============================
// Se crea un nuevo usuario con el curpopo de la petición
// solicita el nombre de usuario
// ==============================
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = new User({ username });

  newUser.save()
    .then(user => {
      res.json({ username: user.username, _id: user._id });
    })
    .catch(err => {
      res.status(400).json({ error: 'Error creating user' });
    });
});

app.get('/api/users', (req, res) => {
  User.find({}, { __v: 0 })
    .then(users => {
      res.json(users);
    })
    .catch(err => {
      res.status(400).json({ error: 'Error fetching users' });
    });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();
  const exercise = { description, duration: Number(duration), date: exerciseDate };
  User.findByIdAndUpdate(userId, { $push: { exercises: exercise } }, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        _id: user._id,
        username: user.username,
        date: exerciseDate.toDateString(),
        duration: exercise.duration,
        description: exercise.description
      });
    })
    .catch(err => {
      res.status(400).json({ error: 'Error adding exercise' });
    });  
}
);

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  User.findById(userId) 

    .then(user => { 
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let exercises = user.exercises;

      if (from) {
        exercises = exercises.filter(exercise => new Date(exercise.date) >= new Date(from));
      }
      if (to) {
        exercises = exercises.filter(exercise => new Date(exercise.date) <= new Date(to));
      }
      if (limit) {
        exercises = exercises.slice(0, limit);
      }

      const log = exercises.map(exercise => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }));

      res.json({
        _id: user._id,
        username: user.username,
        count: log.length,
        log
      });
    })
    .catch(err => { 
      res.status(400).json({ error: 'Error fetching user logs' });
    });
}     
);




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
