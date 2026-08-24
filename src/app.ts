import compression from 'compression';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import { errorResponse, successResponse } from '@/utils';

const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// ROUTES
app.get('/', function (req: Request, res: Response) {
  return successResponse(res, 'Server is runing...', {
    status: 'Ok',
    timestamp: Date().toString(),
  });
});

// NOTFOUND
app.use((req: Request, res: Response) => {
  const url = req.originalUrl;
  const message = 'The path you are trying to access does not exist';

  return errorResponse(res, message, 404, [{ path: url, message }]);
});

// ERRORS
export default app;
