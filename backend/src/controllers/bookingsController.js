const bookingsService = require('../services/bookingsService');

async function createBooking(body) {
  return bookingsService.createBooking(body);
}

async function getBookingByCancelToken(token) {
  return bookingsService.getBookingByCancelToken(token);
}

async function cancelBookingByToken(token, body) {
  return bookingsService.cancelBookingByToken(token, body);
}

async function getBookingByRescheduleToken(token) {
  return bookingsService.getBookingByRescheduleToken(token);
}

async function rescheduleByToken(token, body) {
  return bookingsService.rescheduleByToken(token, body);
}

module.exports = {
  createBooking,
  getBookingByCancelToken,
  cancelBookingByToken,
  getBookingByRescheduleToken,
  rescheduleByToken,
};

