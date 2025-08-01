const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  bookingId: {
    type: String,
    required: true
  },
  bookingType: {
    type: String,
    enum: ['flight', 'airtaxi'],
    required: true
  },
  requestType: {
    type: String,
    enum: ['modification', 'cancellation'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    default: ''
  },
  adminId: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);
