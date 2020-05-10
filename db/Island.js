const mongoose = require('mongoose');

// Create schema
// User profile schema
const IslandSchema = new mongoose.Schema({
  island_uuid: {
    type: Number,
    required: true
  },
  host_uuid: {
    type: Number,
    required: true
  },
  dodo_code: {
    type: String,
    required: true
  },
  bell_price: {
    type: Number,
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  queue_limit: {
    type: Number,
    required: true
  },
  current_queue: {
    type: Number,
    default: 0
  },
  queue_list: {
    type: [{
      username: String,
      uuid: Number
    }],
    default: []
  },
  visitor_limit: {
    type: Number,
    required: true
  },
  visitor_list: {
    type: [{
      username: String,
      uuid: Number
    }],
    default: []
  },
  curr_index: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    required: true
  },
  fee_required: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Export schema as model
const Island = mongoose.model('Island', IslandSchema);

module.exports = Island;