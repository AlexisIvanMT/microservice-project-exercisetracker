const User = require('../models/User');

exports.createUser = (req, res) => {
  const username = req.body.username;
  const newUser = new User({ username });
  newUser.save()
    .then(user => {
      res.json({ username: user.username, _id: user._id });
    })
    .catch(() => {
      res.status(400).json({ error: 'Error creating user' });
    });
};

exports.getUsers = (req, res) => {
  User.find({}, { __v: 0 })
    .then(users => {
      res.json(users);
    })
    .catch((err) => {
      res.status(400).json({ error: 'Error fetching users', details: err.message });
    });
};

exports.addExercise = (req, res) => {
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
    .catch(() => {
      res.status(400).json({ error: 'Error adding exercise' });
    });
};

exports.getUserLogs = (req, res) => {
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
    .catch(() => {
      res.status(400).json({ error: 'Error fetching user logs' });
    });
};
