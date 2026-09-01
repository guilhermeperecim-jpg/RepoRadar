import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../../config.json');

interface BotConfig {
    defaultRepository: string | null;
}

export function getConfig(): BotConfig {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        try {
            return JSON.parse(data);
        } catch {
            return { defaultRepository: null };
        }
    }
    return { defaultRepository: null };
}

export function saveConfig(config: BotConfig) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

// Variável em memória para acesso rápido durante a execução
let currentMonitoredRepo = getConfig().defaultRepository;

export function getCurrentMonitoredRepo() {
    return currentMonitoredRepo;
}

export function setCurrentMonitoredRepo(repo: string) {
    currentMonitoredRepo = repo;
    const config = getConfig();
    config.defaultRepository = repo;
    saveConfig(config);
}
