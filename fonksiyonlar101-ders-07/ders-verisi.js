"use strict";

const examples = [
  {
    title:"İki seramik fırını",
    note:"A fırını 20 °C’den başlayıp dakikada 5 °C ısınıyor. B fırını 26 °C’den başlayıp dakikada 3 °C ısınıyor. İlk 8 dakika modelleniyor.",
    rule:"Eğim, ısınma hızıdır. Başlangıç değeri ile eğim birlikte ele alınır. Modellerin eşitlendiği zaman, iki grafiğin kesişimidir.",
    chart:{x:"Süre (dk)",y:"Sıcaklık (°C)",maxX:8,maxY:64,names:["Fırın A","Fırın B"],
      segments:[{from:0,to:8,a:5,b:20,c:0},{from:0,to:8,a:3,b:26,c:1}]},
    questions:[
      ["Bağımsız ve bağımlı değişkenleri birimleriyle yaz. İki fırının başlangıç değerlerini ve eğimlerini belirt.","Zaman girdidir. Bir dakikadaki artış eğimi verir.","x: dakika, y: sıcaklık (°C). A: 20 ve 5 °C/dk. B: 26 ve 3 °C/dk.","A daha düşük sıcaklıktan başlar ve daha hızlı ısınır."],
      ["A ve B’nin kurallarını yaz, grafiklerini aynı eksenlerde çiz. 0 ve 8. dakikadaki sıcaklıkları kullan.","Başlangıç sıcaklığına dakika başına artışın x katını ekle.","A(x) = 20 + 5x, B(x) = 26 + 3x. A: 20 → 60. B: 26 → 50.","A grafiği (0; 20) ve (8; 60), B grafiği (0; 26) ve (8; 50) noktalarından geçer."],
      ["Kaçıncı dakikada sıcaklıklar eşit? Kesişim noktasını ve bunun anlamını yaz.","20 + 5x = 26 + 3x denklemini çöz.","(3; 35). İki fırın 3. dakikada 35 °C’dir.","2x = 6 ⇒ x = 3. A(3) = B(3) = 35."],
      ["Hangi zaman aralıklarında hangi fırın daha sıcak? 8. dakika sonrasına dair ne söyleyebilirsin?","A(x) − B(x) ifadesinin işaretini incele. Modelin zaman aralığına dön.","[0; 3) aralığında B, (3; 8] aralığında A daha sıcak. x = 3’te eşit. Model ilk 8 dakikayı kapsar.","A(x) − B(x) = 2x − 6. Başta fark negatif, eşikten sonra pozitiftir. Verilen koşullarla 8. dakikanın ötesi çıkarılamaz."]
    ]
  },
  {
    title:"İki bataryanın seviye kaydı",
    note:"Testte A bataryası %72’den başlayıp saatte 6 yüzde puan azalıyor. B bataryası %30’dan başlayıp saatte 4 yüzde puan artıyor. 0–10 saatlik bölüm modelleniyor.",
    rule:"Eğimin işareti modelin yönünü gösterir. Bağlamdaki tanım aralığı, uç değerleri ve yapılan yorumların geçerli olduğu süreyi belirler.",
    chart:{x:"Süre (saat)",y:"Seviye (%)",maxX:10,maxY:80,names:["Batarya A","Batarya B"],
      segments:[{from:0,to:10,a:-6,b:72,c:0},{from:0,to:10,a:4,b:30,c:1}]},
    questions:[
      ["İki batarya için başlangıç seviyesini, eğimi ve artma–azalma durumunu yaz.","Yüzde puanda saatlik değişimin işaretini takip et.","A: %72, −6 yüzde puan/saat, azalan. B: %30, +4 yüzde puan/saat, artan.","Eğimler zıt işaretlidir. Sabit hızla kullanım A’yı düşürür, şarj B’yi yükseltir."],
      ["İki kuralı yaz ve grafiklerini çiz. 0 ve 10. saatleri hesapla.","Başlangıç + eğim × saat biçimini kullan.","A(x) = 72 − 6x, B(x) = 30 + 4x. A: %72 → %12, B: %30 → %70.","Noktalar A için (0; 72), (10; 12), B için (0; 30), (10; 70)."],
      ["Seviyelerin eşitlendiği zamanı ve ortak seviyeyi bul.","72 − 6x = 30 + 4x eşitliğini kur.","4,2 saatte %46,8. Bu, 4 saat 12 dakikadır.","42 = 10x ⇒ x = 4,2. B(4,2) = 30 + 16,8 = 46,8."],
      ["Verilen test boyunca A ve B’nin en düşük ve en yüksek seviyelerini belirle. Sonuçları eğimleriyle açıkla.","Aralık kapalıdır. Azalan ve artan grafiklerin uçlarına bak.","A: min %12, maks %72. B: min %30, maks %70.","A’nın en yüksek değeri başlangıçta, B’nin en yüksek değeri bitiştedir. İki aralık ucu da modele dahildir."]
    ]
  }
];

const assignments = [
  {
    title:"İki etkinlik alanı tarifesi",note:"X alanı 40 TL başlangıç ve saat başına 12 TL, Y alanı 64 TL başlangıç ve saat başına 6 TL alıyor. 0–8 saat aralığı geçerli.",
    questions:[
      ["İki modelin başlangıç ücretini ve eğimini yaz.","","X: 40 TL ve 12 TL/saat. Y: 64 TL ve 6 TL/saat.","Her model 6 p."],
      ["Kuralları yaz ve aynı eksen takımında grafiklerini çiz.","","X(t)=40+12t, Y(t)=64+6t. 8 saatte sırasıyla 136 ve 112 TL.","Kurallar 6 p, grafikler 6 p."],
      ["Eşit ücretin alındığı süreyi ve ücreti hesapla.","","4 saat, 88 TL.","Süre ve işlem 8 p, ücret 4 p."],
      ["Hangi sürelerde X daha ucuz? 6 saat için tasarrufu hesapla.","","0 ≤ t < 4 için X daha ucuz. 6 saatte Y seçilirse 12 TL tasarruf edilir.","Doğru aralık 7 p, hesap 7 p."]
    ]
  },
  {
    title:"İki sulama haznesi",note:"A haznesinde 60 L su var ve dakikada 5 L azalıyor. B’de 20 L var ve dakikada 3 L artıyor. İlk 8 dakika modelleniyor.",
    questions:[
      ["Her haznenin başlangıç miktarını ve değişim oranını yaz.","","A: 60 L ve −5 L/dk. B: 20 L ve +3 L/dk.","Her model 6 p."],
      ["A ve B’nin kurallarını yaz, grafiklerini çiz.","","A(t)=60−5t, B(t)=20+3t. 8 dakikada A 20 L, B 44 L.","Kurallar 6 p, grafikler 6 p."],
      ["Miktarlar kaçıncı dakikada kaç litreye eşit olur?","","5. dakikada 35 L.","Süre ve işlem 8 p, miktar 4 p."],
      ["En düşük ve en yüksek miktarları iki hazne için yaz.","","A: min 20, maks 60 L. B: min 20, maks 44 L.","Her hazne için değerler ve gerekçe 7 p."]
    ]
  }
];
const levels=["Kolay","Kolay–Orta","Orta","Yeni Nesil"];
const points=[12,12,12,14];
const course=["Bir ilişkiyi modelle","Referans fonksiyonunu oku","Eğimi değiştir","Grafiği ötele","Doğrusal ve sabit fonksiyonları incele","Parçalı model kur","Gerçek yaşam modellerini karşılaştır"];
