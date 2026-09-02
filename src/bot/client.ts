import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, APIEmbed, Events } from 'discord.js';
import { getCurrentMonitoredRepo } from './configManager';
import { getCommandsJSON, dispatchCommand } from './commands';
import env from '../utils/env';
import logger from '../utils/logger';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// ─── Despacho de Interações ──────────────────────────────────────────────────

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        const handled = await dispatchCommand(interaction);
        if (!handled) {
            logger.warn({ command: interaction.commandName }, 'Comando não encontrado no registro.');
        }
    } catch (error) {
        logger.error({ error, command: interaction.commandName }, 'Erro ao executar comando.');
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true });
        } else {
            await interaction.reply({ content: '❌ Ocorreu um erro ao executar o comando.', ephemeral: true });
        }
    }
});

// ─── Inicialização ──────────────────────────────────────────────────────────

export function startBot(token: string): void {
    client.once(Events.ClientReady, async () => {
        logger.info({ tag: client.user?.tag }, 'Bot conectado ao Discord.');

        // Registra os comandos na API do Discord
        try {
            await client.application?.commands.set(getCommandsJSON());
            logger.info('Comandos de barra (/) registrados com sucesso.');
        } catch (err) {
            logger.error({ error: err }, 'Erro ao registrar comandos.');
        }
        
        const channelId = env.DISCORD_CHANNEL_ID;

        try {
            const channel = await client.channels.fetch(channelId);
            if (!channel || !channel.isTextBased()) return;
            const textChannel = channel as TextChannel;

            const defaultRepo = getCurrentMonitoredRepo();

            if (!defaultRepo) {
                await textChannel.send("Olá, estou online e pronto para trabalhar! 🚀\n⚠️ Nenhum repositório padrão está configurado.\n👉 Use o comando `/setrepo usuario/repo` para definir o repositório a qualquer momento.");
            } else {
                await textChannel.send(`Olá, estou online e pronto para trabalhar! 🚀\n👀 Monitorando ativamente: **${defaultRepo}**\n*(Para alterar o repositório a qualquer momento, use \`/setrepo usuario/repo\`)*`);
            }
        } catch (error) {
            logger.error({ error }, 'Erro na rotina de inicialização do bot.');
        }
    });

    client.login(token);
}

// ─── Envio de Notificações ───────────────────────────────────────────────────

/**
 * Envia um embed formatado para o canal do Discord especificado.
 */
export async function sendNotificationToChannel(channelId: string, embedData: APIEmbed): Promise<void> {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder(embedData);
            await (channel as TextChannel).send({ embeds: [embed] });
        }
    } catch (error) {
        logger.error({ error, channelId }, 'Erro ao enviar mensagem para o Discord.');
    }
}

// ─── Acesso ao Client (para graceful shutdown) ──────────────────────────────

export function getClient(): Client {
    return client;
}
