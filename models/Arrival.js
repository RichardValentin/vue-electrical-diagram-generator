const mongoose = require('mongoose');

const arrivalSchema = new mongoose.Schema({
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
      values: ['arrival'],
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
arrivalSchema.index({ id: 1 });
arrivalSchema.index({ type: 1 });
arrivalSchema.index({ 'calibre.valeur': 1 });

// Propriété virtuelle pour obtenir le calibre formaté
arrivalSchema.virtual('calibreFormate').get(function() {
  return `${this.calibre.valeur}${this.calibre.unite}`;
});

// Middleware pour mettre à jour la date de modification
arrivalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Arrival = mongoose.model('Arrival', arrivalSchema);

module.exports = Arrival;
