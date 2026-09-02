import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { getCurrentMonitoredRepo } from '../configManager';

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Verifica qual repositório está sendo monitorado atualmente');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const currentRepo = getCurrentMonitoredRepo();

    if (currentRepo) {
        await interaction.reply(`👀 Atualmente estou monitorando os webhooks do repositório: **${currentRepo}**`);
    } else {
        await interaction.reply("❌ Não estou monitorando nenhum repositório no momento. Use `/setrepo usuario/repo` para configurar!");
    }
}
