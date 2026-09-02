import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import logger from '../utils/logger';

const configPath = path.join(__dirname, '../../config.json');

// ─── Schema de validação ─────────────────────────────────────────────────────

const BotConfigSchema = z.object({
    defaultRepository: z.string().nullable(),
});

type BotConfig = z.infer<typeof BotConfigSchema>;

// ─── Leitura e Escrita ───────────────────────────────────────────────────────

export function getConfig(): BotConfig {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        try {
            const parsed = JSON.parse(data);
            return BotConfigSchema.parse(parsed);
        } catch (error) {
            logger.warn({ error }, 'config.json inválido ou corrompido. Usando valores padrão.');
            return { defaultRepository: null };
        }
    }
    return { defaultRepository: null };
}

export function saveConfig(config: BotConfig): void {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch (error) {
        logger.error({ error }, 'Erro ao salvar config.json.');
    }
}

// ─── Cache em memória ────────────────────────────────────────────────────────

// Variável em memória para acesso rápido durante a execução
let currentMonitoredRepo = getConfig().defaultRepository;

export function getCurrentMonitoredRepo(): string | null {
    return currentMonitoredRepo;
}

export function setCurrentMonitoredRepo(repo: string): void {
    currentMonitoredRepo = repo;
    const config = getConfig();
    config.defaultRepository = repo;
    saveConfig(config);
    logger.info({ repo }, 'Repositório monitorado atualizado.');
}
