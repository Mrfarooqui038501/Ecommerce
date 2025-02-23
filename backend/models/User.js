const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: false, 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
}, {
  timestamps: true,
});


UserSchema.statics.generateUserId = async function () {
  try {
    const count = await this.countDocuments();
    const timestamp = Date.now().toString().slice(-4);
    const userId = `USER${count + 1}${timestamp}`;
    console.log('Generated userId:', userId);
    return userId;
  } catch (error) {
    throw new Error('Failed to generate userId: ' + error.message);
  }
};


UserSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log('Password hashed for user:', this.email);
    }
    next();
  } catch (error) {
    console.error('Pre-save middleware error:', error);
    next(error);
  }
});


UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed: ' + error.message);
  }
};

module.exports = mongoose.model('User', UserSchema);