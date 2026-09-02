import rateLimit from 'express-rate-limit';
import logger from '../../utils/logger';

/**
 * Rate limiter para o endpoint de webhooks.
 * Limita a 30 requisições por minuto por IP para prevenir
 * abuso, DDoS e esgotamento de cota da IA.
 */
export const webhookRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30,             // máximo de 30 requisições por janela
    standardHeaders: true,
    legacyHeaders: false,
    // Desabilita validação do X-Forwarded-For pois proxies como Smee.io
    // enviam este header mesmo sem 'trust proxy' configurado no Express.
    // A autenticação é garantida pela assinatura HMAC do webhook.
    validate: { xForwardedForHeader: false },
    message: {
        error: 'Muitas requisições. Tente novamente em um minuto.',
    },
    handler: (req, res, next, options) => {
        logger.warn({ ip: req.ip }, 'Rate limit excedido no endpoint de webhooks.');
        res.status(options.statusCode).json(options.message);
    },
});
