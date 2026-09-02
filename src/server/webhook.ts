import { Response } from 'express';
import app from './app';
import { RequestWithRawBody } from '../types/github';
import { getCurrentMonitoredRepo } from '../bot/configManager';
import { verifyGitHubSignature } from './middleware/signature';
import { webhookRateLimiter } from './middleware/rateLimiter';
import { handlePush } from './handlers/push';
import { handlePullRequest } from './handlers/pullRequest';
import env from '../utils/env';
import logger from '../utils/logger';

export function startServer(port: number): void {
    // ─── Rota de saúde ───────────────────────────────────────────────────────
    app.get('/', (_req, res) => {
        res.send('<h1>🤖 RepoRadar está online!</h1><p>Aguardando eventos do GitHub na rota /webhooks/github</p>');
    });

    // ─── Rota informativa GET ────────────────────────────────────────────────
    app.get('/webhooks/github', (_req, res) => {
        res.send('Esta rota recebe requisições POST do GitHub.');
    });

    // ─── Rota principal do Webhook ───────────────────────────────────────────
    app.post(
        '/webhooks/github',
        webhookRateLimiter,
        verifyGitHubSignature,
        async (req: RequestWithRawBody, res: Response) => {
            const event = req.headers['x-github-event'] as string | undefined;
            const payload = req.body;

            const channelId = env.DISCORD_CHANNEL_ID;

            // Filtro de repositório
            const currentRepo = getCurrentMonitoredRepo();
            const incomingRepo = payload.repository?.full_name || payload.repository?.name;

            if (currentRepo) {
                if (!incomingRepo || incomingRepo.toLowerCase() !== currentRepo.toLowerCase()) {
                    logger.info({ incoming: incomingRepo, monitored: currentRepo }, 'Evento ignorado pelo filtro de repositório.');
                    res.status(200).send('Ignorado pelo filtro de repositório');
                    return;
                }
            }

            logger.info({ event, repo: incomingRepo }, 'Evento do GitHub recebido.');

            try {
                if (event === 'push') {
                    await handlePush(payload, channelId);
                } else if (event === 'pull_request') {
                    await handlePullRequest(payload, channelId);
                } else {
                    logger.info({ event }, 'Evento do GitHub não processado (tipo não suportado).');
                }

                res.status(200).send('Webhook processado!');
            } catch (error) {
                logger.error({ error, event }, 'Erro ao processar webhook.');
                res.status(500).send('Erro interno ao processar webhook');
            }
        },
    );

    // ─── Inicia o servidor ───────────────────────────────────────────────────
    app.listen(port, () => {
        logger.info({ port }, 'Servidor Webhook rodando.');
    });
}
