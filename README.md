# 🛰️ RepoRadar

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**RepoRadar** é um bot para Discord desenvolvido em Node.js com TypeScript que integra a API do Discord com os Webhooks do GitHub. Ele monitora repositórios em tempo real e notifica o seu servidor sobre novos commits e pull requests, incluindo detalhes como autor, horário e arquivos modificados. Além disso, utiliza o **Google Gemini** para gerar resumos inteligentes e bem-humorados de cada push, trazendo IA diretamente para o fluxo de trabalho da sua equipe.

---

## ✨ Funcionalidades

- 🔔 **Notificações em tempo real** — Receba alertas no Discord sempre que alguém fizer um Push ou Pull Request.
- 🤖 **Resumos com IA** — O Google Gemini analisa os commits e gera um resumo automático do que foi feito.
- 🎛️ **Interatividade** — Botões clicáveis e coletores de mensagens para configurar o bot direto pelo Discord.
- 📌 **Persistência** — O bot salva suas preferências localmente e lembra do repositório monitorado mesmo após reiniciar.
- ⚡ **Slash Commands** — Comandos modernos do Discord (`/ping`, `/criador`, `/status`).
- 🔍 **Filtro inteligente** — Monitora apenas o repositório que você escolher, ignorando eventos de outros projetos.

---

## 🏗️ Arquitetura

```
GitHub (Push/PR) ──► Webhook ──► Smee.io (túnel) ──► Express (porta 3000) ──► Gemini AI ──► Discord Bot ──► Canal do Discord
```

O projeto segue uma **arquitetura orientada a eventos**:

1. O **GitHub** dispara um Webhook (HTTP POST) sempre que ocorre um evento no repositório.
2. O **Smee.io** (em desenvolvimento) ou uma URL pública (em produção) redireciona o payload para o servidor local.
3. O **Express** recebe o payload, filtra pelo repositório monitorado e extrai os dados relevantes.
4. O **Google Gemini** recebe os dados dos commits e gera um resumo inteligente.
5. O **Discord.js** formata tudo em um Embed rico e envia para o canal configurado.

---

## 🚀 Como Instalar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- Uma conta no [Discord Developer Portal](https://discord.com/developers/applications)
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/app/apikey) (gratuita)

### Passo a Passo

**1. Clone o repositório**
```bash
git clone https://github.com/guilhermeperecim-jpg/repo-radar.git
cd repo-radar
```

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as variáveis de ambiente**

Copie o arquivo de exemplo e preencha com as suas credenciais:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DISCORD_TOKEN=seu_token_do_bot_aqui
DISCORD_CHANNEL_ID=id_do_canal_do_discord
GEMINI_API_KEY=sua_chave_da_api_do_gemini
PORT=3000
```

> **Como obter cada variável:**
> - `DISCORD_TOKEN`: Crie uma aplicação no [Discord Developer Portal](https://discord.com/developers/applications) > aba Bot > copie o Token.
> - `DISCORD_CHANNEL_ID`: No Discord, clique com o botão direito no canal desejado > "Copiar ID do Canal".
> - `GEMINI_API_KEY`: Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey) > "Create API Key".

**4. Inicie o bot**
```bash
npm run dev
```

Você verá no terminal:
```
🌐 Servidor Webhook rodando na porta 3000
🤖 Bot conectado como RepoRadar#1234
✅ Comandos de barra (/) registrados com sucesso!
```

---

## 🔗 Configurando os Webhooks do GitHub

Para que o GitHub envie os eventos para o seu bot, você precisa configurar um Webhook no repositório:

### Em Desenvolvimento (localhost)

1. Instale o Smee Client: `npm install --global smee-client`
2. Acesse [smee.io](https://smee.io/) e clique em "Start a new channel".
3. Copie a URL gerada.
4. No seu repositório do GitHub: **Settings** > **Webhooks** > **Add webhook**.
   - **Payload URL:** Cole a URL do Smee.
   - **Content type:** `application/json`
5. Em outro terminal, rode: `npx smee-client -u SUA_URL_SMEE -t http://localhost:3000/webhooks/github`

### Em Produção

1. Faça o deploy do bot em um serviço como [Render](https://render.com/), [Railway](https://railway.app/) ou [Heroku](https://heroku.com/).
2. No GitHub Webhooks, coloque a URL pública do seu servidor + `/webhooks/github`.

---

## 💬 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `/ping` | Verifica a latência do bot com os servidores do Discord |
| `/criador` | Mostra informações sobre o criador do bot |
| `/status` | Exibe qual repositório está sendo monitorado atualmente |

---

## 🗂️ Estrutura do Projeto

```
repo-radar/
├── src/
│   ├── index.ts              # Ponto de entrada da aplicação
│   ├── bot/
│   │   ├── client.ts         # Configuração do bot Discord e Slash Commands
│   │   └── configManager.ts  # Persistência local do repositório monitorado
│   └── server/
│       ├── webhook.ts        # Servidor Express que recebe os Webhooks do GitHub
│       └── ai.ts             # Integração com o Google Gemini para resumos
├── .env.example              # Modelo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
├── package.json              # Dependências e scripts
└── tsconfig.json             # Configuração do TypeScript
```

---

## 🛠️ Tecnologias Utilizadas

- **[Node.js](https://nodejs.org/)** — Ambiente de execução JavaScript no servidor.
- **[TypeScript](https://www.typescriptlang.org/)** — Superset do JavaScript com tipagem estática.
- **[Discord.js](https://discord.js.org/)** — Biblioteca para interagir com a API do Discord.
- **[Express](https://expressjs.com/)** — Framework web minimalista para receber os Webhooks.
- **[Google Gemini AI](https://ai.google.dev/)** — IA generativa para resumos inteligentes dos commits.
- **[Smee.io](https://smee.io/)** — Proxy para redirecionar Webhooks durante o desenvolvimento.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Embora existam ferramentas que fazem parte do que o RepoRadar faz (como webhooks nativos ou CLIs de resumo), o RepoRadar é uma solução completa que une monitoramento em tempo real, inteligência artificial e interatividade em um único bot — algo que não encontrei em nenhum outro projeto open source.

## 👨‍💻 Autor

Desenvolvido por **Guilherme Perecim**.

[![GitHub](https://img.shields.io/badge/GitHub-guilhermeperecim--jpg-181717?style=flat-square&logo=github)](https://github.com/guilhermeperecim-jpg)
