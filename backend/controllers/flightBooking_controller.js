const flightBooking = require("../models/flightBooking_model");
const { sendBookingConfirmation } = require('../email');

// Get all flight bookings
const getAllflightBookings = async (req, res, next) => {
    try {
        const flightBookings = await flightBooking.find();
        console.log("Retrieved flight bookings:", flightBookings); // Debugging log
        
        if (!flightBookings || flightBookings.length === 0) {
            return res.status(404).json({
                message: "No flight bookings found",
                data: []
            });
        }
        
        return res.status(200).json({
            message: "Flight bookings retrieved successfully",
            flightBookings
        });
    } catch (err) {
        console.error("Error fetching flight bookings:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

// Add a new flight booking
const addflightBookings = async (req, res, next) => {
    try {
        const {
            tripType,
            from,
            to,
            departureDate,
            returnDate,
            passengers,
            flightcabin,
            outboundFlight,
            returnFlight,
            passengersDetails,
            contactInfo,
            seatSelection,
            totalPrice
        } = req.body;

        // Validate return flight details for round-trip bookings
        if (tripType === "Round Trip" && !returnFlight) {
            return res.status(400).json({ message: "Return flight details are required for a round-trip booking." });
        }

        // Validate seat selection for outbound flight
        if (!seatSelection || !seatSelection.outbound || seatSelection.outbound.length !== passengers) {
            return res.status(400).json({
                message: "Each passenger must select a seat for the outbound flight."
            });
        }

        // Validate seat selection for return flight (if round trip)
        if (tripType === "Round Trip" && (!seatSelection.return || seatSelection.return.length !== passengers)) {
            return res.status(400).json({
                message: "Each passenger must select a seat for the return flight in a round trip."
            });
        }

        // Create new flight booking
        const newBooking = new flightBooking({
            tripType,
            from,
            to,
            departureDate,
            returnDate: tripType === "One Way" ? null : returnDate, // Ensure returnDate is null for one-way trips
            passengers,
            flightcabin,
            outboundFlight,
            returnFlight: tripType === "One Way" ? null : returnFlight, // Save only if it's a round trip
            passengersDetails,
            contactInfo,
            seatSelection: {
                outbound: seatSelection.outbound,
                return: tripType === "One Way" ? [] : seatSelection.return
            },
            totalPrice
        });

        const savedBooking = await newBooking.save();
        console.log("Saved booking:", savedBooking); // Debugging log

        // Send confirmation email
        try {
            // Ensure contactInfo has firstName and lastName
            let contactFirstName = '';
            let contactLastName = '';
            if (contactInfo.firstName && contactInfo.lastName) {
                contactFirstName = contactInfo.firstName;
                contactLastName = contactInfo.lastName;
            } else if (contactInfo.name) {
                const nameParts = contactInfo.name.split(' ');
                contactFirstName = nameParts[0];
                contactLastName = nameParts.slice(1).join(' ');
            }

            await sendBookingConfirmation(
                contactInfo.email,
                'Your Flight Booking Confirmation',
                `<!DOCTYPE html>
                <html>
                <head>
                  <meta charset="UTF-8" />
                  <title>Flight Booking Confirmation</title>
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
                      <h1>✈️ AeroX Booking Confirmed</h1>
                      <p>Thank you for choosing AeroX. Your flight is booked!</p>
                    </div>
                    <div class="details">
                      <h2>Booking Summary</h2>
                      <table class="info-table">
                        <tr><td><b>Booking ID:</b></td><td>${savedBooking._id}</td></tr>
                        <tr><td><b>Trip Type:</b></td><td>${tripType}</td></tr>
                        <tr><td><b>From:</b></td><td>${from?.name || from}</td></tr>
                        <tr><td><b>To:</b></td><td>${to?.name || to}</td></tr>
                        <tr><td><b>Departure Date:</b></td><td>${new Date(departureDate).toLocaleString()}</td></tr>
                        ${tripType === "Round Trip" ? `<tr><td><b>Return Date:</b></td><td>${new Date(returnDate).toLocaleString()}</td></tr>` : ''}
                        <tr><td><b>Passengers:</b></td><td>${passengers}</td></tr>
                        <tr><td><b>Cabin Class:</b></td><td>${flightcabin}</td></tr>
                        <tr><td><b>Total Price:</b></td><td>$${totalPrice}</td></tr>
                      </table>
                      <h2>Passenger(s)</h2>
                      <table class="info-table">
                        ${(passengersDetails || []).map(p => `<tr><td>${p.firstName || ''} ${p.lastName || ''}</td><td>Passport: ${p.passportNumber}</td></tr>`).join('')}
                      </table>
                      <h2>Contact Info</h2>
                      <table class="info-table">
                        <tr><td><b>Email:</b></td><td>${contactInfo.email}</td></tr>
                        <tr><td><b>Phone:</b></td><td>${contactInfo.phoneNumber || '-'}</td></tr>
                      </table>
                    </div>
                    <div class="footer">
                      This is your official AeroX flight booking confirmation.<br/>
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
            message: "Flight booking created successfully",
            flightBooking: savedBooking
        });
    } catch (err) {
        console.error("Error creating flight booking:", err);
        return res.status(400).json({
            message: "Failed to create flight booking",
            error: err.message
        });
    }
};

//get by id
const getByID = async (req, res, next) => {
    const id = req.params.id;
    let flightbooking;

    try {
        flightbooking = await flightBooking.findById(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
    //not available user
    if (!flightbooking) {
        return res.status(404).json({ message: "Flight booking not found" });
    }

    return res.status(200).json({ flightbooking });
}

//Update user details
const updateflightBookings = async(req,res,next)=>{
    const id = req.params.id;
    const { tripType, from, to, departureDate, returnDate, passengers, flightcabin, outboundFlight, returnFlight, passengersDetails, contactInfo, seatSelection, totalPrice, modificationReason, modificationDetails } = req.body;
    let flightbooking;

    try{
        // Find the booking
        flightbooking = await flightBooking.findById(id);
        
        if (!flightbooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Check if booking has already been modified
        if (flightbooking.status === 'modified') {
            return res.status(400).json({ 
                message: "This booking has already been modified and cannot be modified again",
                error: "Booking already modified"
            });
        }

        // Update booking details
        flightbooking.tripType = tripType || flightbooking.tripType;
        flightbooking.from = from || flightbooking.from;
        flightbooking.to = to || flightbooking.to;
        flightbooking.departureDate = departureDate || flightbooking.departureDate;
        
        // Handle return date based on trip type
        if (tripType === "One Way") {
            flightbooking.returnDate = null;
            flightbooking.returnFlight = null;
            flightbooking.seatSelection.return = [];
        } else {
            flightbooking.returnDate = returnDate || flightbooking.returnDate;
            flightbooking.returnFlight = returnFlight || flightbooking.returnFlight;
            flightbooking.seatSelection.return = seatSelection?.return || flightbooking.seatSelection.return;
        }

        // Handle passenger count change
        if (passengers !== undefined) {
            flightbooking.passengers = passengers;
            // Adjust seat selections if passenger count changes
            if (seatSelection?.outbound) {
                flightbooking.seatSelection.outbound = seatSelection.outbound;
            } else {
                flightbooking.seatSelection.outbound = flightbooking.seatSelection.outbound.slice(0, passengers);
            }
            
            if (tripType === "Round Trip" && seatSelection?.return) {
                flightbooking.seatSelection.return = seatSelection.return;
            } else if (tripType === "Round Trip") {
                flightbooking.seatSelection.return = flightbooking.seatSelection.return.slice(0, passengers);
            }
        }

        flightbooking.flightcabin = flightcabin || flightbooking.flightcabin;
        flightbooking.outboundFlight = outboundFlight || flightbooking.outboundFlight;
        
        // Update arrays only if provided
        if (passengersDetails) flightbooking.passengersDetails = passengersDetails;
        if (contactInfo) flightbooking.contactInfo = contactInfo;
        
        flightbooking.totalPrice = totalPrice || flightbooking.totalPrice;
        
        // Add modification details
        flightbooking.modificationReason = modificationReason;
        flightbooking.modificationDetails = modificationDetails || '';
        flightbooking.modifiedAt = new Date().toISOString().split('T')[0];
        flightbooking.status = 'modified';

        // Validate dates
        const validateDate = (dateStr) => {
            const date = new Date(dateStr);
            return !isNaN(date.getTime()) && date.toString() !== 'Invalid Date';
        };

        if (!validateDate(flightbooking.departureDate)) {
            return res.status(400).json({ 
                message: "Invalid departure date format",
                error: "departureDate must be in yyyy-MM-dd format"
            });
        }

        if (flightbooking.returnDate && !validateDate(flightbooking.returnDate)) {
            return res.status(400).json({ 
                message: "Invalid return date format",
                error: "returnDate must be in yyyy-MM-dd format"
            });
        }

        // Save the updated booking
        const savedBooking = await flightbooking.save();
        
        return res.status(200).json({ 
            message: "Booking modified successfully",
            flightbooking: savedBooking 
        });
    } catch(err){
        console.error('Error modifying booking:', err);
        return res.status(500).json({ 
            message: "Error modifying booking",
            error: err.message 
        });
    }
};

//delete flightbookings
const deleteflightBookings = async(req,res,next)=>{
    const id = req.params.id;
    let flightbooking; 

    try{
        // Find the booking
        flightbooking = await flightBooking.findById(id);
        
        if (!flightbooking) {
            return res.status(404).json({ 
                message: "Booking not found" 
            });
        }

        // Delete the booking
        await flightBooking.findByIdAndDelete(id);

        return res.status(200).json({ 
            message: "Booking deleted successfully",
            flightbooking 
        });
    } catch(err){
        console.error('Error deleting booking:', err);
        return res.status(500).json({ 
            message: "Error deleting booking",
            error: err.message 
        });
    } 
};

// Get user bookings by email
const getUserBookings = async (req, res, next) => {
    try {
        const { email } = req.params;
        
        // Find bookings where contactInfo.email matches the provided email
        const userBookings = await flightBooking.find({
            'contactInfo.email': { $regex: new RegExp('^' + email + '$', 'i') }
        });
        
        if (!userBookings || userBookings.length === 0) {
            return res.status(404).json({
                message: "No bookings found for this user",
                flightBookings: []
            });
        }
        
        // Log the full booking details for debugging
        console.log('User bookings found:', JSON.stringify(userBookings, null, 2));
        
        return res.status(200).json({
            message: "User bookings retrieved successfully",
            flightBookings: userBookings
        });
    } catch (err) {
        console.error("Error fetching user bookings:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
        console.log('[FlightBooking] Fetching bookings for email:', email);
        console.log(`[FlightBooking] Found ${userBookings.length} bookings for email:`, email);
};

// Cancel a flight booking
const cancelBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;
        
        // Find the booking
        const booking = await flightBooking.findById(bookingId);
        
        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        // Update the booking status to cancelled
        booking.status = 'cancelled';
        booking.cancellationReason = reason;
        booking.cancellationDate = new Date();
        
        // Save the updated booking
        const updatedBooking = await booking.save();
        
        return res.status(200).json({
            message: "Booking cancelled successfully",
            booking: updatedBooking
        });
    } catch (err) {
        console.error("Error cancelling booking:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
};

exports.getAllflightBookings = getAllflightBookings;
exports.addflightBookings = addflightBookings;
exports.getByID = getByID;
exports.updateflightBookings = updateflightBookings;
exports.deleteflightBookings = deleteflightBookings;
exports.getUserBookings = getUserBookings;
exports.cancelBooking = cancelBooking;