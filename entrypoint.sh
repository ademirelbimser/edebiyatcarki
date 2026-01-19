#!/bin/sh

# Veritabanının hazır olmasını bekle (opsiyonel ama önerilir)
echo "Veritabanı bağlantısı kontrol ediliyor..."

# Prisma şemasını veritabanına uygula
echo "Prisma db push çalıştırılıyor..."
npx prisma db push --accept-data-loss

# Başlangıç verilerini yükle (Seed)
# Not: seed.ts dosyanız verileri sıfırlayıp tekrar yüklediği için 
# her yeniden başlatmada verilerin sıfırlanmasını istemiyorsanız burayı yorum satırı yapabilirsiniz.
echo "Seed datası yükleniyor..."
npx prisma db seed

# Uygulamayı başlat
echo "Uygulama başlatılıyor..."
exec "$@"
