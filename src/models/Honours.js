const mongoose = require('mongoose');

const { Schema } = mongoose;

const honoursSchema = new Schema({
  player: {
    type: Schema.Types.ObjectId,
    ref: 'Player',
  },
  honour: {
    type: String,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Honour', honoursSchema);
