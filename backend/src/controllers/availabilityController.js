const availabilityService = require('../services/availabilityService');
const { getAvailableSlots } = require('../services/slotsService');

async function getAvailability() {
  return availabilityService.getAvailability();
}

async function updateAvailability(body) {
  return availabilityService.updateAvailability(body);
}

async function addOverride(body) {
  return availabilityService.addOverride(body);
}

async function deleteOverride(id) {
  await availabilityService.deleteOverride(id);
}

async function getAvailableSlotsController(date, eventTypeId) {
  return getAvailableSlots(date, eventTypeId);
}

module.exports = {
  getAvailability,
  updateAvailability,
  addOverride,
  deleteOverride,
  getAvailableSlots: getAvailableSlotsController,
};

