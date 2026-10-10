import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Welcome & health routes
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Rolexa API',
    docs: '/api/docs',
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for routes that do not exist (must come after all valid routes)
app.use(notFoundHandler);

// Centralized error handler (must come last)
app.use(errorHandler);

export default app;