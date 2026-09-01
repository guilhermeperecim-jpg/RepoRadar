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
    new SlashCommandBuilder().setName('status').setDescription('Verifica qual repositório está sendo monitorado atualmente')
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
            await interaction.reply("❌ Não estou monitorando nenhum repositório no momento.");
        }
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
                await textChannel.send("Olá, estou online e pronto para trabalhar! 🚀\nNo entanto, não há nenhum repositório padrão setado. Por favor, um **administrador** digite no chat o nome do repositório que deseja monitorar (ex: `usuario/repo`).");
                
                const filter = (m: Message) => {
                    if (m.author.bot) return false;
                    const isAdmin = m.member?.permissions.has(PermissionFlagsBits.Administrator) ||
                                    m.member?.permissions.has(PermissionFlagsBits.ManageGuild);
                    if (!isAdmin) {
                        m.reply("⚠️ Apenas administradores do servidor podem configurar o repositório monitorado.")
                            .then(replyMsg => setTimeout(() => replyMsg.delete().catch(() => {}), 5000))
                            .catch(() => {});
                        return false;
                    }
                    return true;
                };

                const collector = textChannel.createMessageCollector({ filter, max: 1, time: 60000 });

                collector.on('collect', m => {
                    const repoName = m.content.trim();
                    setCurrentMonitoredRepo(repoName);
                    textChannel.send(`✅ Repositório padrão definido para: **${repoName}**! Estou monitorando a partir de agora.`);
                });
                
                collector.on('end', collected => {
                    if (collected.size === 0) {
                        textChannel.send("Tempo esgotado! Reinicie o bot ou configure manualmente depois.");
                    }
                });
            } else {
                const row = new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('keep_default')
                            .setLabel('Monitorar Padrão')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId('new_repo')
                            .setLabel('Novo Repositório')
                            .setStyle(ButtonStyle.Secondary)
                    );

                const msg = await textChannel.send({
                    content: `Olá, estou online e pronto para trabalhar! 🚀\nDeseja monitorar o repositório padrão (**${defaultRepo}**) ou configurar um novo?`,
                    components: [row]
                });

                const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

                collector.on('collect', async i => {
                    // Verificação de permissões do usuário que clicou no botão
                    const memberPerms = i.memberPermissions;
                    const isAdmin = memberPerms?.has(PermissionFlagsBits.Administrator) ||
                                    memberPerms?.has(PermissionFlagsBits.ManageGuild);

                    if (!isAdmin) {
                        await i.reply({ content: "⚠️ Apenas administradores do servidor podem alterar essas configurações.", ephemeral: true });
                        return;
                    }

                    if (i.customId === 'keep_default') {
                        await i.update({ content: `✅ Beleza! Continuarei monitorando o repositório **${defaultRepo}**.`, components: [] });
                    } else if (i.customId === 'new_repo') {
                        await i.update({ content: "Certo! Por favor, digite no chat o nome do novo repositório (ex: `usuario/repo`).", components: [] });
                        
                        const msgFilter = (m: Message) => {
                            if (m.author.bot || m.author.id !== i.user.id) return false;
                            const isUserAdmin = m.member?.permissions.has(PermissionFlagsBits.Administrator) ||
                                                m.member?.permissions.has(PermissionFlagsBits.ManageGuild);
                            return !!isUserAdmin;
                        };

                        const msgCollector = textChannel.createMessageCollector({ filter: msgFilter, max: 1, time: 60000 });
                        
                        msgCollector.on('collect', m => {
                            const repoName = m.content.trim();
                            setCurrentMonitoredRepo(repoName);
                            textChannel.send(`✅ Repositório atualizado com sucesso! Agora estou monitorando: **${repoName}**`);
                        });
                    }
                });
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
