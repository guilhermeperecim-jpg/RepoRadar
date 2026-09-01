import express from 'express';
import crypto from 'crypto';
import { sendNotificationToChannel } from '../bot/client';
import { getCurrentMonitoredRepo } from '../bot/configManager';
import { generateCommitSummary } from './ai';

const app = express();

// Captura o rawBody para validação criptográfica byte-a-byte do HMAC
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));

function verifySignature(req: any): boolean {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    // Se não houver segredo configurado no ambiente, permite a requisição mas emite aviso
    if (!secret) {
        console.warn("⚠️ AVISO DE SEGURANÇA: GITHUB_WEBHOOK_SECRET não configurado. Aceitando webhook sem verificação de assinatura.");
        return true;
    }

    if (!signature || !req.rawBody) {
        return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf8');
    const digestBuffer = Buffer.from(digest, 'utf8');

    if (signatureBuffer.length !== digestBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export function startServer(port: number) {
    // Rota amigável para o navegador não mostrar "Cannot GET /"
    app.get('/', (req, res) => {
        res.send('<h1>🤖 Bot Assistant está online!</h1><p>Aguardando eventos do GitHub na rota /webhooks/github</p>');
    });

    app.get('/webhooks/github', (req, res) => {
        res.send('Esta rota recebe requisições POST do GitHub.');
    });

    app.post('/webhooks/github', async (req, res) => {
        // 1. Validação de Assinatura Criptográfica
        if (!verifySignature(req)) {
            console.error("❌ ERRO DE SEGURANÇA: Assinatura do webhook inválida ou ausente (X-Hub-Signature-256).");
            return res.status(401).send("Assinatura do webhook inválida.");
        }

        const event = req.headers['x-github-event'];
        const payload = req.body;

        const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
        if (!DISCORD_CHANNEL_ID) {
            return res.status(500).send("Channel ID não configurado.");
        }

        const currentRepo = getCurrentMonitoredRepo();
        const incomingRepo = payload.repository?.full_name || payload.repository?.name;

        // 2. Filtro Estrito de Repositório (impede payloads malformados ou de repositórios não autorizados)
        if (currentRepo) {
            if (!incomingRepo || incomingRepo.toLowerCase() !== currentRepo.toLowerCase()) {
                console.log(`[Filtro] Ignorando evento do repositório ${incomingRepo || 'indefinido'} (Monitorando: ${currentRepo})`);
                return res.status(200).send('Ignorado pelo filtro de repositório');
            }
        }

        console.log(`Recebido evento do GitHub: ${event}`);

        try {
            if (event === 'push') {
                // Formatar lista de commits
                let commitDescription = `O usuário **${payload.pusher?.name || 'Alguém'}** fez um push de ${payload.commits?.length || 0} commits.\n\n`;
                
                if (payload.commits && payload.commits.length > 0) {
                    // Pegar os últimos 5 commits no máximo para não poluir
                    const recentCommits = payload.commits.slice(-5);
                    
                    recentCommits.forEach((commit: any) => {
                        const commitTime = Math.floor(new Date(commit.timestamp).getTime() / 1000);
                        const timeString = commitTime ? `<t:${commitTime}:R>` : '';
                        
                        commitDescription += `[\`${commit.id.substring(0, 7)}\`](${commit.url}) ${commit.message} - **${commit.author.name}** ${timeString}\n`;
                    });

                    if (payload.commits.length > 5) {
                        commitDescription += `\n*...e mais ${payload.commits.length - 5} commits.*`;
                    }
                }

                // Chamar a IA para gerar o resumo
                console.log("Gerando resumo com Inteligência Artificial...");
                const aiSummary = await generateCommitSummary(payload.commits || [], payload.pusher?.name || 'Alguém');

                const embed = {
                    color: 0x0099ff,
                    title: `Push no repositório: ${incomingRepo}`,
                    description: commitDescription,
                    fields: [
                        { name: '✨ Resumo da IA', value: aiSummary },
                        { name: 'Branch', value: payload.ref ? payload.ref.replace('refs/heads/', '') : 'Desconhecido', inline: true }
                    ],
                    url: payload.compare || ''
                };
                
                await sendNotificationToChannel(DISCORD_CHANNEL_ID, embed);
                
            } else if (event === 'pull_request') {
                 const embed = {
                    color: 0x00ff00,
                    title: `Pull Request ${payload.action}: ${payload.pull_request?.title || 'Sem Título'}`,
                    description: `Repositório: ${incomingRepo}`,
                    url: payload.pull_request?.html_url || ''
                };
                
                await sendNotificationToChannel(DISCORD_CHANNEL_ID, embed);
            }
    
            res.status(200).send('Webhook processado!');
        } catch (error) {
            console.error("Erro ao processar webhook:", error);
            res.status(500).send("Erro interno ao processar webhook");
        }
    });

    app.listen(port, () => {
        console.log(`🌐 Servidor Webhook rodando na porta ${port}`);
    });
}
