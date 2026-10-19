# AI HOME PLATFORM — task runner cho môi trường Laragon (thay cho docker compose / make).
#
# Dùng:  .\laragon\dev.ps1 <task> [tham số]
# Ví dụ: .\laragon\dev.ps1 status
#        .\laragon\dev.ps1 artisan route:list
#        .\laragon\dev.ps1 check-php
#
# Mọi task đều chạy trực tiếp trên PHP/Node của máy — không có container nào.

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Task = 'help',

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Rest = @()
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$Root      = Split-Path -Parent $PSScriptRoot
$ApiDir    = Join-Path $Root 'apps\api'
$Laragon   = if ($env:LARAGON_DIR) { $env:LARAGON_DIR } else { 'C:\laragon' }
$SitesDir  = Join-Path $Laragon 'etc\nginx\sites-enabled'
$HostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$AppUrl    = 'http://ai-home.test:8080'
$MailUrl   = 'http://localhost:8025'

function Resolve-Php {
    if ($env:PHP_BIN -and (Test-Path $env:PHP_BIN)) { return $env:PHP_BIN }
    $candidates = @(
        (Join-Path $Laragon 'bin\php\php-8.3*\php.exe'),
        (Join-Path $Laragon 'bin\php\php-8.*\php.exe')
    )
    foreach ($pattern in $candidates) {
        $hit = Get-Item $pattern -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
        if ($hit) { return $hit.FullName }
    }
    throw "Không tìm thấy php.exe trong $Laragon\bin\php. Đặt biến môi trường PHP_BIN để chỉ định thủ công."
}

function Resolve-NginxDir {
    $hit = Get-Item (Join-Path $Laragon 'bin\nginx\nginx-*') -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending | Select-Object -First 1
    if (-not $hit) { throw "Không tìm thấy nginx trong $Laragon\bin\nginx." }
    return $hit.FullName
}

$Php = Resolve-Php

function Invoke-Step {
    param([string]$Exe, [string[]]$Arguments, [string]$WorkDir = $Root)

    Push-Location $WorkDir
    try {
        Write-Host "> $Exe $($Arguments -join ' ')" -ForegroundColor DarkGray
        & $Exe @Arguments
        if ($LASTEXITCODE -ne 0) { throw "Lệnh thất bại (exit $LASTEXITCODE): $Exe $($Arguments -join ' ')" }
    }
    finally { Pop-Location }
}

function Invoke-Php    { param([string[]]$a) Invoke-Step $Php $a $ApiDir }
function Invoke-Artisan { param([string[]]$a) Invoke-Php (@('artisan') + $a) }
function Invoke-Pnpm   { param([string[]]$a) Invoke-Step 'pnpm' $a $Root }

$JsPackages = @('aihome-app', '@aihome/config-schema', '@aihome/bdm', '@aihome/planner', '@aihome/cad-export', '@aihome/render3d')

function Test-Process { param([string]$Name) [bool](Get-Process -Name $Name -ErrorAction SilentlyContinue) }

