# ============================================================
# Simula um webhook de PUSH do GitHub
# Uso: .\test_push.ps1
# ============================================================

$secret = $env:GITHUB_WEBHOOK_SECRET
if (-not $secret) {
    # Lê do .env se não estiver no ambiente
    $envFile = Get-Content "$PSScriptRoot\.env" -ErrorAction SilentlyContinue
    $secret = ($envFile | Where-Object { $_ -match '^GITHUB_WEBHOOK_SECRET=' }) -replace 'GITHUB_WEBHOOK_SECRET=', ''
}

if (-not $secret) {
    Write-Host "ERRO: GITHUB_WEBHOOK_SECRET nao encontrado." -ForegroundColor Red
    exit 1
}

$body = @'
{
  "ref": "refs/heads/master",
  "compare": "https://github.com/guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica/compare/abc123...def456",
  "pusher": {
    "name": "guilhermeperecim-jpg",
    "email": "guilherme@test.com"
  },
  "sender": {
    "login": "guilhermeperecim-jpg",
    "type": "User",
    "avatar_url": "https://avatars.githubusercontent.com/u/12345678"
  },
  "repository": {
    "name": "Projeto-Calculadora-Cient-fica",
    "full_name": "guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica"
  },
  "commits": [
    {
      "id": "a1b2c3d4e5f6789012345678901234567890abcd",
      "message": "feat: adicionar funcao de raiz quadrada na calculadora",
      "timestamp": "2026-09-02T20:00:00-03:00",
      "url": "https://github.com/guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica/commit/a1b2c3d",
      "author": {
        "name": "Guilherme Perecim",
        "email": "guilherme@test.com",
        "username": "guilhermeperecim-jpg"
      },
      "added": ["src/sqrt.ts"],
      "modified": ["src/calculator.ts"],
      "removed": []
    },
    {
      "id": "b2c3d4e5f67890123456789012345678901abcde",
      "message": "fix: corrigir bug no calculo de porcentagem",
      "timestamp": "2026-09-02T20:05:00-03:00",
      "url": "https://github.com/guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica/commit/b2c3d4e",
      "author": {
        "name": "Guilherme Perecim",
        "email": "guilherme@test.com",
        "username": "guilhermeperecim-jpg"
      },
      "added": [],
      "modified": ["src/percentage.ts", "tests/percentage.test.ts"],
      "removed": ["src/old-percentage.ts"]
    }
  ]
}
'@

# Calcula HMAC-SHA256
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($secret)
$hash = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($body))
$signature = "sha256=" + [BitConverter]::ToString($hash).Replace("-","").ToLower()

Write-Host "`n=== Simulando PUSH webhook ===" -ForegroundColor Cyan
Write-Host "Repo: guilhermeperecim-jpg/Projeto-Calculadora-Cient-fica"
Write-Host "Commits: 2"
Write-Host "Signature: $signature`n"

# Envia o request
$response = Invoke-WebRequest -Uri "http://localhost:3000/webhooks/github" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{
        "X-GitHub-Event" = "push"
        "X-Hub-Signature-256" = $signature
        "X-GitHub-Delivery" = [guid]::NewGuid().ToString()
    } `
    -Body $body `
    -UseBasicParsing

Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Resposta: $($response.Content)`n"
