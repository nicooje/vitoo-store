@echo off
chcp 65001 >nul
title Vito Store - Instalar agente del panel
cd /d "%~dp0bot-whatsapp"
where node >nul 2>nul || (echo Falta instalar Node.js: https://nodejs.org & pause & exit /b 1)
if not exist node_modules (
  echo Instalando el bot por primera vez, puede tardar un par de minutos...
  call npm install --omit=dev --no-fund --no-audit || (echo Fallo la instalacion. & pause & exit /b 1)
)
if not exist datos mkdir datos
set "INICIO=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
echo CreateObject("WScript.Shell").Run """%~dp0bot-whatsapp\agente-oculto.vbs""", 0, False> "%INICIO%\VitoStore-agente.vbs"
wscript "%~dp0bot-whatsapp\agente-oculto.vbs"
echo.
echo  Listo. El agente ya esta corriendo y va a arrancar solo cada vez que prendas la PC.
echo  Ahora podes usar el boton "Actualizar desde WhatsApp" del panel de administracion,
echo  desde la compu o desde el celular (con esta PC prendida).
echo.
echo  Registro del agente: bot-whatsapp\datos\agente.log
echo.
pause
