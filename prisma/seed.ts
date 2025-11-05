import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create buckets with works
  const bucket1 = await prisma.bucket.create({
    data: {
      name: "Klasik Romanlar",
      bucketNumber: 1,
      works: {
        create: [
          {
            title: "Sefiller",
            type: "Kitap",
            author: "Victor Hugo",
            text: "Fransa'da Jean Valjean'ın hayat hikayesini anlatan, adalet ve merhamet temalarını işleyen başyapıt."
          },
          {
            title: "Karamazov Kardeşler",
            type: "Kitap",
            author: "Fyodor Dostoyevski",
            text: "Karamazov Kardeşler, Fyodor Dostoyevski tarafından yazılmış, aynı zamanda Fyodor Dostoyevski'nin en büyük eserlerinden biridir."
          }
        ]
      }
    }
  });

  const bucket2 = await prisma.bucket.create({
    data: {
      name: "Modern Şiirler",
      bucketNumber: 2,
      works: {
        create: [
          {
            title: "Ben Sana Mecburum",
            type: "Şiir",
            author: "Attilâ İlhan",
            text: "Ben sana mecburum bilemezsin\nAdını mıh gibi aklımda tutuyorum\nBüyüdükçe büyüyor gözlerin\nBen sana mecburum bilemezsin\nİçimi seninle ısıtıyorum.\n\nAğaçlar sonbahara hazırlanıyor\nBu şehir o eski İstanbul mudur\nKaranlıkta bulutlar parçalanıyor\nSokak lambaları birden yanıyor\nKaldırımlarda yağmur kokusu\nBen sana mecburum sen yoksun.\n\n..."
          },
          {
            title: "Çılgın Harita",
            type: "Şiir",
            author: "İlhan Berk",
            text: "Olaylar ülkesinin Çılgın Haritası'nı çizen bu şiir, modern Türk şiirinin öncü örneklerindendir."
          }
        ]
      }
    }
  });

  const bucket3 = await prisma.bucket.create({
    data: {
      name: "Öykü ve Hikayeler",
      bucketNumber: 3,
      works: {
        create: [
          {
            title: "Kuyucaklı Yusuf",
            type: "Edebi Metin",
            author: "Sabahattin Ali",
            text: "Küçük bir kasabada geçen bu öykü, sosyal gerçeklikleri çarpıcı bir dille anlatır."
          },
          {
            title: "Kırmızı Başlıklı Kız",
            type: "Edebi Metin",
            author: "Charles Perrault",
            text: "Klasik bir masal olan Kırmızı Başlıklı Kız'ın Perrault tarafından kaleme alınmış orijinal versiyonu."
          },
          {
            title: "Kale",
            type: "Edebi Metin",
            author: "Sabahattin Ali",
            text: "Kale, Sabahattin Ali tarafından yazılmış, 1920'lerde Avrupa'da yaşananların anlatıldığı bir masaldır."
          }
        ]
      }
    }
  });

  const bucket4 = await prisma.bucket.create({
    data: {
      name: "Dünya Klasikleri",
      bucketNumber: 4,
      works: {
        create: [
          {
            title: "Simyacı",
            type: "Kitap",
            author: "Paulo Coelho",
            text: "Genç bir çobanın hazineleri arayışını konu alan, hayata dair derin anlamlar barındıran roman."
          },
          {
            title: "Kürk Mantolu Madonna",
            type: "Kitap",
            author: "Sabahattin Ali",
            text: "Kürk Mantolu Madonna, 1920'lerde Avrupa'da yaşananların anlatıldığı, korku ve aşk konusunda bir kitaptır."
          }
        ]
      }
    }
  });

  const bucket5 = await prisma.bucket.create({
    data: {
      name: "Milli Eserler",
      bucketNumber: 5,
      works: {
        create: [
          {
            title: "İstiklal Marşı",
            type: "Şiir",
            author: "Mehmet Akif Ersoy",
            text: "Korkma, sönmez bu şafaklarda yüzen al sancak;\nSönmeden yurdumun üstünde tüten en son ocak.\nO benim milletimin yıldızıdır, parlayacak;\nO benimdir, o benim milletimindir ancak.\nÇatma, kurban olayım çehreni ey nazlı hilâl!\nKahraman ırkıma bir gül… ne bu şiddet, bu celâl?\nSana olmaz dökülen kanlarımız sonra helâl,\nHakkıdır, Hakk'a tapan, milletimin istiklâl."
          },
          {
            title: "Her İnsan Öldürür Sevdiğini",
            type: "Şiir",
            author: "Oscar Wilde",
            text: "Her insan öldürür gene de sevdiğini\nBu böyle bilinsin herkes tarafından,\nKiminin ters bakışından gelir ölüm,\nKiminin iltifatından,\nKorkağın öpücüğünden,\nCesurun kılıcından!\n\nKimisi aşkını gençlikte öldürür,\nYaşını başını almışken kimi;\nBiri Şehvet'in elleriyle boğazlar,\nBirinin altındır elleri,\nYumuşak kalpli bıçak kullanır\nÇünkü ceset soğur hemen.\n\nKimi pek az sever, kimi derinden,\nBiri müşteridir, diğeri satıcı;\nKimi vardır, gözyaşlarıyla bitirir işi,\nKiminden ne bir ah, ne bir figan:\nÇünkü her insan öldürür sevdiğini,\nGene de ölmez insan."
          }
        ]
      }
    }
  });

  console.log('Sample buckets and works added');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
