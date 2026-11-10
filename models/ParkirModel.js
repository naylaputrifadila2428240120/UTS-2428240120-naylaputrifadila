const mongoose = require('mongoose');

// Subdocument Schema untuk 'waktu' (tanpa _id)
const WaktuSchema = new mongoose.Schema({
  masuk: {
    type: String
  },
  keluar: {
    type: String
  }
}, { _id: false });

// Main Schema untuk 'Parkir'
const ParkirSchema = new mongoose.Schema({
  noTiket: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nopol: {
    type: String,
    required: true,
    trim: true
  },
  tarif: {
    type: Number,
    required: true,
    min: 0
  },
  jenis: {
    type: String,
    required: true,
    trim: true
  },
  waktu: WaktuSchema,
  areaParkirId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AreaParkir',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Parkir', ParkirSchema);