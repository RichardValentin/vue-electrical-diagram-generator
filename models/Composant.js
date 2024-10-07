const mongoose = require('mongoose');

const composantSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'L\'ID doit contenir uniquement des lettres, chiffres et tirets']
  },
  designation: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'La désignation doit contenir au moins 2 caractères'],
    maxlength: [100, 'La désignation ne peut pas dépasser 100 caractères']
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: [
        'disjoncteur',
        'interrupteur',
        'contacteur',
        'sectionneur',
        'relais',
        'fusible',
        'autre'
      ],
      message: '{VALUE} n\'est pas un type valide'
    }
  },
  nombrePoles: {
    type: Number,
    required: true,
    min: [1, 'Le nombre de pôles doit être au minimum 1'],
    max: [4, 'Le nombre de pôles ne peut pas dépasser 4'],
    validate: {
      validator: Number.isInteger,
      message: 'Le nombre de pôles doit être un nombre entier'
    }
  },
  calibre: {
    valeur: {
      type: Number,
      required: true,
      min: [0, 'Le calibre doit être positif']
    },
    unite: {
      type: String,
      required: true,
      enum: {
        values: ['A', 'mA', 'kA'],
        message: '{VALUE} n\'est pas une unité valide pour le calibre'
      },
      default: 'A'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour améliorer les performances des recherches
composantSchema.index({ id: 1 });
composantSchema.index({ type: 1 });
composantSchema.index({ 'calibre.valeur': 1 });

// Propriété virtuelle pour obtenir le calibre formaté
composantSchema.virtual('calibreFormate').get(function() {
  return `${this.calibre.valeur}${this.calibre.unite}`;
});

// Méthode statique pour trouver les composants par plage de calibre
composantSchema.statics.findByCalibreRange = function(min, max, unite = 'A') {
  return this.find({
    'calibre.unite': unite,
    'calibre.valeur': { $gte: min, $lte: max }
  });
};

// Middleware pour mettre à jour la date de modification
composantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode d'instance pour vérifier si le calibre est supérieur à une valeur donnée
composantSchema.methods.isCalibreSuperieur = function(valeur, unite = 'A') {
  if (this.calibre.unite === unite) {
    return this.calibre.valeur > valeur;
  }
  // Conversion si les unités sont différentes
  const conversion = {
    'mA': 0.001,
    'A': 1,
    'kA': 1000
  };
  const valeurNormalisee = valeur * conversion[unite];
  const calibreNormalise = this.calibre.valeur * conversion[this.calibre.unite];
  return calibreNormalise > valeurNormalisee;
};

const Composant = mongoose.model('Composant', composantSchema);

module.exports = Composant;
