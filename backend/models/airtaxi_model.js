const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const air_taxi_booking = new Schema({
  // Booking Details
  pickup: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    code: { type: String, required: true }
  },
  destination: {
    name: { type: String, required: true },
    city: { type: String, required: true },
    code: { type: String, required: true }
  },
  dateTime: {
    type: Date,
    required: true
  },
  passengers: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  
  // Selected Taxi Model
  taxiModel: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    description: { type: String },
    price: { type: Number, required: true }
  },
  
  // Contact Details
  contactName: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  
  // Additional Details
  specialRequests: {
    type: String,
    default: ""
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Payment Information
  paymentMethod: {
    type: { type: String, required: true },
    //cardNumber: { type: String },
    transactionId: { type: String }
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "completed", "modified"],
    default: "confirmed"
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  modifiedAt: {
    type: Date
  },
  
  // Cancellation Details
  cancellationReason: {
    type: String
  },
  cancellationDate: {
    type: Date
  }
});

module.exports = mongoose.model("airtaxi_model", air_taxi_booking);