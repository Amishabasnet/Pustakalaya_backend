const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName:    { type: String, required: true, trim: true },
    username:    { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    address:     { type: String, trim: true, default: "" },
    password:    { type: String, required: true, minlength: 6, select: false },
    isActive:    { type: Boolean, default: true },
    lastLogin:   { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id:         this._id,
    fullName:    this.fullName,
    username:    this.username,
    phoneNumber: this.phoneNumber,
    email:       this.email,
    address:     this.address,
    isActive:    this.isActive,
    lastLogin:   this.lastLogin,
    createdAt:   this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
