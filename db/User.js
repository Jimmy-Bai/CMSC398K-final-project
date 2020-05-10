const mongoose = require('mongoose');

// Create schema
const UserSchema = new mongoose.Schema({  
  email: {
    type: String,
    required: true
  },
  email_lower: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  username_lower: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  uuid: {
    type: Number,
    required: true
  }
});

// Export schema as model
const User = mongoose.model('User', UserSchema);

module.exports = User;