import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Nest App',
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
}));
