// Creates a new admin account, or promotes+resets the password of an existing
// account with the same email. Unlike makeAdmin.js (which only promotes an
// already-existing user), this works even if no account exists yet.
//
// Usage: node scripts/createAdmin.js <email> <password> <fullName> <phoneNumber>
// Example: node scripts/createAdmin.js admin@pustakalaya.com 987456 "Admin User" 9800000000

const mongoose = require("mongoose");
const config = require("../config/env");
const User = require("../models/User");

async function createAdmin(email, password, fullName, phoneNumber) {
  if (!email || !password) {
    console.error("Usage: node scripts/createAdmin.js <email> <password> [fullName] [phoneNumber]");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);

    const normalizedEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (user) {
      user.role = "admin";
      user.isActive = true;
      user.password = password; // re-hashed by the pre-save hook
      await user.save();
      console.log(`Existing account ${user.email} promoted to admin and password reset.`);
    } else {
      user = await User.create({
        fullName: fullName || "Admin User",
        phoneNumber: phoneNumber || "0000000000",
        email: normalizedEmail,
        password,
        role: "admin",
      });
      console.log(`Admin account created: ${user.email}`);
    }
  } catch (err) {
    console.error("Failed to create/promote admin:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

const [, , email, password, fullName, phoneNumber] = process.argv;
createAdmin(email, password, fullName, phoneNumber);
