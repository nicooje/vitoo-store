@echo off
chcp 65001 >nul
title Vito Store - Actualizar web desde WhatsApp
cd /d "%~dp0bot-whatsapp"
where node >nul 2>nul || (echo Falta instalar Node.js: https://nodejs.org & pause & exit /b 1)
if not exist node_modules (
  echo Instalando el bot por primera vez, puede tardar un par de minutos...
  call npm install --omit=dev --no-fund --no-audit || (echo Fallo la instalacion. & pause & exit /b 1)
)
call npx tsx src/bot.ts %*
echo.
pause
