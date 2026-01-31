$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot

function Ensure-EnvFile {
    param(
        [string]$Source,
        [string]$Destination
    )
    if (-not (Test-Path $Destination)) {
        Copy-Item $Source $Destination -Force
        Write-Host "Created $Destination from $Source"
    } else {
        Write-Host "Env file exists: $Destination"
    }
}

function Set-EnvValue {
    param(
        [string]$Path,
        [string]$Key,
        [string]$Value
    )
    if (-not (Test-Path $Path)) {
        return
    }
    $lines = Get-Content $Path
    $found = $false
    $newLines = @()
    foreach ($line in $lines) {
        if ($line -match "^\s*#") {
            $newLines += $line
            continue
        }
        if ($line -match "^\s*$Key=") {
            $newLines += "$Key=$Value"
            $found = $true
        } else {
            $newLines += $line
        }
    }
    if (-not $found) {
        $newLines += "$Key=$Value"
    }
    Set-Content -Path $Path -Value $newLines -Encoding ASCII
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is not available on PATH. Install Docker Desktop and try again."
}

Ensure-EnvFile "docs\\backend.env.example" "backend\\.env"
Ensure-EnvFile "docs\\web.env.example" "web\\.env"
Ensure-EnvFile "docs\\mobile.env.example" "mobile\\.env"

Write-Host "Starting containers..."
docker compose up -d --build

Write-Host "Running migrations and demo seed..."
docker compose exec -T api python manage.py migrate
docker compose exec -T api python manage.py seed_demo

# Sincronizar el school_id demo con los .env (web/mobile) para evitar errores de tenant
$schoolInfo = docker compose exec -T api python manage.py shell -c "from core.models import School; s=School.objects.filter(subdomain='demo').first() or School.objects.order_by('id').first(); print(f'{s.id},{s.subdomain}' if s else '')" | Select-Object -Last 1
$schoolInfo = ($schoolInfo | ForEach-Object { $_.ToString() }).Trim()
if ($schoolInfo) {
    $parts = $schoolInfo.Split(",")
    if ($parts.Length -ge 1) {
        $schoolId = $parts[0].Trim()
        Set-EnvValue "web\\.env" "NEXT_PUBLIC_SCHOOL_ID" $schoolId
        Set-EnvValue "mobile\\.env" "EXPO_PUBLIC_SCHOOL_ID" $schoolId
        if ($parts.Length -ge 2) {
            $subdomain = $parts[1].Trim()
            if ($subdomain) {
                Set-EnvValue "mobile\\.env" "EXPO_PUBLIC_DOMAIN" "$subdomain.localhost"
            }
        }
    }
}

Write-Host "Refreshing web container to apply .env changes..."
docker compose up -d --build web

function Wait-ForUrl {
    param(
        [string]$Url,
        [hashtable]$Headers = $null,
        [int]$Retries = 30,
        [int]$DelaySeconds = 2
    )
    for ($i = 1; $i -le $Retries; $i++) {
        try {
            if ($Headers) {
                Invoke-WebRequest -Uri $Url -Headers $Headers -UseBasicParsing | Out-Null
            } else {
                Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            }
            Write-Host "OK: $Url"
            return
        } catch {
            Start-Sleep -Seconds $DelaySeconds
        }
    }
    Write-Host "Warning: $Url did not respond after $Retries attempts."
}

Wait-ForUrl "http://localhost:8000/api/docs" @{ "Host" = "demo.localhost" }
Wait-ForUrl "http://localhost:3000/dashboard"

Write-Host "Done. Web: http://localhost:3000 | API: http://localhost:8000"
