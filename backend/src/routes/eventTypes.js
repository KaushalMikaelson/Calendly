const express = require('express');
const { asyncHandler } = require('../middleware/asyncHandler');
const controller = require('../controllers/eventTypesController');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await controller.listEventTypes();
    res.json({ success: true, data });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await controller.createEventType(req.body);
    res.status(201).json({ success: true, data });
  })
);

router.get(
  '/:idOrSlug',
  asyncHandler(async (req, res) => {
    const data = await controller.getEventTypeByIdOrSlug(req.params.idOrSlug);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Event type not found' });
    }
    res.json({ success: true, data });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await controller.updateEventType(req.params.id, req.body);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Event type not found' });
    }
    res.json({ success: true, data });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await controller.deleteEventType(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Event type not found' });
    }
    res.json({ success: true, data });
  })
);

module.exports = router;

