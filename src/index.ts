import 'dotenv/config';
import { startBot } from './bot/client';
import { startServer } from './server/webhook';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3000;

if (!DISCORD_TOKEN) {
    console.error("ERRO: DISCORD_TOKEN não está definido no arquivo .env");
    process.exit(1);
}

// Inicia o bot do Discord
startBot(DISCORD_TOKEN);

// Inicia o servidor Webhook
startServer(Number(PORT));
