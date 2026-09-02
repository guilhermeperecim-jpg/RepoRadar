import express from 'express';
import helmet from 'helmet';
import { RequestWithRawBody } from '../types/github';

/**
 * Instância do Express com middlewares de segurança configurados.
 * - Helmet: headers de segurança HTTP automáticos
 * - Body parser: JSON com limite de 1MB e captura de rawBody para HMAC
 */
const app = express();

// Headers de segurança HTTP (X-Content-Type-Options, X-Frame-Options, etc.)
app.use(helmet());

// Parse JSON com captura do rawBody para validação HMAC
app.use(express.json({
    limit: '1mb',
    verify: (req: RequestWithRawBody, _res, buf) => {
        req.rawBody = buf;
    },
}));

export default app;
