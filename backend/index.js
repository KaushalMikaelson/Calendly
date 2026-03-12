const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { errorHandler } = require('./src/middleware/errorHandler');
const eventTypesRoutes = require('./src/routes/eventTypes');
const availabilityRoutes = require('./src/routes/availability');
const bookingsRoutes = require('./src/routes/bookings');
const meetingsRoutes = require('./src/routes/meetings');

const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URLS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
].filter(Boolean);

app.use(
  cors({
    origin: FRONTEND_URLS,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());

app.use('/api/event-types', eventTypesRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/meetings', meetingsRoutes);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});

