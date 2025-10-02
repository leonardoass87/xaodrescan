#!/bin/bash

echo "Parando containers existentes..."
docker-compose -f docker-compose.dev.yml down

echo "Removendo containers antigos..."
docker-compose -f docker-compose.dev.yml rm -f

echo "Iniciando ambiente de desenvolvimento..."
docker-compose -f docker-compose.dev.yml up --build
