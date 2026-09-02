import 'dotenv/config';
import env from './utils/env';
import logger from './utils/logger';
import { startBot, getClient } from './bot/client';
import { startServer } from './server/webhook';

// ─── Inicia os serviços ──────────────────────────────────────────────────────

logger.info('RepoRadar iniciando...');

// Inicia o bot do Discord
startBot(env.DISCORD_TOKEN);

// Inicia o servidor Webhook
startServer(env.PORT);

// ─── Graceful Shutdown ───────────────────────────────────────────────────────

function shutdown(signal: string): void {
    logger.info({ signal }, 'Sinal de encerramento recebido. Desligando graciosamente...');

    const client = getClient();
    client.destroy();

    logger.info('Bot desconectado. Processo encerrado.');
    process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Promise Rejection detectada.');
});

process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Exceção não capturada. Encerrando processo.');
    process.exit(1);
});
