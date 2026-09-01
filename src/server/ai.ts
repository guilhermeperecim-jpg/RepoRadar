import { GoogleGenerativeAI } from "@google/generative-ai";

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-latest"];

export async function generateCommitSummary(commits: any[], pusherName: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return "⚠️ Chave GEMINI_API_KEY não configurada.";
    }

    if (!commits || commits.length === 0) {
        return "Nenhum commit identificado neste evento.";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Prepara os dados dos commits para a IA ler
        let promptContext = `O usuário ${pusherName} fez um push com os seguintes commits:\n\n`;
        
        commits.forEach((commit, index) => {
            const message = commit.message || 'Sem mensagem';
            const added = Array.isArray(commit.added) ? commit.added.length : 0;
            const modified = Array.isArray(commit.modified) ? commit.modified.length : 0;
            const removed = Array.isArray(commit.removed) ? commit.removed.length : 0;

            promptContext += `Commit ${index + 1}:\n`;
            promptContext += `- Mensagem: ${message}\n`;
            promptContext += `- Arquivos adicionados: ${added}\n`;
            promptContext += `- Arquivos modificados: ${modified}\n`;
            promptContext += `- Arquivos removidos: ${removed}\n\n`;
        });

        const prompt = `
            ${promptContext}
            Como um desenvolvedor sênior bem humorado, escreva um parágrafo curto (no máximo 2 ou 3 linhas) em português resumindo o que foi feito neste Push.
            Foque na mensagem dos commits para entender o contexto e impacto das alterações. Pode usar um emoji divertido no início.
            Não precisa dizer "neste push o usuário fez...", vá direto ao ponto no resumo.
        `;

        const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                console.warn(`Aviso: Falha ao gerar resumo com modelo ${modelName}:`, err.message || err);
            }
        }

        return "Não foi possível gerar o resumo da IA no momento.";
    } catch (error) {
        console.error("Erro geral ao gerar resumo com Gemini:", error);
        return "Não foi possível gerar o resumo da IA no momento.";
    }
}

