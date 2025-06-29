// Script to check existing users in the database
// Run this with: node check-users.js

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema (copy from your backend)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  type: {
    type: String,
    enum: ["Student", "Teacher", "Admin"],
    default: "Student",
  },
}, {
  timestamps: true,
});

const User = mongoose.model("user", userSchema);

async function checkUsers() {
  try {
    console.log('Checking existing users...\n');
    
    const users = await User.find({}).select('name email type createdAt');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
      console.log('You can register a new user through the frontend or use the test script.');
    } else {
      console.log(`Found ${users.length} user(s):`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Type: ${user.type}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    // Also check for admin hardcoded credentials
    console.log('Hardcoded admin credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin@123');
    console.log('(These are hardcoded in the backend and don\'t exist in the database)');
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers(); 