const { pool } = require('./index');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL DEFAULT 'Admin User',
        email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'admin@calendly.com',
        username VARCHAR(100) UNIQUE DEFAULT 'admin',
        avatar_color VARCHAR(7) DEFAULT '#0069FF',
        timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS event_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        duration INTEGER NOT NULL CHECK (duration > 0),
        description TEXT DEFAULT '',
        color VARCHAR(7) DEFAULT '#0069FF',
        location VARCHAR(255) DEFAULT 'Google Meet',
        buffer_before INTEGER DEFAULT 0,
        buffer_after INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS availability_schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) DEFAULT 'Working Hours',
        timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
        is_default BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS availability_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID REFERENCES availability_schedules(id) ON DELETE CASCADE,
        day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        UNIQUE(schedule_id, day_of_week)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS date_overrides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        schedule_id UUID REFERENCES availability_schedules(id) ON DELETE CASCADE,
        override_date DATE NOT NULL,
        is_available BOOLEAN DEFAULT false,
        start_time TIME,
        end_time TIME,
        reason VARCHAR(255),
        UNIQUE(schedule_id, override_date)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type_id UUID REFERENCES event_types(id) ON DELETE CASCADE,
        invitee_name VARCHAR(255) NOT NULL,
        invitee_email VARCHAR(255) NOT NULL,
        invitee_notes TEXT DEFAULT '',
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','rescheduled')),
        cancel_token UUID DEFAULT gen_random_uuid(),
        reschedule_token UUID DEFAULT gen_random_uuid(),
        cancellation_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS booking_answers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_event_type ON bookings(event_type_id);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
    `);

    await client.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log('Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error('Migration failed', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

