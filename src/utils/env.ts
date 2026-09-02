import { z } from 'zod';

/**
 * Schema de validação das variáveis de ambiente.
 * Todas as variáveis obrigatórias são validadas na inicialização.
 * Se alguma estiver ausente ou inválida, o processo encerra imediatamente.
 */
const envSchema = z.object({
    // Discord
    DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN é obrigatório'),
    DISCORD_CHANNEL_ID: z.string().min(1, 'DISCORD_CHANNEL_ID é obrigatório'),

    // Google Gemini (IA)
    GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY é obrigatório'),
    GEMINI_MODEL: z.string().default('gemini-3.5-flash'),

    // Segurança do Webhook
    GITHUB_WEBHOOK_SECRET: z.string().min(1, 'GITHUB_WEBHOOK_SECRET é obrigatório'),

    // Servidor
    PORT: z.string().default('3000').transform(Number),

    // Opcional
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: z.string().default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Valida e retorna as variáveis de ambiente.
 * Encerra o processo com código 1 se a validação falhar.
 */
function validateEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('ERRO: Falha na validação das variáveis de ambiente:');
        for (const issue of result.error.issues) {
            console.error(`   → ${issue.path.join('.')}: ${issue.message}`);
        }
        console.error('\nConsulte o arquivo .env.example para referência.');
        process.exit(1);
    }

    return result.data;
}

/**
 * Variáveis de ambiente validadas e tipadas.
 * Importar este objeto em vez de usar `process.env` diretamente.
 */
const env = validateEnv();

export default env;
