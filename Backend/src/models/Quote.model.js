const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    quote: {
      type: String,
      required: [true, 'Quote text is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    }
  },
  {
    timestamps: true,
  }
);

const Quote = mongoose.model('Quote', quoteSchema);
module.exports = Quote;
