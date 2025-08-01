const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request_controller');

// Create a new request
router.post('/', requestController.createRequest);

// Get all requests
router.get('/', requestController.getAllRequests);

// Get requests by user ID
// Get requests by userId (legacy)
router.get('/user/:userId', requestController.getUserRequests);

// Get requests by userEmail (new)
router.get('/user/email/:email', requestController.getUserRequestsByEmail);

// Get request by ID
router.get('/:id', requestController.getRequestById);

// Update request status
router.patch('/:id', requestController.updateRequestStatus);

// Delete a request
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
