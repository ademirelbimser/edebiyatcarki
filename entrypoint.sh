#!/bin/sh
set -e

echo "Veritabanı bağlantısı kontrol ediliyor..."

echo "Prisma db push çalıştırılıyor..."
npx prisma db push --skip-generate --accept-data-loss

echo "Seed datası yükleniyor..."
npx tsx prisma/seed.ts || echo "⚠️  Seed hatası, devam ediliyor..."

echo "Uygulama başlatılıyor..."
exec "$@"