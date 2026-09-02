import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('criador')
    .setDescription('Mostra informações sobre o criador do bot');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply(
        "👨‍💻 **O criador desse bot é o Guilherme Perecim!**\n" +
        "Ele desenvolveu este projeto para demonstrar integrações avançadas entre APIs (GitHub & Discord) utilizando Node.js e TypeScript. 🚀"
    );
}
