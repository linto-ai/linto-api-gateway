import pino from 'pino';
import Config from '@src/config';

const config = Config.getInstance();

const logger = pino({
  level: config.get('LOG_LEVEL') || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  },
});

export default logger; 