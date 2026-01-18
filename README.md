# Edebiyat Çarkı (Next.js)

Bu proje Next.js'e çevrilmiştir ve verileri PostgreSQL veritabanından çeker.

## Kurulum

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. `.env` dosyasını düzenleyin ve veritabanı bağlantı adresinizi (DATABASE_URL) girin.
   Varsayılan olarak localhost postgres kullanır.

3. Veritabanını hazırlayın ve örnek verileri (sample_cards.json) yükleyin:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *Not: Bu işlem `prisma/seed.ts` scriptini çalıştırır ve `legacy/sample_cards.json` dosyasındaki verileri veritabanına aktarır.*

4. Uygulamayı başlatın:
   ```bash
   npm run dev
   ```

## Notlar

- Orijinal proje dosyaları `legacy/` klasöründe yedeklenmiştir.
- Veriler `Card` tablosunda tutulur.
