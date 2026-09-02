import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import { RequestWithRawBody } from '../../types/github';
import env from '../../utils/env';
import logger from '../../utils/logger';

/**
 * Middleware de validação de assinatura HMAC SHA-256 do GitHub.
 * 
 * Comportamento fail-closed: se o secret não estiver configurado,
 * TODAS as requisições são rejeitadas por segurança.
 */
export function verifyGitHubSignature(req: RequestWithRawBody, res: Response, next: NextFunction): void {
    const secret = env.GITHUB_WEBHOOK_SECRET;
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    if (!secret) {
        logger.error('GITHUB_WEBHOOK_SECRET não configurado. Recusando webhook por segurança (fail-closed).');
        res.status(401).send('Webhook secret não configurado no servidor.');
        return;
    }

    if (!signature || !req.rawBody) {
        logger.warn('Webhook recebido sem assinatura X-Hub-Signature-256 ou sem rawBody.');
        res.status(401).send('Assinatura do webhook ausente.');
        return;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');

    if (signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
        logger.error('Assinatura do webhook inválida (X-Hub-Signature-256).');
        res.status(401).send('Assinatura do webhook inválida.');
        return;
    }

    next();
}
