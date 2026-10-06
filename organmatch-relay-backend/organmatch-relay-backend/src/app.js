import 'express-async-errors';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import organRoutes from './routes/organRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import jurisdictionRoutes from './routes/jurisdictionRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/organs', organRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/jurisdictions', jurisdictionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

export default app;
