const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

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
mongoose.connect('mongodb://localhost:27017/electrical-diagram', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connexion à MongoDB réussie');
}).catch(err => {
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

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});