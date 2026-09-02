import pino from 'pino';
import pinoPretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Logger estruturado do RepoRadar.
 * - Em desenvolvimento: saída colorida e legível (pino-pretty síncrono).
 * - Em produção: JSON estruturado para integração com serviços de log.
 *
 * Usa pino-pretty como stream síncrono (em vez de transport worker)
 * para evitar problemas de encoding UTF-8 no Windows.
 */
const logger = isProduction
    ? pino({ level: process.env.LOG_LEVEL || 'info' })
    : pino(
        { level: process.env.LOG_LEVEL || 'info' },
        pinoPretty({
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
        }),
    );

export default logger;
