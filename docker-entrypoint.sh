#!/bin/sh
set -e
mkdir -p /app/data
export DATABASE_URL="file:/app/data/dev.db"
npx prisma migrate deploy
exec npm run start
