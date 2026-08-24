import dotenv from 'dotenv';

dotenv.config();

export const config = {
  ndeoEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8800,
};
