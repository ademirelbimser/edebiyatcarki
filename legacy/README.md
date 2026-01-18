# Edebiyat Çarkı Projesi

Bu proje, çocukların kitaplar, şiirler ve edebi metinler hakkında bilgi edinebileceği interaktif bir çark oyunudur. Gerçek bir dönme dolap tarzı bir arayüz kullanılarak tasarlanmıştır.

## Proje Açıklaması

Proje, çocuklar için eğlenceli ve öğretici bir şekilde edebi eserleri keşfetmelerini sağlar. Kullanıcı çarkı çevir butonuna bastığında, çark rastgele bir edebi eser seçer ve bu eser hakkında bilgiler gösterilir.

## Yeni Özellikler

### SVG Tabanlı Gerçekçi Dönme Dolap
- Projede artık SVG tabanlı gerçekçi bir dönme dolap kullanılmaktadır
- Gece modu tasarımı ile gökkuşağı ışıkları ve yıldızlı arka plan
- 12 kabinli dönme dolap tasarımı
- Her kabin farklı bir renkte ve numaralandırılmış

### JSON ile Kart Yükleme
- Kullanıcılar artık kendi edebi eserlerini içeren JSON dosyalarını sisteme yükleyebilir
- JSON dosyası şeması basit ve anlaşılır şekilde tasarlanmıştır
- Örnek bir JSON dosyası projeye dahil edilmiştir

### Gelişmiş Fiziksel Etkileşim
- Butona ne kadar uzun basılırsa çark o kadar hızlı döner
- Çarkın durma süresi ayarlanabilir
- Gerçekçi fiziksel simülasyon ile yavaşlama efekti

## Kullanılan Teknolojiler

- **HTML**: Sayfanın iskeletini oluşturur
- **CSS**: Sayfanın renkli ve görsel olarak çekici olmasını sağlar
- **JavaScript**: Çarkın dönmesi ve rastgele seçim yapılması gibi etkileşimleri sağlar
- **SVG**: Gerçekçi dönme dolap tasarımı için vektörel grafikler
- **JSON Parsing**: Kullanıcı tarafından yüklenen JSON dosyalarının işlenmesi

## Kod Açıklamaları

### HTML Yapısı
```html
- <!DOCTYPE html>: HTML5 belgesi olduğunu belirtir
- <head>: Sayfa başlığı ve stilleri içerir
- <body>: Sayfanın görünen içeriğini içerir
```

### CSS Stilleri
```css
- :root: Renk değişkenlerini tanımlar
- .wrap: Ana konteynerin stilini belirler
- .cabin: Kabinlerin stilini tanımlar
- .result-card: Seçilen eserin gösterildiği kartın stili
```

### JavaScript İşlevleri
```javascript
- createStars(): Arka plandaki yıldızları oluşturur
- createCabinsAndLights(): Dönme dolap kabinlerini ve ışıklarını oluşturur
- loadJsonData(): JSON dosyasını yükleyen fonksiyon
- showRandomResult(): Rastgele seçilen eserin bilgilerini gösteren fonksiyon
- update(): Çarkın fiziksel simülasyonunu yöneten fonksiyon
```

## Nasıl Çalışır?

1. Sayfa yüklendiğinde, 12 kabinli dönme dolap otomatik olarak oluşturulur
2. Kullanıcılar istersen JSON dosyası yükleyerek kendi kartlarını ekleyebilir
3. "Basılı Tut → Dön" butonuna tıklandığında:
   - Kullanıcı butona ne kadar uzun basarsa çark o kadar güçlü döner
   - Bıraktığında çark ayarlanabilir sürede yavaşlayıp durur
   - Durduktan sonra rastgele bir eser seçilir
   - Seçilen eser hakkında bilgiler ekranda gösterilir

## JSON Dosya Formatı

```json
[
  {
    "Başlık": "Eser Adı",
    "Tür": "Eser Türü (Kitap/Şiir/Edebi Metin)",
    "Yazar": "Yazar Adı",
    "Metin": "Eser açıklaması"
  }
]
```

## Kodu Anlama Rehberi

### 1. Değişkenler
```javascript
let literaryWorks = [...] // Edebî eserler burada tanımlanır
const colors = [...] // Her kabin için farklı renkler
const NUM_CABINS = 12 // Kabin sayısı
```

### 2. Fonksiyonlar
```javascript
function update() { ... } // Çarkın fiziksel simülasyonunu yönetir
function showRandomResult() { ... } // Rastgele sonuç gösterir
function loadJsonData() { ... } // JSON dosyasını yükler
function createCabinsAndLights() { ... } // Dönme dolap oluşturur
```

### 3. Olay Dinleyiciler
```javascript
.addEventListener('mousedown', startPress) // Butona basma olayını yakalar
.addEventListener('mouseup', endPress) // Butondan el çekme olayını yakalar
```

## Özelleştirme Önerileri

1. **Yeni Eser Ekleme**:
   ```javascript
   {
       "Başlık": "Eser Adı",
       "Tür": "Tür (Kitap/Şiir/Metin)",
       "Yazar": "Yazar Adı",
       "Metin": "Eser açıklaması"
   }
   ```

2. **JSON Dosyası ile Eser Ekleme**:
   - sample_cards.json dosyasını örnek olarak kullanabilirsiniz
   - Kendi eserlerinizi bu formata uygun olarak ekleyebilirsiniz

3. **Renk Değiştirme**:
   `colors` dizisine yeni renk kodları ekleyebilirsin

4. **Fiziksel Ayarlar**:
   - `maxAngVel`: Maksimum dönme hızı
   - `accelWhilePress`: İvme değeri
   - `stopTargetInput`: Durma süresi ayarı

## Öğrenme Kazanımları

Bu proje ile şu konular öğrenilir:
- HTML temelleri
- CSS ile stillendirme ve layout
- JavaScript ile etkileşim ekleme
- SVG grafiklerle çalışma
- Diziler (arrays) ve nesneler (objects)
- Fonksiyonlar ve olay dinleyiciler
- DOM manipülasyonu
- JSON dosya işleme
- Fiziksel simülasyon ve animasyon
- Kullanıcı etkileşimli animasyonlar