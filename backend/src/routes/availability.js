const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const controller = require('../controllers/availabilityController');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await controller.getAvailability();
    res.json({ success: true, data });
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const data = await controller.updateAvailability(req.body);
    res.json({ success: true, data });
  })
);

router.post(
  '/overrides',
  asyncHandler(async (req, res) => {
    const data = await controller.addOverride(req.body);
    res.status(201).json({ success: true, data });
  })
);

router.delete(
  '/overrides/:id',
  asyncHandler(async (req, res) => {
    await controller.deleteOverride(req.params.id);
    res.json({ success: true, data: null });
  })
);

router.get(
  '/slots',
  asyncHandler(async (req, res) => {
    const { date, eventTypeId } = req.query;
    const data = await controller.getAvailableSlots(date, eventTypeId);
    res.json({ success: true, data });
  })
);

module.exports = router;

