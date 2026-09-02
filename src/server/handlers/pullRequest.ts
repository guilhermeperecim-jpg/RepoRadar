import { GitHubPullRequestPayload } from '../../types/github';
import { sendNotificationToChannel } from '../../bot/client';
import { buildPrEmbed } from '../embeds/prEmbed';
import logger from '../../utils/logger';

/**
 * Processa eventos de Pull Request do GitHub.
 * - Formata embed com cores no padrão visual do GitHub.
 * - Envia notificação para o canal do Discord.
 */
export async function handlePullRequest(payload: GitHubPullRequestPayload, channelId: string): Promise<void> {
    const pr = payload.pull_request;

    if (!pr) {
        logger.warn('Payload de pull_request recebido sem dados do PR.');
        return;
    }

    const embed = buildPrEmbed({
        action: payload.action,
        number: pr.number,
        title: pr.title || 'Sem Título',
        body: pr.body,
        merged: pr.merged === true,
        htmlUrl: pr.html_url || '',
        authorLogin: pr.user?.login || 'Desconhecido',
        authorAvatarUrl: pr.user?.avatar_url,
        headRef: pr.head?.ref || '?',
        baseRef: pr.base?.ref || '?',
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        commits: pr.commits || 0,
    });

    await sendNotificationToChannel(channelId, embed);
    logger.info({ repo: payload.repository?.full_name, pr: pr.number, action: payload.action }, 'Notificação de PR enviada.');
}
