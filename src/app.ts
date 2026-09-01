import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { errorResponse, successResponse } from '@/utils';
import { errorHandler } from './middlewares/error.middleware';
import { v1Routes } from './routes';
import cookieParser from 'cookie-parser';

const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.get('/', function (req: Request, res: Response) {
  return successResponse(res, 'Server is runing...', {
    status: 'Ok',
    timestamp: Date().toString(),
  });
});

app.use('/api/v1', v1Routes);

// NOTFOUND
app.use((req: Request, res: Response) => {
  const url = req.originalUrl;
  const message = 'The path you are trying to access does not exist';

  return errorResponse(res, message, 404, [{ path: url, message }]);
});

// ERRORS
app.use(errorHandler);

export default app;
