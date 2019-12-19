const mongoose = require('mongoose')

const giftSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    // required: true
  },
  // owner: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: false
  // }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gift', giftSchema)
