//pass -> 1234 username -> admin
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const flightRouter = require("./routes/flightBooking_route");
const airTaxiRouter = require("./routes/airtaxi_route");
const requestRouter = require("./routes/request_route");

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

app.use("/flightBooking", flightRouter);
app.use("/airTaxiBooking", airTaxiRouter);
app.use("/requests", requestRouter);

// Error logging middleware for debugging
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: err.stack
  });
});


const MONGODB_USER = process.env.MONGODB_USER || "admin";
const MONGODB_PASS = process.env.MONGODB_PASS || "IT23286696";
const MONGODB_DB = process.env.MONGODB_DB || "test";
const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@airportmanagementsystem.8nzgv.mongodb.net/${MONGODB_DB}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3001, () => {
      console.log('Server is running on port 3001');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });