// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';
import portfolioRoutes from './routes/portfolio.routes';
import aiRoutes from './routes/ai.routes';

const app: Application = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);

// Basic Error Handling (Expand on this later)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;