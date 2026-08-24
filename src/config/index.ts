import dotenv from 'dotenv';

dotenv.config();

const jwt = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
};

export const config = {
  ndeoEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8800,
  database: {
    url: process.env.DATABASE_URL!,
  },
  jwt,
};
