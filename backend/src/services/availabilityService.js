const { query } = require('../db');

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function getDefaultSchedule() {
  const res = await query(
    `
    SELECT * FROM availability_schedules
    WHERE user_id = $1
    ORDER BY is_default DESC, created_at ASC
    LIMIT 1;
  `,
    [DEFAULT_USER_ID]
  );
  return res.rows[0] || null;
}

async function getAvailability() {
  const schedule = await getDefaultSchedule();
  if (!schedule) {
    return { schedule: null, rules: [], overrides: [] };
  }

  const [rulesRes, overridesRes] = await Promise.all([
    query(
      `
      SELECT * FROM availability_rules
      WHERE schedule_id = $1
      ORDER BY day_of_week ASC;
    `,
      [schedule.id]
    ),
    query(
      `
      SELECT * FROM date_overrides
      WHERE schedule_id = $1
      ORDER BY override_date ASC;
    `,
      [schedule.id]
    ),
  ]);

  return {
    schedule,
    rules: rulesRes.rows,
    overrides: overridesRes.rows,
  };
}

async function updateAvailability({ timezone, rules }) {
  let schedule = await getDefaultSchedule();

  if (!schedule) {
    const res = await query(
      `
      INSERT INTO availability_schedules (user_id, name, timezone, is_default)
      VALUES ($1,'Working Hours',$2,true)
      RETURNING *;
    `,
      [DEFAULT_USER_ID, timezone || 'Asia/Kolkata']
    );
    schedule = res.rows[0];
  } else if (timezone && timezone !== schedule.timezone) {
    const res = await query(
      'UPDATE availability_schedules SET timezone = $2 WHERE id = $1 RETURNING *;',
      [schedule.id, timezone]
    );
    schedule = res.rows[0];
  }

  if (Array.isArray(rules)) {
    await query('DELETE FROM availability_rules WHERE schedule_id = $1;', [schedule.id]);
    // eslint-disable-next-line no-restricted-syntax
    for (const rule of rules) {
      // eslint-disable-next-line no-await-in-loop
      await query(
        `
        INSERT INTO availability_rules (
          schedule_id, day_of_week, start_time, end_time, is_available
        )
        VALUES ($1,$2,$3,$4,$5);
      `,
        [
          schedule.id,
          rule.day_of_week,
          rule.start_time,
          rule.end_time,
          rule.is_available !== false,
        ]
      );
    }
  }

  return getAvailability();
}

async function addOverride(data) {
  const schedule = await getDefaultSchedule();
  if (!schedule) {
    const err = new Error('Availability schedule not found');
    err.statusCode = 400;
    throw err;
  }
  const { override_date, is_available, start_time, end_time, reason } = data;
  if (!override_date) {
    const err = new Error('override_date is required');
    err.statusCode = 400;
    throw err;
  }

  const res = await query(
    `
    INSERT INTO date_overrides (
      schedule_id, override_date, is_available, start_time, end_time, reason
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (schedule_id, override_date) DO UPDATE SET
      is_available = EXCLUDED.is_available,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      reason = EXCLUDED.reason
    RETURNING *;
  `,
    [schedule.id, override_date, is_available !== false, start_time || null, end_time || null, reason || null]
  );
  return res.rows[0];
}

async function deleteOverride(id) {
  await query('DELETE FROM date_overrides WHERE id = $1;', [id]);
}

module.exports = {
  getAvailability,
  updateAvailability,
  addOverride,
  deleteOverride,
  getDefaultSchedule,
};

