import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// ROUTES
app.get('/', function (req: Request, res: Response) {
  return res.status(200).json({ status: 'Ok', timestamp: Date().toString() });
});

// NOTFOUND
app.use((req: Request, res: Response) => {
  const url = req.originalUrl;
  const message = 'The path you are trying to access does not exist';

  return res.status(404).json({
    message,
    errors: [{ path: url, message }],
  });
});

// ERRORS
export default app;
