import { ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

import * as ping from './ping';
import * as criador from './criador';
import * as status from './status';
import * as setrepo from './setrepo';

/**
 * Interface para cada módulo de comando.
 */
export interface Command {
    data: {
        toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
        name: string;
    };
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * Registro central de todos os comandos de barra (Slash Commands).
 * Para adicionar um novo comando, basta criar o arquivo em commands/ e adicioná-lo aqui.
 */
export const commands: Command[] = [ping, criador, status, setrepo];

/**
 * Retorna os dados JSON de todos os comandos para registro na API do Discord.
 */
export function getCommandsJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    return commands.map(cmd => cmd.data.toJSON());
}

/**
 * Despacha a interação para o comando correspondente.
 * Retorna true se o comando foi encontrado e executado, false caso contrário.
 */
export async function dispatchCommand(interaction: ChatInputCommandInteraction): Promise<boolean> {
    const command = commands.find(cmd => cmd.data.name === interaction.commandName);

    if (!command) {
        return false;
    }

    await command.execute(interaction);
    return true;
}
