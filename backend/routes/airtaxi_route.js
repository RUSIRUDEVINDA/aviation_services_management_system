const express = require("express");
const router = express.Router();

// Import model
const at_model = require("../models/airtaxi_model");

// Import controller
const at_controller = require("../controllers/airtaxi_controller");

// Define routes
router.get("/", at_controller.getAllAirTaxiBookings);
router.post("/", at_controller.addAirTaxiBooking);
router.get("/:id", at_controller.getAirTaxiBookingById);
router.put("/:id", at_controller.updateAirTaxiBooking);
router.delete("/:id", at_controller.cancelAirTaxiBooking);
router.get("/user/:email", at_controller.getUserAirTaxiBookings);
// Admin: get all air taxi bookings
router.get("/admin/all", at_controller.getAllAirTaxiBookings);

// Export router
module.exports = router;