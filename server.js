const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Add this logging middleware
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});

// Add a root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the Electrical Diagram Generator API" });
});

// Définir un schéma pour les composants
const componentSchema = new mongoose.Schema({
  name: String,
  type: String,
  characteristics: String,
  column: Number,
  row: Number,
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Component' }]
});

// Définir un modèle pour les composants
const Component = mongoose.model('Component', componentSchema);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/electrical-diagram')
  .then(() => {
    console.log('Connexion à MongoDB réussie');
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB', err);
  });

// Route pour obtenir tous les composants
app.get('/api/components', async (req, res) => {
  try {
    const components = await Component.find().populate('children');
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route pour créer un nouveau composant
app.post('/api/components', async (req, res) => {
  const component = new Component(req.body);
  try {
    await component.save();
    res.status(201).json(component);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add this catch-all route at the end
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.url} Not found` });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});