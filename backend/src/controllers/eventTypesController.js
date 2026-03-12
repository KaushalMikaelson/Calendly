const service = require('../services/eventTypesService');

async function listEventTypes() {
  return service.listEventTypes();
}

async function createEventType(body) {
  return service.createEventType(body);
}

async function getEventTypeByIdOrSlug(idOrSlug) {
  return service.getEventTypeByIdOrSlug(idOrSlug);
}

async function updateEventType(id, body) {
  return service.updateEventType(id, body);
}

async function deleteEventType(id) {
  return service.deleteEventType(id);
}

module.exports = {
  listEventTypes,
  createEventType,
  getEventTypeByIdOrSlug,
  updateEventType,
  deleteEventType,
};

