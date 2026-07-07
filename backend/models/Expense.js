const mongoose = require('mongoose');

const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Travel',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

expenseSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Expense', expenseSchema);
