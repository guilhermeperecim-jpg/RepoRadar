import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setCurrentMonitoredRepo } from '../configManager';
import logger from '../../utils/logger';

export const data = new SlashCommandBuilder()
    .setName('setrepo')
    .setDescription('Define o repositório do GitHub a ser monitorado pelo bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
        option.setName('repositorio')
            .setDescription('Nome do repositório no formato usuario/repo (ex: facebook/react)')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defesa em profundidade: checagem manual além do setDefaultMemberPermissions
    const memberPerms = interaction.memberPermissions;
    const isAdmin = memberPerms?.has(PermissionFlagsBits.Administrator) ||
                    memberPerms?.has(PermissionFlagsBits.ManageGuild);

    if (!isAdmin) {
        await interaction.reply({
            content: "⚠️ Apenas administradores do servidor podem executar este comando.",
            ephemeral: true,
        });
        return;
    }

    const repoInput = interaction.options.getString('repositorio', true).trim();
    const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

    if (!repoRegex.test(repoInput)) {
        await interaction.reply({
            content: `❌ Formato inválido! O nome do repositório deve seguir o padrão \`usuario/nome-do-repo\` (ex: \`guilherme/calculadora\`).`,
            ephemeral: true,
        });
        return;
    }

    setCurrentMonitoredRepo(repoInput);
    logger.info({ repo: repoInput, user: interaction.user.tag }, 'Repositório monitorado alterado via /setrepo.');
    await interaction.reply(`✅ Repositório configurado com sucesso! Agora estou monitorando os eventos de: **${repoInput}** 🛰️`);
}
