const service = require('../services/meetingsService');

async function listMeetings(filter) {
  return service.listMeetings(filter);
}

async function getMeetingById(id) {
  return service.getMeetingById(id);
}

async function cancelMeeting(id, body) {
  return service.cancelMeeting(id, body);
}

async function rescheduleMeeting(id, body) {
  return service.rescheduleMeeting(id, body);
}

module.exports = {
  listMeetings,
  getMeetingById,
  cancelMeeting,
  rescheduleMeeting,
};

