const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const flight_booking = new Schema({
  tripType: {
    type: String,
    enum: ["Round Trip", "One Way"],
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        return this.tripType === "One Way" ? value === null : !!value;
      },
      message: "Return date is required for round-trip flights.",
    },
  },
  passengers: {
    type: Number,
    required: true,
    min: 1,
  },
  flightcabin: {
    type: String,
    required: true,
  },

  // Outbound Flight Details
  outboundFlight: {
    airline: { type: String, required: true },
    flightNumber: { type: String, required: true },
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    price: { type: Number, required: true },
  },

  // Return Flight Details (Only for Round Trip)
  returnFlight: {
    airline: { type: String, required: function () { return this.tripType === "Round Trip"; }},
    flightNumber: { type: String, required: function () { return this.tripType === "Round Trip"; }},
    departureTime: { type: String, required: function () { return this.tripType === "Round Trip"; }},
    arrivalTime: { type: String, required: function () { return this.tripType === "Round Trip"; }},
    price: { type: Number, required: function () { return this.tripType === "Round Trip"; }},
  },

  // Passenger Details
  passengersDetails: [
    {
      _id: false,
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      nationality: { type: String, required: true },
      passportNumber: { type: String, required: true, minlength: 6, maxlength: 9 },
      specialRequests: { type: String },
    },
  ],

  // Contact Information
  contactInfo: {
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },

  // Seat Selection (Validation based on passenger count)
  seatSelection: {
    outbound: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.length === this.passengers;
        },
        message: "Outbound flight seats must match the number of passengers.",
      },
      required: true,
    },
    return: {
      type: [String],
      validate: {
        validator: function (value) {
          return this.tripType === "One Way" ? value.length === 0 : value.length === this.passengers;
        },
        message: "Return flight seats must match the number of passengers.",
      },
      required: function () { return this.tripType === "Round Trip"; },
    },
  },

  totalPrice: { type: Number, required: true },

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
  }
});

// Middleware: Auto-set returnFlight to null if tripType is "One Way"
flight_booking.pre("save", function (next) {
  if (this.tripType === "One Way") {
    this.returnDate = null;
    this.returnFlight = null;
    this.seatSelection.return = [];
  }
  next();
});

module.exports = mongoose.model("flightBooking_model", flight_booking);
