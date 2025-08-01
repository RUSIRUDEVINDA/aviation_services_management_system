const express = require("express");
const router = express.Router();

//insert model
const fb_model = require("../models/flightBooking_model");

//insert fb controller
const fb_controller = require("../controllers/flightBooking_controller");

router.get("/", fb_controller.getAllflightBookings);
router.post("/", fb_controller.addflightBookings);
router.get("/:id", fb_controller.getByID);
router.put("/:id", fb_controller.updateflightBookings);
router.delete("/:id", fb_controller.deleteflightBookings);
router.get("/user/:email", fb_controller.getUserBookings); // New endpoint to get user bookings
// Admin: get all flight bookings
router.get("/admin/all", fb_controller.getAllflightBookings);

//export
module.exports = router;