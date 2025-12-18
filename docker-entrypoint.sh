#!/bin/sh
set -e

echo "🚀 Starting Gabbeuty deployment..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "✅ DATABASE_URL is configured"

# Aguardar o banco estar pronto (já tem health check, mas garantir)
echo "⏳ Waiting for database to be ready..."
sleep 2

# Executar migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migrations failed"
  exit 1
fi

# Iniciar aplicação
echo "🎉 Starting application..."
exec node dist/src/main.js
