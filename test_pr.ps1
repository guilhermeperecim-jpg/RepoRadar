# ============================================================
# Simula um webhook de PULL REQUEST do GitHub
# Uso: .\test_pr.ps1
# Opcoes: .\test_pr.ps1 -Action opened|closed|merged|review_requested
# ============================================================

param(
    [ValidateSet("opened", "closed", "merged", "review_requested")]
    [string]$Action = "opened"
)

$secret = $env:GITHUB_WEBHOOK_SECRET
if (-not $secret) {
    $envFile = Get-Content "$PSScriptRoot\.env" -ErrorAction SilentlyContinue
    $secret = ($envFile | Where-Object { $_ -match '^GITHUB_WEBHOOK_SECRET=' }) -replace 'GITHUB_WEBHOOK_SECRET=', ''
}

if (-not $secret) {
    Write-Host "ERRO: GITHUB_WEBHOOK_SECRET nao encontrado." -ForegroundColor Red
    exit 1
}

# Ajusta merged flag conforme a ação
$isMerged = if ($Action -eq "merged") { "true" } else { "false" }
$actualAction = if ($Action -eq "merged") { "closed" } else { $Action }

$body = @"
{
  "action": "$actualAction",
  "pull_request": {
    "number": 42,
    "title": "feat: implementar modo escuro na calculadora",
    "body": "## Descricao\n\nEste PR adiciona o modo escuro a calculadora cientifica.\n\n### Alteracoes:\n- Novo tema dark com cores customizadas\n- Toggle de tema no header\n- Persistencia da preferencia no localStorage",
    "merged": $isMerged,
    "html_url": "https://github.com/guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica/pull/42",
    "additions": 247,
    "deletions": 18,
    "commits": 5,
    "user": {
      "login": "guilhermeperecim-jpg",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345678"
    },
    "head": {
      "ref": "feature/dark-mode"
    },
    "base": {
      "ref": "master"
    }
  },
  "sender": {
    "login": "guilhermeperecim-jpg",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345678"
  },
  "repository": {
    "name": "Projeto-Calculadora-Cient-fica",
    "full_name": "guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica"
  }
}
"@

# Calcula HMAC-SHA256
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))
$signature = "sha256=" + [BitConverter]::ToString($hash).Replace("-","").ToLower()

# Labels de cor para o terminal
$colorMap = @{
    "opened" = "Green"
    "closed" = "Red"
    "merged" = "Magenta"
    "review_requested" = "Yellow"
}

Write-Host "`n=== Simulando PULL REQUEST webhook ===" -ForegroundColor Cyan
Write-Host "Repo: guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica"
Write-Host "PR #42: feat: implementar modo escuro na calculadora"
Write-Host "Acao: $Action" -ForegroundColor $colorMap[$Action]
Write-Host "Signature: $signature`n"

$response = Invoke-WebRequest -Uri "http://localhost:3000/webhooks/github" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{
        "X-GitHub-Event" = "pull_request"
        "X-Hub-Signature-256" = $signature
        "X-GitHub-Delivery" = [guid]::NewGuid().ToString()
    } `
    -Body $body `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Resposta: $($response.Content)`n"
