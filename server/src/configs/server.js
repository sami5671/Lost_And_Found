require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const authRoutes = require("../routes/authRoutes");
const itemRoutes = require("../routes/itemRoutes");
const errorMiddleware = require("../middlewares/errorMiddleware");

const app = express();

// Middlewares
app.use(helmet());

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",") 
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const dbURI = process.env.NODE_ENV === "production" 
  ? process.env.PROD_DATABASE_URL 
  : process.env.DEV_DATABASE_URL || process.env.PROD_DATABASE_URL;

if (!dbURI) {
  console.error("Database connection URL is missing in environment variables!");
} else {
  mongoose
    .connect(dbURI)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

// Mount Authentication Routes
app.use("/", authRoutes);
app.use("/", itemRoutes);

// Base route for health check
app.get("/", (req, res) => {
  res.json({ message: "Lost and Found API server is running" });
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
