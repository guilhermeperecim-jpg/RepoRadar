import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCommitSummary(commits: any[], pusherName: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        return "⚠️ Chave GEMINI_API_KEY não configurada.";
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Usando o modelo flash, que é rápido e excelente para textos
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepara os dados dos commits para a IA ler
        let promptContext = `O usuário ${pusherName} acabou de fazer um push com os seguintes commits:\n\n`;
        
        commits.forEach((commit, index) => {
            promptContext += `Commit ${index + 1}:\n`;
            promptContext += `- Mensagem: ${commit.message}\n`;
            promptContext += `- Arquivos adicionados: ${commit.added.length}\n`;
            promptContext += `- Arquivos modificados: ${commit.modified.length}\n`;
            promptContext += `- Arquivos removidos: ${commit.removed.length}\n\n`;
        });

        const prompt = `
            ${promptContext}
            Como um desenvolvedor sênior bem humorado, escreva um parágrafo (no máximo 3 linhas) resumindo o que foi feito neste Push.
            Foque na mensagem dos commits para entender o contexto. Pode usar um emoji divertido.
            Não precisa dizer "neste push o usuário fez...", vá direto ao ponto no resumo.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Erro ao gerar resumo com Gemini:", error);
        return "Não foi possível gerar o resumo da IA no momento.";
    }
}
