import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),

  BCRYPT_SALT: Joi.number().required(),
});
