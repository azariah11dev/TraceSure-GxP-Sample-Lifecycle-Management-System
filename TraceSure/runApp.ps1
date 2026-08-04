$ErrorActionPreference = "Stop"

trap {
    Write-Host "`nStopping Docker containers..."
    docker compose -f .\backend\docker-compose.yml down
    Write-Host "Docker stopped."
    return
}

Write-Host "Starting TraceSure System..."

# -----------------------------
# Start Docker backend services
# -----------------------------
Write-Host "Starting Docker backend services..."
docker compose -f .\backend\docker-compose.yml up -d

Write-Host "Checking backend health..."

$maxAttempts = 10
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $response = try { Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 } catch { $null }

    if ($response) {
        Write-Host "Backend is healthy."
        break
    }

    Write-Host "Backend not ready... ($attempt)"
    Start-Sleep -Seconds 1
    $attempt++
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Backend failed to start. Showing logs..."
    docker compose -f .\backend\docker-compose.yml logs
    return
}

Start-Sleep -Seconds 3

# -----------------------------
# Start Next.js Frontend
# -----------------------------
Write-Host "Starting Rust js frontend..."

$frontend = Start-Process -FilePath "node" `
    -ArgumentList "server.js" `
    -WorkingDirectory ".\frontend" `
    -PassThru

Start-Sleep -Seconds 3

Write-Host "Backend running at http://localhost:8000"
Write-Host "Frontend running at http://localhost:3000"
Write-Host "TraceSure System Ready."

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press CTRL+C to stop everything."

try {
    Wait-Process -Id $frontend.Id
}
finally {
    Write-Host "`nStopping TraceSure System..."
    docker compose -f .\backend\docker-compose.yml down
    Write-Host "Docker stopped."
}