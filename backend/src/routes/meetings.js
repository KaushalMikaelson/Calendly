const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const controller = require('../controllers/meetingsController');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { filter } = req.query;
    const data = await controller.listMeetings(filter || 'all');
    res.json({ success: true, data });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await controller.getMeetingById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.json({ success: true, data });
  })
);

router.put(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const data = await controller.cancelMeeting(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.json({ success: true, data });
  })
);

router.put(
  '/:id/reschedule',
  asyncHandler(async (req, res) => {
    const data = await controller.rescheduleMeeting(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }
    res.json({ success: true, data });
  })
);

module.exports = router;

