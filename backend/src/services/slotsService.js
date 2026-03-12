const { parse, addMinutes, format } = require('date-fns');
const { query } = require('../db');
const { getDefaultSchedule } = require('./availabilityService');
const { getEventTypeById } = require('./eventTypesService');

function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getAvailableSlots(dateStr, eventTypeId) {
  if (!dateStr || !eventTypeId) {
    throw createError('date and eventTypeId are required', 400);
  }

  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType || !eventType.is_active) {
    throw createError('Event type not found', 404);
  }

  const schedule = await getDefaultSchedule();
  if (!schedule) {
    return [];
  }

  const requestedDate = new Date(dateStr);
  if (Number.isNaN(requestedDate.getTime())) {
    throw createError('Invalid date', 400);
  }

  const dayOfWeek = requestedDate.getDay();

  const overrideRes = await query(
    `
    SELECT * FROM date_overrides
    WHERE schedule_id = $1 AND override_date = $2;
  `,
    [schedule.id, dateStr]
  );
  const override = overrideRes.rows[0] || null;

  let startTimeStr;
  let endTimeStr;

  if (override) {
    if (!override.is_available) {
      return [];
    }
    if (override.start_time && override.end_time) {
      startTimeStr = override.start_time.substring(0, 5);
      endTimeStr = override.end_time.substring(0, 5);
    }
  }

  if (!startTimeStr || !endTimeStr) {
    const ruleRes = await query(
      `
      SELECT * FROM availability_rules
      WHERE schedule_id = $1 AND day_of_week = $2;
    `,
      [schedule.id, dayOfWeek]
    );
    const rule = ruleRes.rows[0];
    if (!rule || !rule.is_available) {
      return [];
    }
    startTimeStr = rule.start_time.substring(0, 5);
    endTimeStr = rule.end_time.substring(0, 5);
  }

  const duration = eventType.duration;

  // generate all slots for the day in Asia/Kolkata local time
  let current = parse(startTimeStr, 'HH:mm', requestedDate);
  const end = parse(endTimeStr, 'HH:mm', requestedDate);

  const bookingsRes = await query(
    `
    SELECT start_time, end_time
    FROM bookings
    WHERE event_type_id = $1
      AND status = 'confirmed'
      AND DATE(start_time AT TIME ZONE $3) = $2;
  `,
    [eventTypeId, dateStr, schedule.timezone]
  );

  const existingBookings = bookingsRes.rows.map((b) => ({
    start: new Date(b.start_time),
    end: new Date(b.end_time),
  }));

  const now = new Date();
  const isToday =
    now.getFullYear() === requestedDate.getFullYear() &&
    now.getMonth() === requestedDate.getMonth() &&
    now.getDate() === requestedDate.getDate();

  const slots = [];

  while (addMinutes(current, duration) <= end) {
    const slotStart = current;
    const slotEnd = addMinutes(current, duration);

    if (isToday && slotStart <= now) {
      current = addMinutes(current, duration);
      // eslint-disable-next-line no-continue
      continue;
    }

    const overlaps = existingBookings.some((b) => slotStart < b.end && slotEnd > b.start);
    if (!overlaps) {
      slots.push({
        start: format(slotStart, 'h:mm a'),
        startISO: slotStart.toISOString(),
        end: format(slotEnd, 'h:mm a'),
        endISO: slotEnd.toISOString(),
      });
    }

    current = addMinutes(current, duration);
  }

  return slots;
}

module.exports = { getAvailableSlots };

