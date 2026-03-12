const { query } = require('../db');

async function listMeetings(filter) {
  let where = '1=1';
  if (filter === 'upcoming') {
    where = "b.start_time >= NOW() AND b.status = 'confirmed'";
  } else if (filter === 'past') {
    where = "b.start_time < NOW() AND b.status <> 'cancelled'";
  }

  const res = await query(
    `
    SELECT
      b.*,
      e.id AS event_type_id,
      e.name AS event_type_name,
      e.slug AS event_type_slug,
      e.duration AS event_type_duration,
      e.color AS event_type_color,
      e.location AS event_type_location
    FROM bookings b
    JOIN event_types e ON b.event_type_id = e.id
    WHERE ${where}
    ORDER BY b.start_time ASC;
  `
  );

  return res.rows.map((row) => ({
    id: row.id,
    event_type_id: row.event_type_id,
    invitee_name: row.invitee_name,
    invitee_email: row.invitee_email,
    invitee_notes: row.invitee_notes,
    start_time: row.start_time,
    end_time: row.end_time,
    timezone: row.timezone,
    status: row.status,
    cancel_token: row.cancel_token,
    reschedule_token: row.reschedule_token,
    cancellation_reason: row.cancellation_reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
    event_type: {
      id: row.event_type_id,
      name: row.event_type_name,
      slug: row.event_type_slug,
      duration: row.event_type_duration,
      color: row.event_type_color,
      location: row.event_type_location,
    },
  }));
}

async function getMeetingById(id) {
  const res = await query(
    `
    SELECT
      b.*,
      e.name AS event_name,
      e.duration,
      e.color,
      e.location
    FROM bookings b
    JOIN event_types e ON b.event_type_id = e.id
    WHERE b.id = $1;
  `,
    [id]
  );
  return res.rows[0] || null;
}

async function cancelMeeting(id, body) {
  const reason = body?.cancellation_reason || null;
  const res = await query(
    `
    UPDATE bookings
    SET status = 'cancelled',
        cancellation_reason = $2,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
    [id, reason]
  );
  return res.rows[0] || null;
}

async function rescheduleMeeting(id, payload) {
  const { start_time, end_time } = payload;
  if (!start_time || !end_time) {
    const err = new Error('start_time and end_time are required');
    err.statusCode = 400;
    throw err;
  }

  const existingRes = await query('SELECT * FROM bookings WHERE id = $1;', [id]);
  const existing = existingRes.rows[0];
  if (!existing) return null;

  const start = new Date(start_time);
  const end = new Date(end_time);

  const overlapRes = await query(
    `
    SELECT id
    FROM bookings
    WHERE event_type_id = $1
      AND id <> $2
      AND status = 'confirmed'
      AND (start_time, end_time) OVERLAPS ($3::timestamptz, $4::timestamptz)
    LIMIT 1;
  `,
    [existing.event_type_id, id, start.toISOString(), end.toISOString()]
  );
  if (overlapRes.rows.length > 0) {
    const err = new Error('This time slot is already booked');
    err.statusCode = 409;
    throw err;
  }

  const res = await query(
    `
    UPDATE bookings
    SET start_time = $2,
        end_time = $3,
        status = 'confirmed',
        updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
    [id, start.toISOString(), end.toISOString()]
  );
  return res.rows[0] || null;
}

module.exports = {
  listMeetings,
  getMeetingById,
  cancelMeeting,
  rescheduleMeeting,
};

