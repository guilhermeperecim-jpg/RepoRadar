import { APIEmbed } from 'discord.js';

export interface PrEmbedData {
    action: string;
    number: number;
    title: string;
    body: string | null;
    merged: boolean;
    htmlUrl: string;
    authorLogin: string;
    authorAvatarUrl?: string;
    headRef: string;
    baseRef: string;
    additions: number;
    deletions: number;
    commits: number;
}

/**
 * Mapeia a ação do PR para cor e título no padrão visual do GitHub.
 *   🟢 Verde   — Aberto/Reaberto
 *   🟣 Roxo    — Mesclado (Merged)
 *   🔴 Vermelho — Fechado sem merge
 *   🟡 Amarelo — Revisão solicitada
 *   🔵 Azul    — Outros eventos
 */
function getStatusInfo(action: string, merged: boolean, number: number, title: string) {
    if (action === 'closed') {
        if (merged) {
            return {
                color: 0x8957e5,
                statusTitle: `🟣 Pull Request Mesclado (Merged): #${number} ${title}`,
            };
        }
        return {
            color: 0xe74c3c,
            statusTitle: `🔴 Pull Request Fechado: #${number} ${title}`,
        };
    }

    if (action === 'opened' || action === 'reopened') {
        return {
            color: 0x2ecc71,
            statusTitle: `🟢 Pull Request Aberto: #${number} ${title}`,
        };
    }

    if (action === 'review_requested') {
        return {
            color: 0xf1c40f,
            statusTitle: `🟡 Revisão Solicitada: #${number} ${title}`,
        };
    }

    return {
        color: 0x3498db,
        statusTitle: `Pull Request ${action}: #${number} ${title}`,
    };
}

/**
 * Constrói o embed do Discord para eventos de Pull Request.
 */
export function buildPrEmbed(data: PrEmbedData): APIEmbed {
    const { color, statusTitle } = getStatusInfo(
        data.action,
        data.merged,
        data.number,
        data.title || 'Sem Título',
    );

    const prDescription = data.body
        ? (data.body.length > 300 ? data.body.slice(0, 300) + '...' : data.body)
        : '*Nenhuma descrição fornecida.*';

    return {
        color,
        title: statusTitle,
        description: prDescription,
        thumbnail: data.authorAvatarUrl ? { url: data.authorAvatarUrl } : undefined,
        fields: [
            { name: '👤 Autor', value: data.authorLogin || 'Desconhecido', inline: true },
            { name: '🔀 Branch', value: `\`${data.headRef || '?'}\` ➔ \`${data.baseRef || '?'}\``, inline: true },
            { name: '📊 Alterações', value: `+${data.additions || 0} / -${data.deletions || 0} (${data.commits || 0} commits)`, inline: true },
        ],
        url: data.htmlUrl || undefined,
    };
}
