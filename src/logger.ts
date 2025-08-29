import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'process.env.TESTRAIL_API_KEY',
      'process.env.TESTRAIL_USERNAME',
      'process.env.TESTRAIL_PASSWORD',
      'headers.authorization',
      'headers.Authorization',
      'config.headers.authorization',
      'config.headers.Authorization',
      'config.auth.password',
      'config.auth.username',
      '*.auth.password',
      '*.auth.username',
      '*.authorization',
      '*.Authorization',
      'password',
      'api_key',
      'apiKey',
      'token',
      'secret'
    ],
    censor: '[REDACTED]'
  }
});


