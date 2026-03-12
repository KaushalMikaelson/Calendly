const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const controller = require('../controllers/bookingsController');

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await controller.createBooking(req.body);
    res.status(201).json({ success: true, data });
  })
);

router.get(
  '/cancel/:token',
  asyncHandler(async (req, res) => {
    const data = await controller.getBookingByCancelToken(req.params.token);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data });
  })
);

router.put(
  '/cancel/:token',
  asyncHandler(async (req, res) => {
    const data = await controller.cancelBookingByToken(req.params.token, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data });
  })
);

router.get(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const data = await controller.getBookingByRescheduleToken(req.params.token);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data });
  })
);

router.put(
  '/reschedule/:token',
  asyncHandler(async (req, res) => {
    const data = await controller.rescheduleByToken(req.params.token, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, data });
  })
);

module.exports = router;

