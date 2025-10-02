@echo off
echo Iniciando ambiente de desenvolvimento...
wsl --cd /mnt/c/DevEnv/MVP-XAODRESCAN/xaodrescan docker compose -f docker-compose.dev.yml up --build
pause
