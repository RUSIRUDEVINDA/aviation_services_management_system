// Get requests by userEmail
exports.getUserRequestsByEmail = async (req, res, next) => {
  try {
    const email = req.params.email;
    console.log('[Request] Fetching requests for email:', email);
    const requests = await Request.find({ userEmail: { $regex: new RegExp('^' + email + '$', 'i') } }).sort({ createdAt: -1 });
    console.log(`[Request] Found ${requests.length} requests for email:`, email);
    res.status(200).json({
      status: 'success',
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching user requests by email:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user requests by email',
      error: error.message
    });
  }
};
const Request = require('../models/request_model');
const FlightBooking = require('../models/flightBooking_model');
const AirTaxiBooking = require('../models/airtaxi_model');

// Create a new request
exports.createRequest = async (req, res, next) => {
  try {
    const { userId, userEmail, userName, bookingId, bookingType, requestType, reason, details } = req.body;

    // Validate required fields
    if (!userId || !userEmail || !bookingId || !bookingType || !requestType || !reason || !details) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Check if booking exists
    let booking;
    if (bookingType === 'flight') {
      booking = await FlightBooking.findById(bookingId);
    } else if (bookingType === 'airtaxi') {
      booking = await AirTaxiBooking.findById(bookingId);
    }

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Prevent duplicate cancellation requests for bookings that are already cancelled or have a cancellation approved
    if (requestType === 'cancellation') {
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          status: 'error',
          message: 'Booking is already cancelled'
        });
      }
      // Check for existing approved cancellation request
      const existingCancellation = await Request.findOne({
        bookingId,
        requestType: 'cancellation',
        status: 'approved'
      });
      if (existingCancellation) {
        return res.status(400).json({
          status: 'error',
          message: 'Cancellation already approved for this booking'
        });
      }
    }

    // Create new request
    const newRequest = new Request({
      userId,
      userEmail,
      userName,
      bookingId,
      bookingType,
      requestType,
      reason,
      details,
      status: 'pending'
    });

    await newRequest.save();

    res.status(201).json({
      status: 'success',
      message: 'Request created successfully',
      request: newRequest
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create request',
      error: error.message
    });
  }
};

// Get all requests
exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// Get requests by user ID
exports.getUserRequests = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    
    const requests = await Request.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      requests
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user requests',
      error: error.message
    });
  }
};

// Get request by ID
exports.getRequestById = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    res.status(200).json({
      status: 'success',
      request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch request',
      error: error.message
    });
  }
};

// Update request status (approve or reject)
exports.updateRequestStatus = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { status, adminNotes, adminId } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status provided'
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    // Update request
    request.status = status;
    request.adminNotes = adminNotes || '';
    request.adminId = adminId || null;
    request.updatedAt = Date.now();

    await request.save();

    // If request is approved, update the booking status based on request type
    if (status === 'approved') {
      if (request.requestType === 'cancellation') {
        // For cancellation requests, handle based on booking type
        if (request.bookingType === 'flight') {
          await FlightBooking.findByIdAndUpdate(request.bookingId, { status: 'cancelled' });
        } else if (request.bookingType === 'airtaxi') {
          // For air taxi bookings, completely delete the booking from the database
          await AirTaxiBooking.findByIdAndDelete(request.bookingId);
        }
      } else if (request.requestType === 'modification') {
        // For modification requests, mark the booking as pending modification
        if (request.bookingType === 'flight') {
          await FlightBooking.findByIdAndUpdate(request.bookingId, { status: 'pending_modification' });
        } else if (request.bookingType === 'airtaxi') {
          await AirTaxiBooking.findByIdAndUpdate(request.bookingId, { status: 'pending_modification' });
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Request ${status}`,
      request
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update request',
      error: error.message
    });
  }
};

// Delete a request
exports.deleteRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    
    const request = await Request.findByIdAndDelete(requestId);

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Request not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete request',
      error: error.message
    });
  }
};
