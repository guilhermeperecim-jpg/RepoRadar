import { APIEmbed } from 'discord.js';
import { GitHubCommit } from '../../types/github';

/**
 * Formata a lista de commits para a descrição do embed.
 * Limita a 5 commits mais recentes com indicador de truncamento.
 */
function formatCommitList(commits: GitHubCommit[], pusherName: string): string {
    let description = `O usuário **${pusherName}** fez um push de ${commits.length} commits.\n\n`;

    if (commits.length > 0) {
        const recentCommits = commits.slice(-5);

        recentCommits.forEach((commit) => {
            const commitTime = Math.floor(new Date(commit.timestamp).getTime() / 1000);
            const timeString = commitTime ? `<t:${commitTime}:R>` : '';

            description += `[\`${commit.id.substring(0, 7)}\`](${commit.url}) ${commit.message} - **${commit.author.name}** ${timeString}\n`;
        });

        if (commits.length > 5) {
            description += `\n*...e mais ${commits.length - 5} commits.*`;
        }
    }

    return description;
}

/**
 * Verifica se o push foi feito por um bot automatizado (Dependabot, Renovate, etc.).
 */
export function isBotPush(sender?: { login?: string; type?: string }, pusher?: { name?: string }): boolean {
    return !!(
        sender?.type === 'Bot' ||
        pusher?.name?.toLowerCase().includes('[bot]') ||
        sender?.login?.toLowerCase().includes('[bot]') ||
        sender?.login?.toLowerCase().includes('dependabot') ||
        sender?.login?.toLowerCase().includes('renovate')
    );
}

export interface PushEmbedData {
    repoFullName: string;
    commits: GitHubCommit[];
    pusherName: string;
    branch: string;
    compareUrl: string;
    aiSummary: string;
    senderAvatarUrl?: string;
}

/**
 * Constrói o embed do Discord para eventos de Push.
 */
export function buildPushEmbed(data: PushEmbedData): APIEmbed {
    const commitDescription = formatCommitList(data.commits, data.pusherName);

    return {
        color: 0x0099ff,
        title: `Push no repositório: ${data.repoFullName}`,
        description: commitDescription,
        thumbnail: data.senderAvatarUrl ? { url: data.senderAvatarUrl } : undefined,
        fields: [
            { name: '✨ Resumo da IA', value: data.aiSummary },
            { name: 'Branch', value: data.branch, inline: true },
        ],
        url: data.compareUrl || undefined,
    };
}
