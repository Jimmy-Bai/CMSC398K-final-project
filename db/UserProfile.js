const mongoose = require('mongoose');

// Create schema
// User profile schema
const UserProfileSchema = new mongoose.Schema({  
  username: {
    type: String,
    required: true
  },
  uuid: {
    type: Number,
    required: true
  },
  island_hosted: {
    type: Number,
    default: 0
  },
  island_visited: {
    type: Number,
    default: 0
  },
  visit_island_list: {
    type: [Number],
    default: []
  },
  host_island_list: {
    type: [Number],
    default: []
  }
});

// Export schema as model
const UserProfile = mongoose.model('UserProfile', UserProfileSchema);

module.exports = UserProfile;