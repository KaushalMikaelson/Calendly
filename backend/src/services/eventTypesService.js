const { query } = require('../db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

  const slug = payload.slug ? generateSlug(payload.slug) : generateSlug(name);

  const res = await query(
    `
    INSERT INTO event_types (
      user_id, name, slug, duration, description, color, location,
      buffer_before, buffer_after, is_active
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)
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
    ]
  );

  return res.rows[0] || null;
}

async function deleteEventType(id) {
  const res = await query(
    `
    UPDATE event_types
    SET is_active = false, updated_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,
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

