const { query } = require('../db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function findUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await query('SELECT id FROM event_types WHERE slug = $1 LIMIT 1;', [slug]);
    if (existing.rows.length === 0) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function listEventTypes() {
  const res = await query(
    `
    SELECT e.*,
      COALESCE(
        (SELECT COUNT(*) FROM bookings b WHERE b.event_type_id = e.id AND b.status = 'confirmed'),
        0
      ) AS booking_count
    FROM event_types e
    ORDER BY e.created_at ASC;
  `
  );
  return res.rows;
}

async function createEventType(payload) {
  const { name, duration, description, color, location, buffer_before, buffer_after } = payload;

  if (!name || !duration) {
    const err = new Error('Name and duration are required');
    err.statusCode = 400;
    throw err;
  }

  // Prevent creating duplicate event types with the exact same name
  const existingNameCheck = await query(
    'SELECT id FROM event_types WHERE user_id = $1 AND name = $2 LIMIT 1;',
    [DEFAULT_USER_ID, name]
  );
  if (existingNameCheck.rows.length > 0) {
    const err = new Error('An event type with this name already exists');
    err.statusCode = 400;
    throw err;
  }

  const baseSlug = payload.slug ? generateSlug(payload.slug) : generateSlug(name);
  const slug = await findUniqueSlug(baseSlug);

  const res = await query(
    `
    INSERT INTO event_types (
      user_id, name, slug, duration, description, color, location,
      buffer_before, buffer_after, is_active, scheduled_date, scheduled_time
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11)
    RETURNING *;
  `,
    [
      DEFAULT_USER_ID,
      name,
      slug,
      Number(duration),
      description || '',
      color || '#0069FF',
      location || 'Google Meet',
      Number(buffer_before) || 0,
      Number(buffer_after) || 0,
      payload.scheduled_date || null,
      payload.scheduled_time || null,
    ]
  );

  return res.rows[0];
}

async function getEventTypeBySlug(slug) {
  const res = await query('SELECT * FROM event_types WHERE slug = $1 AND is_active = true;', [slug]);
  return res.rows[0] || null;
}

async function getEventTypeById(id) {
  const res = await query('SELECT * FROM event_types WHERE id = $1;', [id]);
  return res.rows[0] || null;
}

async function getEventTypeByIdOrSlug(idOrSlug) {
  const uuidRegex = /^[0-9a-fA-F-]{36}$/;
  if (uuidRegex.test(idOrSlug)) {
    return getEventTypeById(idOrSlug);
  }
  return getEventTypeBySlug(idOrSlug);
}

async function updateEventType(id, payload) {
  const existing = await getEventTypeById(id);
  if (!existing) return null;

  const name = payload.name ?? existing.name;

  if (name !== existing.name) {
    const existingNameCheck = await query(
      'SELECT id FROM event_types WHERE user_id = $1 AND name = $2 AND id != $3 LIMIT 1;',
      [existing.user_id, name, id]
    );
    if (existingNameCheck.rows.length > 0) {
      const err = new Error('An event type with this name already exists');
      err.statusCode = 400;
      throw err;
    }
  }

  const slug =
    payload.slug !== undefined && payload.slug !== ''
      ? generateSlug(payload.slug)
      : existing.slug;

  const res = await query(
    `
    UPDATE event_types
    SET
      name = $2,
      slug = $3,
      duration = $4,
      description = $5,
      color = $6,
      location = $7,
      buffer_before = $8,
      buffer_after = $9,
      is_active = COALESCE($10, is_active),
      scheduled_date = COALESCE($11, scheduled_date),
      scheduled_time = COALESCE($12, scheduled_time),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
    [
      id,
      name,
      slug,
      Number(payload.duration ?? existing.duration),
      payload.description ?? existing.description,
      payload.color ?? existing.color,
      payload.location ?? existing.location,
      Number(payload.buffer_before ?? existing.buffer_before),
      Number(payload.buffer_after ?? existing.buffer_after),
      payload.is_active,
      payload.scheduled_date !== undefined ? payload.scheduled_date : existing.scheduled_date,
      payload.scheduled_time !== undefined ? payload.scheduled_time : existing.scheduled_time,
    ]
  );

  return res.rows[0] || null;
}

async function deleteEventType(id) {
  const res = await query(
    'DELETE FROM event_types WHERE id = $1 RETURNING *;',
    [id]
  );
  return res.rows[0] || null;
}

module.exports = {
  listEventTypes,
  createEventType,
  getEventTypeBySlug,
  getEventTypeById,
  getEventTypeByIdOrSlug,
  updateEventType,
  deleteEventType,
  generateSlug,
};

