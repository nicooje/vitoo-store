@echo off
chcp 65001 >nul
title Vito Store - Desinstalar agente del panel
set "INICIO=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
if exist "%INICIO%\VitoStore-agente.vbs" del "%INICIO%\VitoStore-agente.vbs"
if exist "%~dp0bot-whatsapp\datos\agente.pid" (
  set /p PID=<"%~dp0bot-whatsapp\datos\agente.pid"
  call taskkill /PID %%PID%% /F >nul 2>nul
  del "%~dp0bot-whatsapp\datos\agente.pid"
)
echo.
echo  Listo. El agente se detuvo y ya no arranca con Windows.
echo  El boton "Actualizar Vito Store.bat" sigue funcionando a mano.
echo.
pause
