import { Client, GatewayIntentBits, TextChannel, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getCurrentMonitoredRepo, setCurrentMonitoredRepo } from './configManager';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

// Definição dos comandos de barra (Slash Commands)
const commands = [
    new SlashCommandBuilder().setName('ping').setDescription('Verifica a latência do bot'),
    new SlashCommandBuilder().setName('criador').setDescription('Mostra informações sobre o criador do bot'),
    new SlashCommandBuilder().setName('status').setDescription('Verifica qual repositório está sendo monitorado atualmente'),
    new SlashCommandBuilder()
        .setName('setrepo')
        .setDescription('Define o repositório do GitHub a ser monitorado pelo bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('repositorio')
                .setDescription('Nome do repositório no formato usuario/repo (ex: facebook/react)')
                .setRequired(true)
        )
].map(command => command.toJSON());

// Evento que escuta as interações dos comandos
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply(`🏓 Pong! Latência da API: **${client.ws.ping}ms**`);
    } else if (interaction.commandName === 'criador') {
        await interaction.reply("👨‍💻 **O criador desse bot é o Guilherme Perecim!**\nEle desenvolveu este projeto para demonstrar integrações avançadas entre APIs (GitHub & Discord) utilizando Node.js e TypeScript. 🚀");
    } else if (interaction.commandName === 'status') {
        const currentRepo = getCurrentMonitoredRepo();
        if (currentRepo) {
            await interaction.reply(`👀 Atualmente estou monitorando os webhooks do repositório: **${currentRepo}**`);
        } else {
            await interaction.reply("❌ Não estou monitorando nenhum repositório no momento. Use `/setrepo usuario/repo` para configurar!");
        }
    } else if (interaction.commandName === 'setrepo') {
        const memberPerms = interaction.memberPermissions;
        const isAdmin = memberPerms?.has(PermissionFlagsBits.Administrator) ||
                        memberPerms?.has(PermissionFlagsBits.ManageGuild);

        if (!isAdmin) {
            await interaction.reply({ content: "⚠️ Apenas administradores do servidor podem executar este comando.", ephemeral: true });
            return;
        }

        const repoInput = interaction.options.getString('repositorio', true).trim();
        const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

        if (!repoRegex.test(repoInput)) {
            await interaction.reply({
                content: `❌ Formato inválido! O nome do repositório deve seguir o padrão \`usuario/nome-do-repo\` (ex: \`guilherme/calculadora\`).`,
                ephemeral: true
            });
            return;
        }

        setCurrentMonitoredRepo(repoInput);
        await interaction.reply(`✅ Repositório configurado com sucesso! Agora estou monitorando os eventos de: **${repoInput}** 🛰️`);
    }
});

export function startBot(token: string) {
    client.once('ready', async () => {
        console.log(`🤖 Bot conectado como ${client.user?.tag}`);

        // Registra os comandos na API do Discord
        try {
            await client.application?.commands.set(commands);
            console.log("✅ Comandos de barra (/) registrados com sucesso!");
        } catch (err) {
            console.error("Erro ao registrar comandos:", err);
        }
        
        const channelId = process.env.DISCORD_CHANNEL_ID;
        if (!channelId) return;

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
            console.error("Erro na rotina de inicialização do bot:", error);
        }
    });

    client.login(token);
}

export async function sendNotificationToChannel(channelId: string, embedData: any) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            const embed = new EmbedBuilder(embedData);
            await (channel as TextChannel).send({ embeds: [embed] });
        }
    } catch (error) {
        console.error("Erro ao enviar mensagem para o Discord:", error);
    }
}
