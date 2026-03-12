const nodemailer = require('nodemailer');
const { query } = require('../db');
const { getEventTypeById } = require('./eventTypesService');

function createError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function getTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = process.env.EMAIL_PORT;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

async function sendEmail(to, subject, html) {
  const transporter = await getTransporter();
  if (!transporter) return;
  await transporter.sendMail({
    from: `"Calendly Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

async function ensureNoOverlap(eventTypeId, startTime, endTime) {
  const res = await query(
    `
    SELECT id
    FROM bookings
    WHERE event_type_id = $1
      AND status = 'confirmed'
      AND (start_time, end_time) OVERLAPS ($2::timestamptz, $3::timestamptz)
    LIMIT 1;
  `,
    [eventTypeId, startTime, endTime]
  );
  if (res.rows.length > 0) {
    throw createError('This time slot is already booked. Please choose another time.', 409);
  }
}

async function createBooking(payload) {
  const { event_type_id, invitee_name, invitee_email, start_time, end_time, timezone, invitee_notes } =
    payload;

  if (!event_type_id || !invitee_name || !invitee_email || !start_time || !end_time) {
    throw createError('Missing required booking fields', 400);
  }

  const eventType = await getEventTypeById(event_type_id);
  if (!eventType || !eventType.is_active) {
    throw createError('Event type not found', 404);
  }

  const start = new Date(start_time);
  const end = new Date(end_time);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw createError('Invalid start or end time', 400);
  }

  await ensureNoOverlap(event_type_id, start.toISOString(), end.toISOString());

  const res = await query(
    `
    INSERT INTO bookings (
      event_type_id, invitee_name, invitee_email, invitee_notes,
      start_time, end_time, timezone, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed')
    RETURNING *;
  `,
    [
      event_type_id,
      invitee_name,
      invitee_email,
      invitee_notes || '',
      start.toISOString(),
      end.toISOString(),
      timezone || 'Asia/Kolkata',
    ]
  );
  const booking = res.rows[0];

  const subject = `Confirmed: ${eventType.name}`;
  const html = `
    <h2>Your meeting is scheduled</h2>
    <p><strong>Event:</strong> ${eventType.name}</p>
    <p><strong>When:</strong> ${start.toISOString()} – ${end.toISOString()}</p>
    <p><strong>Location:</strong> ${eventType.location}</p>
  `;
  await sendEmail(invitee_email, subject, html);

  return booking;
}

async function getBookingByCancelToken(token) {
  const res = await query('SELECT * FROM bookings WHERE cancel_token = $1;', [token]);
  return res.rows[0] || null;
}

async function cancelBookingByToken(token, body) {
  const booking = await getBookingByCancelToken(token);
  if (!booking) return null;

  const reason = body?.cancellation_reason || null;

  const res = await query(
    `
    UPDATE bookings
    SET status = 'cancelled',
        cancellation_reason = $2,
        updated_at = NOW()
    WHERE cancel_token = $1
    RETURNING *;
  `,
    [token, reason]
  );
  const updated = res.rows[0];
  const eventType = await getEventTypeById(updated.event_type_id);

  const subject = `Cancelled: ${eventType.name}`;
  const html = `
    <h2>Your meeting was cancelled</h2>
    <p><strong>Event:</strong> ${eventType.name}</p>
    <p><strong>Reason:</strong> ${reason || 'No reason provided'}</p>
  `;
  await sendEmail(updated.invitee_email, subject, html);

  return updated;
}

async function getBookingByRescheduleToken(token) {
  const res = await query('SELECT * FROM bookings WHERE reschedule_token = $1;', [token]);
  return res.rows[0] || null;
}

async function rescheduleByToken(token, payload) {
  const existing = await getBookingByRescheduleToken(token);
  if (!existing) return null;

  const { start_time, end_time } = payload;
  if (!start_time || !end_time) {
    throw createError('start_time and end_time are required', 400);
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  await ensureNoOverlap(existing.event_type_id, start.toISOString(), end.toISOString());

  const res = await query(
    `
    UPDATE bookings
    SET status = 'rescheduled',
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
    [existing.id]
  );

  const eventType = await getEventTypeById(existing.event_type_id);

  const subject = `Rescheduled: ${eventType.name}`;
  const html = `
    <h2>Your meeting was rescheduled</h2>
    <p><strong>Event:</strong> ${eventType.name}</p>
    <p><strong>New time:</strong> ${start.toISOString()} – ${end.toISOString()}</p>
  `;
  await sendEmail(existing.invitee_email, subject, html);

  const inserted = await query(
    `
    INSERT INTO bookings (
      event_type_id, invitee_name, invitee_email, invitee_notes,
      start_time, end_time, timezone, status
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'confirmed')
    RETURNING *;
  `,
    [
      existing.event_type_id,
      existing.invitee_name,
      existing.invitee_email,
      existing.invitee_notes,
      start.toISOString(),
      end.toISOString(),
      existing.timezone,
    ]
  );

  return inserted.rows[0];
}

module.exports = {
  createBooking,
  getBookingByCancelToken,
  cancelBookingByToken,
  getBookingByRescheduleToken,
  rescheduleByToken,
};

