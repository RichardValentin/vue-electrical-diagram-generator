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

// Import the Composant model
const Composant = require('./models/Composant');

// Route pour obtenir tous les composants
app.get('/api/components', async (req, res) => {
  try {
    console.log('Fetching components from MongoDB');
    const components = await Composant.find();
    console.log('Components fetched successfully');
    res.json(components);
  } catch (err) {
    console.error('Error fetching components', err);
    res.status(500).json({ message: 'Error fetching components' });
  }
});

// Route pour créer un nouveau composant
app.post('/api/components', async (req, res) => {
  const composant = new Composant(req.body);
  try {
    await composant.save();
    res.status(201).json(composant);
  } catch (err) {
    console.error('Error saving composant', err);
    res.status(400).json({ message: err.message });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/electrical-diagram', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Add this catch-all route at the end
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.url} Not found` });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
