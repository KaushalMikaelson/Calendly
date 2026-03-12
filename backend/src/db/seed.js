const { pool } = require('./index');

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const SCHEDULE_ID = '00000000-0000-0000-0000-000000000002';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `
      INSERT INTO users (id, name, email, username, avatar_color, timezone)
      VALUES ($1, 'Admin User', 'admin@calendly.com', 'admin', '#0069FF', 'Asia/Kolkata')
      ON CONFLICT (id) DO NOTHING;
    `,
      [ADMIN_ID]
    );

    const eventTypes = [
      {
        name: '30 Minute Meeting',
        slug: '30min',
        duration: 30,
        color: '#0069FF',
      },
      {
        name: '60 Minute Meeting',
        slug: '60min',
        duration: 60,
        color: '#059669',
      },
      {
        name: '15 Minute Chat',
        slug: '15min',
        duration: 15,
        color: '#7C3AED',
      },
    ];

    const eventTypeIds = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const et of eventTypes) {
      // eslint-disable-next-line no-await-in-loop
      const res = await client.query(
        `
        INSERT INTO event_types (user_id, name, slug, duration, color, location, is_active)
        VALUES ($1, $2, $3, $4, $5, 'Google Meet', true)
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          duration = EXCLUDED.duration,
          color = EXCLUDED.color,
          is_active = EXCLUDED.is_active
        RETURNING id, slug;
      `,
        [ADMIN_ID, et.name, et.slug, et.duration, et.color]
      );
      eventTypeIds[res.rows[0].slug] = res.rows[0].id;
    }

    await client.query(
      `
      INSERT INTO availability_schedules (id, user_id, name, timezone, is_default)
      VALUES ($1, $2, 'Working Hours', 'Asia/Kolkata', true)
      ON CONFLICT (id) DO NOTHING;
    `,
      [SCHEDULE_ID, ADMIN_ID]
    );

    await client.query('DELETE FROM availability_rules WHERE schedule_id = $1;', [SCHEDULE_ID]);

    // Monday–Friday 9–17 available, weekend unavailable
    for (let day = 0; day <= 6; day += 1) {
      // eslint-disable-next-line no-await-in-loop
      await client.query(
        `
        INSERT INTO availability_rules (schedule_id, day_of_week, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5);
      `,
        [
          SCHEDULE_ID,
          day,
          day >= 1 && day <= 5 ? '09:00' : '09:00',
          day >= 1 && day <= 5 ? '17:00' : '17:00',
          day >= 1 && day <= 5,
        ]
      );
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msDay = 24 * 60 * 60 * 1000;

    const makeTime = (base, daysOffset, hour, minute) => {
      const d = new Date(base.getTime() + daysOffset * msDay);
      d.setHours(hour, minute, 0, 0);
      return d;
    };

    const upcoming1Start = makeTime(today, 1, 10, 0);
    const upcoming1End = makeTime(today, 1, 10, 30);

    const upcoming2Start = makeTime(today, 2, 14, 0);
    const upcoming2End = makeTime(today, 2, 15, 0);

    const pastStart = makeTime(today, -3, 11, 0);
    const pastEnd = makeTime(today, -3, 11, 15);

    await client.query('DELETE FROM bookings;');

    await client.query(
      `
      INSERT INTO bookings (
        event_type_id, invitee_name, invitee_email, invitee_notes,
        start_time, end_time, timezone, status
      )
      VALUES 
        ($1, 'John Smith', 'john@example.com', '', $2, $3, 'Asia/Kolkata', 'confirmed'),
        ($4, 'Sarah Lee', 'sarah@example.com', '', $5, $6, 'Asia/Kolkata', 'confirmed'),
        ($7, 'Mike Chen', 'mike@example.com', '', $8, $9, 'Asia/Kolkata', 'confirmed');
    `,
      [
        eventTypeIds['30min'],
        upcoming1Start.toISOString(),
        upcoming1End.toISOString(),
        eventTypeIds['60min'],
        upcoming2Start.toISOString(),
        upcoming2End.toISOString(),
        eventTypeIds['15min'],
        pastStart.toISOString(),
        pastEnd.toISOString(),
      ]
    );

    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Seeding completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Seeding failed', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

