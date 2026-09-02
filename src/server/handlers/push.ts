import { GitHubPushPayload } from '../../types/github';
import { sendNotificationToChannel } from '../../bot/client';
import { generateCommitSummary } from '../ai';
import { buildPushEmbed, isBotPush } from '../embeds/pushEmbed';
import logger from '../../utils/logger';

/**
 * Processa eventos de Push do GitHub.
 * - Detecta bots para economizar cota da IA.
 * - Gera resumo com IA para pushes humanos.
 * - Envia embed formatado para o canal do Discord.
 */
export async function handlePush(payload: GitHubPushPayload, channelId: string): Promise<void> {
    const pusherName = payload.pusher?.name || 'Alguém';
    const repoFullName = payload.repository?.full_name || 'Desconhecido';
    const branch = payload.ref ? payload.ref.replace('refs/heads/', '') : 'Desconhecido';

    // Detectar pushes de bots automatizados (Dependabot, Renovate, etc.)
    let aiSummary: string;

    if (isBotPush(payload.sender, payload.pusher)) {
        const botName = payload.sender?.login || payload.pusher?.name || 'Bot';
        logger.info({ bot: botName }, 'Push de bot automatizado detectado. Economizando cota da IA.');
        aiSummary = `🤖 *Atualização automatizada de dependências/bot por **${botName}**.*`;
    } else {
        logger.info('Gerando resumo com Inteligência Artificial...');
        aiSummary = await generateCommitSummary(payload.commits || [], pusherName);
    }

    const embed = buildPushEmbed({
        repoFullName,
        commits: payload.commits || [],
        pusherName,
        branch,
        compareUrl: payload.compare || '',
        aiSummary,
        senderAvatarUrl: payload.sender?.avatar_url,
    });

    await sendNotificationToChannel(channelId, embed);
    logger.info({ repo: repoFullName, branch, commits: payload.commits?.length || 0 }, 'Notificação de push enviada.');
}
