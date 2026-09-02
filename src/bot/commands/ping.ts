import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica a latência do bot');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(`🏓 Pong! Latência da API: **${interaction.client.ws.ping}ms**`);
}