switch ($Task.ToLowerInvariant()) {

    'help' {
        Write-Host '========================================================================'
        Write-Host 'AI HOME PLATFORM — Local Development Helper (Laragon, không dùng Docker)'
        Write-Host '========================================================================'
        @(
            'install-site   Cài vhost nginx vào Laragon + kiểm tra file hosts',
            'nginx-reload   Test cấu hình và reload nginx của Laragon',
            'status         Kiểm tra nginx / php-cgi / mailpit / mysql + URL',
            'install        composer install + pnpm install',
            'up             Migrate DB rồi in ra các URL (nginx phục vụ sẵn)',
            'dev            Chạy Vite dev server (HMR) ở cổng 5173',
            'build          Build React vào apps/api/public/build (1 cổng PHP)',
            'artisan ...    Chạy php artisan (vd: dev.ps1 artisan route:list)',
            'composer ...   Chạy composer trong apps/api',
            'tinker         Mở php artisan tinker',
            'migrate        Chạy migration',
            'fresh          migrate:fresh --seed (làm lại DB từ đầu)',
            'seed           Chạy database seeders (tài khoản dev local)',
            'db-shell       Mở shell DB (php artisan db)',
            'queue          Chạy worker queue (php artisan queue:work)',
            'mail           Mở Mailpit UI',
            'lint / fix     Kiểm tra / tự sửa coding style',
            'test           Pest + Vitest',
            'typecheck      Larastan level 6 + TypeScript tsc',
            'check          check-php + check-js',
            'schema         Sinh lại JSON Schema + fixtures từ Zod',
            'reset          Tạo lại database sqlite sạch (có xác nhận)'
        ) | ForEach-Object { Write-Host "  $_" }
        Write-Host '========================================================================'
        Write-Host "PHP đang dùng: $Php"
    }

    'install-site' {
        if (-not (Test-Path $SitesDir)) { throw "Không thấy $SitesDir — Laragon chưa cài nginx?" }
        $src = Join-Path $PSScriptRoot 'nginx\ai-home.test.conf'
        Copy-Item $src (Join-Path $SitesDir 'ai-home.test.conf') -Force
        Write-Host "==> Đã cài vhost: $SitesDir\ai-home.test.conf" -ForegroundColor Green

        if (Select-String -Path $HostsFile -Pattern 'ai-home\.test' -Quiet -ErrorAction SilentlyContinue) {
            Write-Host '==> hosts: đã có ai-home.test' -ForegroundColor Green
        }
        else {
            Write-Host '==> CẦN THÊM hosts — mở PowerShell as Administrator và chạy:' -ForegroundColor Yellow
            Write-Host "    Add-Content '$HostsFile' '127.0.0.1 ai-home.test'" -ForegroundColor Yellow
        }
        & $PSCommandPath 'nginx-reload'
    }

    'nginx-reload' {
        $dir = Resolve-NginxDir
        Invoke-Step (Join-Path $dir 'nginx.exe') @('-t') $dir
        Invoke-Step (Join-Path $dir 'nginx.exe') @('-s', 'reload') $dir
        Write-Host "==> nginx đã reload ($dir)" -ForegroundColor Green
    }

    'status' {
        Write-Host "PHP          : $Php"
        Write-Host ("PHP version  : " + (& $Php -r 'echo PHP_VERSION;'))
        Write-Host ("nginx        : " + $(if (Test-Process 'nginx')   { 'running' } else { 'STOPPED (bật trong Laragon)' }))
        Write-Host ("php-cgi      : " + $(if (Test-Process 'php-cgi') { 'running' } else { 'STOPPED (bật nginx trong Laragon)' }))
        Write-Host ("mailpit      : " + $(if (Test-Process 'mailpit') { 'running' } else { 'STOPPED (bật trong Laragon)' }))
        Write-Host ("mysql        : " + $(if (Test-Process 'mysqld')  { 'running' } else { 'stopped (không cần khi DB_CONNECTION=sqlite)' }))
        Write-Host ("vhost        : " + $(if (Test-Path (Join-Path $SitesDir 'ai-home.test.conf')) { 'đã cài' } else { 'CHƯA cài (chạy dev.ps1 install-site)' }))
        Write-Host ("hosts        : " + $(if (Select-String -Path $HostsFile -Pattern 'ai-home\.test' -Quiet -ErrorAction SilentlyContinue) { 'đã có ai-home.test' } else { 'CHƯA có ai-home.test' }))
        Write-Host "App URL      : $AppUrl"
        Write-Host "Health       : $AppUrl/api/v1/health"
        Write-Host "Mailpit UI   : $MailUrl (SMTP 127.0.0.1:1025)"
    }

    'install' {
        Invoke-Step 'composer' @('install') $ApiDir
        Invoke-Pnpm @('install')
    }

    'up' {
        & $PSCommandPath 'status'
        Invoke-Artisan @('migrate')
        Write-Host "==> Mở $AppUrl — nginx của Laragon phục vụ apps\api\public" -ForegroundColor Green
    }

    'dev'     { Invoke-Pnpm @('--filter', 'aihome-app', 'dev') }

    'build' {
        Remove-Item (Join-Path $ApiDir 'public\hot') -ErrorAction SilentlyContinue
        Invoke-Pnpm @('--filter', 'aihome-app', 'build')
    }

    'artisan'  { Invoke-Artisan $(if ($Rest.Count) { $Rest } else { @('list') }) }
    'composer' { Invoke-Step 'composer' $(if ($Rest.Count) { $Rest } else { @('list') }) $ApiDir }
    'tinker'   { Invoke-Artisan @('tinker') }
    'migrate'  { Invoke-Artisan @('migrate') }
    'fresh'    { Invoke-Artisan @('migrate:fresh', '--seed') }
    'seed'     { Invoke-Artisan @('db:seed') }
    'db-shell' { Invoke-Artisan @('db') }
    'queue'    { Invoke-Artisan @('queue:work', '--sleep=3', '--tries=3') }
    'mail'     { Start-Process $MailUrl }

    'lint' {
        Invoke-Php @('vendor/bin/pint', '--test')
        foreach ($p in $JsPackages) {
            Invoke-Pnpm @('--filter', $p, 'lint')
            Invoke-Pnpm @('--filter', $p, 'format:check')
        }
    }

    'fix' {
        Invoke-Php @('vendor/bin/pint')
        foreach ($p in $JsPackages) {
            Invoke-Pnpm @('--filter', $p, 'lint:fix')
            Invoke-Pnpm @('--filter', $p, 'format')
        }
    }

    'test' {
        Invoke-Php @('vendor/bin/pest')
        Invoke-Pnpm @('--filter', 'aihome-app', 'test')
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'test')
    }

    'typecheck' {
        Invoke-Php @('vendor/bin/phpstan', 'analyse')
        foreach ($p in $JsPackages) { Invoke-Pnpm @('--filter', $p, 'typecheck') }
    }

    'check' {
        & $PSCommandPath 'check-php'
        & $PSCommandPath 'check-js'
    }

    'check-php' {
        Invoke-Php @('vendor/bin/pint', '--test')
        Invoke-Php @('vendor/bin/phpstan', 'analyse')
        Invoke-Php @('vendor/bin/pest')
    }

    'check-js' {
        foreach ($p in $JsPackages) {
            Invoke-Pnpm @('--filter', $p, 'lint')
            Invoke-Pnpm @('--filter', $p, 'format:check')
            Invoke-Pnpm @('--filter', $p, 'typecheck')
        }
        Invoke-Pnpm @('--filter', 'aihome-app', 'test')
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'test')
        & $PSCommandPath 'schema-check'
    }

    'schema' {
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'schema:generate')
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'fixtures:generate')
    }

    'schema-check' {
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'schema:check')
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'fixtures:check')
        Invoke-Pnpm @('--filter', '@aihome/config-schema', 'schema:verify')
    }

    'reset' {
        $answer = Read-Host 'CẢNH BÁO: Thao tác này sẽ xóa database sqlite và cache. Tiếp tục? [y/N]'
        if ($answer -notmatch '^(y|yes)$') { Write-Host 'Đã hủy thao tác reset.'; break }
        try { Invoke-Artisan @('optimize:clear') } catch { Write-Host 'Bỏ qua optimize:clear.' }
        Get-ChildItem (Join-Path $ApiDir 'database') -Filter 'database.sqlite*' -ErrorAction SilentlyContinue |
            Remove-Item -Force
        New-Item -ItemType File (Join-Path $ApiDir 'database\database.sqlite') | Out-Null
        Invoke-Artisan @('migrate', '--seed')
        Write-Host 'Đã tạo lại database sạch.' -ForegroundColor Green
    }

    default {
        Write-Host "Task không hợp lệ: $Task" -ForegroundColor Red
        & $PSCommandPath 'help'
        exit 1
    }
}
