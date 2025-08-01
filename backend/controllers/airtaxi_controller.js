const airTaxiBooking = require("../models/airtaxi_model");
const { sendBookingConfirmation } = require('../email');

// Get all air taxi bookings
const getAllAirTaxiBookings = async (req, res, next) => {
    try {
        const bookings = await airTaxiBooking.find();
        console.log("Retrieved air taxi bookings:", bookings); // Debugging log
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                message: "No air taxi bookings found",
                data: []
            });
        }
        
        return res.status(200).json({
            message: "Air taxi bookings retrieved successfully",
            bookings
        });
    } catch (err) {
        console.error("Error fetching air taxi bookings:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

// Add a new air taxi booking
const addAirTaxiBooking = async (req, res, next) => {
    try {
        const {
            pickup,
            destination,
            dateTime,
            passengers,
            taxiModel,
            contactName,
            contactPhone,
            contactEmail,
            specialRequests,
            totalAmount,
            paymentMethod
        } = req.body;

        // Validate required fields
        if (!pickup || !destination || !dateTime || !passengers || !taxiModel || !contactName || !contactPhone || !contactEmail || !totalAmount) {
            return res.status(400).json({ 
                message: "Missing required fields for air taxi booking",
                error: "Validation error"
            });
        }

        // Create new air taxi booking
        const newBooking = new airTaxiBooking({
            pickup,
            destination,
            dateTime,
            passengers,
            taxiModel,
            contactName,
            contactPhone,
            contactEmail,
            specialRequests: specialRequests || "",
            totalAmount,
            paymentMethod,
            status: "confirmed",
            createdAt: new Date()
        });

        const savedBooking = await newBooking.save();
        console.log("Saved air taxi booking:", savedBooking); // Debugging log

        // Split contactName into firstName and lastName
        const contactNames = contactName.split(' ');
        const contactFirstName = contactNames[0];
        const contactLastName = contactNames.slice(1).join(' ');

        // Fetch taxi model name for confirmation email
        let taxiModelName = '';
        if (taxiModel && typeof taxiModel === 'object') {
            taxiModelName = taxiModel.model || taxiModel.name || '';
        } else {
            taxiModelName = taxiModel;
        }

        // Send confirmation email
        try {
            await sendBookingConfirmation(
                contactEmail,
                'Your AirTaxi Booking Confirmation',
                `<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8" />
                  <title>Air Taxi Booking Confirmation</title>
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; color: #222; margin: 0; padding: 0; }
                    .container { max-width: 600px; background: #fff; margin: 32px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                    .header { background: #003366; color: #fff; padding: 32px 24px 16px 24px; text-align: center; }
                    .header h1 { margin: 0 0 8px 0; font-size: 2.1rem; letter-spacing: 1px; }
                    .header p { margin: 0; font-size: 1.1rem; }
                    .details { padding: 32px 24px 24px 24px; }
                    .details h2 { color: #003366; font-size: 1.2rem; margin-bottom: 12px; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
                    .info-table td { padding: 8px 4px; font-size: 1rem; }
                    .info-table tr:nth-child(even) { background: #f3f6fa; }
                    .footer { background: #f9fafb; color: #888; text-align: center; font-size: 0.95rem; padding: 18px 20px; border-top: 1px solid #eee; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🚁 AeroX Air Taxi Confirmed</h1>
                      <p>Your air taxi booking is confirmed. Thank you for choosing AeroX!</p>
                    </div>
                    <div class="details">
                      <h2>Booking Summary</h2>
                      <table class="info-table">
                        <tr><td><b>Booking ID:</b></td><td>${savedBooking._id}</td></tr>
                        <tr><td><b>Pickup:</b></td><td>${pickup?.name} (${pickup?.city})</td></tr>
                        <tr><td><b>Destination:</b></td><td>${destination?.name} (${destination?.city})</td></tr>
                        <tr><td><b>Date & Time:</b></td><td>${new Date(dateTime).toLocaleString()}</td></tr>
                        <tr><td><b>Passengers:</b></td><td>${passengers}</td></tr>
                        <tr><td><b>Taxi Model:</b></td><td>${taxiModelName}</td></tr>
                        <tr><td><b>Total Amount:</b></td><td>$${totalAmount}</td></tr>
                      </table>
                      <h2>Contact Info</h2>
                      <table class="info-table">
                        <tr><td><b>Name:</b></td><td>${contactFirstName} ${contactLastName}</td></tr>
                        <tr><td><b>Email:</b></td><td>${contactEmail}</td></tr>
                        <tr><td><b>Phone:</b></td><td>${contactPhone}</td></tr>
                      </table>
                      ${specialRequests ? `<h2>Special Requests</h2><div style="margin-bottom:16px;">${specialRequests}</div>` : ''}
                    </div>
                    <div class="footer">
                      This is your official AeroX air taxi booking confirmation.<br/>
                      Please keep this email for your records.<br/>
                      For questions, reply to this email.<br/>
                      &copy; ${new Date().getFullYear()} AeroX
                    </div>
                  </div>
                </body>
                </html>`
            );
        } catch (emailErr) {
            console.error('Failed to send confirmation email:', emailErr);
        }

        return res.status(201).json({
            message: "Air taxi booking created successfully",
            booking: savedBooking
        });
    } catch (err) {
        console.error("Error creating air taxi booking:", err);
        return res.status(400).json({
            message: "Failed to create air taxi booking",
            error: err.message
        });
    }
};

// Get booking by ID
const getAirTaxiBookingById = async (req, res, next) => {
    const id = req.params.id;
    let booking;

    try {
        booking = await airTaxiBooking.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
    
    if (!booking) {
        return res.status(404).json({ message: "Air taxi booking not found" });
    }

    return res.status(200).json({ booking });
};

// Get user bookings by email
const getUserAirTaxiBookings = async (req, res, next) => {
    const email = req.params.email;
    
    try {
        const bookings = await airTaxiBooking.find({ "contactEmail": { $regex: new RegExp('^' + email + '$', 'i') } });
        
        if (!bookings || bookings.length === 0) {
            return res.status(404).json({
                message: "No bookings found for this user",
                data: []
            });
        }
        
        return res.status(200).json({
            message: "User bookings retrieved successfully",
            bookings
        });
    } catch (err) {
        console.error("Error fetching user bookings:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
        console.log('[AirTaxiBooking] Fetching bookings for email:', email);
        console.log(`[AirTaxiBooking] Found ${bookings.length} bookings for email:`, email);
};

// Update air taxi booking
const updateAirTaxiBooking = async (req, res, next) => {
    const id = req.params.id;
    const updateData = req.body;
    let booking;

    try {
        // Find the booking
        booking = await airTaxiBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking has already been modified or cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({ 
                message: "This booking has been cancelled and cannot be modified",
                error: "Booking cancelled"
            });
        }

        // Update booking fields
        Object.keys(updateData).forEach(key => {
            booking[key] = updateData[key];
        });

        // Mark as modified
        booking.status = 'modified';
        booking.modifiedAt = new Date();

        const updatedBooking = await booking.save();
        
        return res.status(200).json({
            message: "Air taxi booking updated successfully",
            booking: updatedBooking
        });
    } catch (err) {
        console.error("Error updating air taxi booking:", err);
        return res.status(400).json({
            message: "Failed to update air taxi booking",
            error: err.message
        });
    }
};

// Cancel air taxi booking
const cancelAirTaxiBooking = async (req, res, next) => {
    const id = req.params.id;
    const { reason } = req.body;
    let booking;

    try {
        booking = await airTaxiBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: "This booking is already cancelled" });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'No reason provided';
        booking.cancellationDate = new Date();

        const updatedBooking = await booking.save();
        
        return res.status(200).json({
            message: "Air taxi booking cancelled successfully",
            booking: updatedBooking
        });
    } catch (err) {
        console.error("Error cancelling air taxi booking:", err);
        return res.status(500).json({
            message: "Failed to cancel air taxi booking",
            error: err.message
        });
    }
};

// Export all controller functions
module.exports = {
    getAllAirTaxiBookings,
    addAirTaxiBooking,
    getAirTaxiBookingById,
    getUserAirTaxiBookings,
    updateAirTaxiBooking,
    cancelAirTaxiBooking
};