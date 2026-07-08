require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  delivery: {
    standard: { charge: 120, label: "Standard delivery: 2–4 days", estimate: "2–4 days" },
    express:  { charge: 200, label: "Express delivery: 1 day",     estimate: "1 day"    },
  },
  freeDeliveryOver: 1500,
};

module.exports = config;
