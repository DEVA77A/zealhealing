const mongoose = require('mongoose');

const classSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Tarot',
    },
    type: {
      type: String,
      required: true,
      enum: ['voice', 'video'],
    },
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '/tarot.png',
    },
    status: {
      type: String,
      enum: ['Active', 'Disabled'],
      default: 'Active',
    },
    totalSales: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ClassModel = mongoose.model('Class', classSchema);
module.exports = ClassModel;
