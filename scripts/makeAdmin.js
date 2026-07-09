// Usage: node scripts/makeAdmin.js <email>
const mongoose = require("mongoose");
const config   = require("../config/env");
const User     = require("../models/User");

async function makeAdmin(email) {
  if (!email) {
    console.error("Usage: node scripts/makeAdmin.js <email>");
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongoUri);

    const user = await User.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
    } else {
      console.log(`${user.email} promoted to admin.`);
    }
  } catch (err) {
    console.error("Failed to promote user:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin(process.argv[2]);
