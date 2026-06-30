import { StringValue } from 'ms';
/**
 * @description
 * Application configuration factory
 * Maps environment variables into a structured configuration object
 * used by NestJS ConfigModule and ConfigService.
 * Handles organizing and transforming env values in one place.
 *
 * Example:
 * ConfigService.get('jwt.secret')
 * will return the value defined here from process.env.JWT_SECRET.
 */

export default () => ({
  port: Number(process.env.PORT ?? 3000),

  environment: process.env.NODE_ENV ?? 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: (process.env.JWT_EXPIRES_IN as StringValue) ?? '1d',
  },

  bcrypt: {
    salt: Number(process.env.BCRYPT_SALT ?? 10),
  },
});
