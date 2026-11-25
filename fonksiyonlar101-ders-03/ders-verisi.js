"use strict";

const examples = [
  {
    title: "Dijital serginin boyut ayarı",
    note: "Bir dijital sergide x, işaretin merkeze göre düşey konumudur. Standart ayar f(x) = x, büyütme ayarı g(x) = 2x, küçültme ayarı h(x) = 0,5x olur. Konumlar gerçek sayı olarak modellenir.",
    rule: "Aynı x için ax, referans grafiğinin y değerini a ile çarpar. |a| > 1 ise dikey genişleme, 0 < |a| < 1 ise dikey daralma olur.",
    coefficient: 2,
    questions: [
      ["x = −3, 0 ve 2 için f(x), g(x) ve h(x) tablosunu oluştur.", "Her sütunda aynı girdiyi üç farklı kurala uygula.", "f: −3, 0, 2. g: −6, 0, 4. h: −1,5, 0, 1.", "Girdi f’de aynen kalır, g’de iki katına çıkar, h’de yarıya iner. 0 üç kuralda da 0’a gider."],
      ["f, g ve h grafiklerini aynı eksenlerde çiz. Eğimlerini yaz ve dikliklerini karşılaştır.", "Üç doğru da orijinden geçer. Her doğru için x = 2 noktasını kullan.", "Eğimler f için 1, g için 2, h için 0,5. En dik g, en yatık h.", "Orijinden (2; 2), (2; 4) ve (2; 1) noktalarına uzanan doğrularda eğim Δy ÷ Δx ile bulunur. Diklik, eğimin mutlak değeriyle artar."],
      ["g’nin tanım ve görüntü kümelerini, sıfırını ve işaretini yaz. h ile ortak özelliklerini belirt.", "Pozitif katsayı x’in işaretini korur. y verildiğinde g için x = y/2 alınabilir.", "Her ikisinin tanım ve görüntü kümeleri ℝ, sıfırı 0. x < 0 için negatif, x > 0 için pozitif. İkisi de artan ve bire bir.", "Her iki katsayı pozitif ve sıfırdan farklı. Her y için tek bir x vardır. Pozitif katsayı girdinin sıralamasını ve işaretini korur."],
      ["x = −2 konumundaki bir işaret, yeni ayarda −1,5 konumuna geliyor. Kural g(x) = ax ise a’yı bul. Bu ayar x = 3’ü nereye taşır?", "−2a = −1,5 eşitliğini kur. Katsayının büyüklüğünü 1 ile karşılaştır.", "a = 0,75. Dikey daralma olur. x = 3, 2,25’e taşınır.", "−1,5 ÷ (−2) = 0,75. Katsayı pozitif olduğundan işaret korunur; 0,75 × 3 = 2,25."]
    ]
  },
  {
    title: "Ters yönlü kamera simülatörü",
    note: "Bir kamera simülatörü, kontrol çubuğunun işaretli x hareketini g(x) = −1,5x olarak görüntüye aktarıyor. Karşılaştırma modu f(x) = x. Her iki kural tüm gerçek girdiler için tanımlı.",
    rule: "Negatif a, x eksenine göre yansıma etkisi oluşturur. |a| dikey ölçek katsayısıdır. a < 0 iken fonksiyon azalandır.",
    coefficient: -1.5,
    questions: [
      ["g(−2), g(0) ve g(2) değerlerini bul. f ve g’de işaretlerin nasıl değiştiğini yaz.", "Negatif katsayı, sıfır dışındaki girdilerin işaretini tersine çevirir.", "Sırasıyla 3, 0 ve −3. f işareti korur, g tersine çevirir.", "−1,5 × (−2) = 3 ve −1,5 × 2 = −3. Sıfır her iki fonksiyonda da 0’a gider."],
      ["f ile g grafiklerini aynı eksenlerde çiz. g’nin eğimini ve f’ye uygulanan dönüşümleri yaz.", "Önce f’nin y değerlerini 1,5 ile çarp, sonra işaretlerini değiştir.", "Eğim −1,5. Dikeyde 1,5 kat genişleme ve x eksenine göre yansıma.", "g doğrusunu (0; 0) ve (2; −3) belirler. Δy ÷ Δx = −3 ÷ 2. Aynı girdide çıktı, f’nin −1,5 katıdır."],
      ["g’nin sıfırını, işaretini, artanlık durumunu ve bire birliğini yaz.", "a negatifken x > 0 için ax’in işareti nedir?", "Sıfır 0. x < 0 iken pozitif, x > 0 iken negatif. Azalan ve bire birdir.", "−1,5 ile çarpmak girdilerin sırasını tersine çevirir. Katsayı sıfırdan farklı olduğu için farklı girdiler farklı çıktılar üretir."],
      ["Simülatöre yeni bir k(x) = ax modu ekleniyor. k(3) = −1,5 ise a’yı ve k(−4)’ü bul. k ile g’den hangisi daha dik?", "a’yı bulmak için çıktıyı girdiye böl. Diklikte |a| değerlerini karşılaştır.", "a = −0,5. k(−4) = 2. g daha diktir.", "−1,5 ÷ 3 = −0,5. Her iki grafik de azalır. |−1,5| > |−0,5| olduğundan g daha diktir."]
    ]
  }
];

const assignments = [
  {
    title: "Çizim robotunun hassas ayarı",
    note: "Bir çizim robotu, verilen x hareket komutunun dörtte birini uyguluyor. Model h(x) = 0,25x ve tanım kümesi ℝ.",
    questions: [
      ["h(−4), h(0) ve h(8) değerlerini hesapla.", "", "−1, 0 ve 2.", "Her doğru değer 4 p."],
      ["h ve f(x) = x grafiklerini aynı eksenlerde çiz. h’nin eğimini yaz.", "", "h: (0; 0) ve (4; 1), f: (0; 0) ve (1; 1). Eğim 0,25.", "Her doğru 4 p, eğim 4 p."],
      ["h’nin görüntü kümesini, sıfırını ve artanlık durumunu yaz.", "", "Görüntü ℝ. Sıfır 0. Katsayı pozitif olduğu için artan.", "Görüntü 4 p, sıfır 4 p, artanlık 4 p."],
      ["−3 birimlik çıktı için hangi komut gerekir? h, f’ye göre hangi dönüşümdür?", "", "x = −12. Dikeyde daralma, çünkü 0 < 0,25 < 1.", "Gerekçeli girdi hesabı 8 p, dönüşüm ve gerekçe 6 p."]
    ]
  },
  {
    title: "Ters yönlü ışık göstergesi",
    note: "Bir ışık göstergesi, x ayarını z(x) = −2,5x olarak yansıtıyor. x tüm gerçek değerleri alabiliyor.",
    questions: [
      ["z(−2), z(0) ve z(2) değerlerini bul.", "", "5, 0 ve −5.", "Her doğru değer 4 p."],
      ["z ile f(x) = x grafiklerini çiz. z’nin eğimini ve dikey ölçeğini yaz.", "", "Eğim −2,5. Ölçek 2,5; x eksenine göre yansıma vardır.", "İki grafik 6 p, eğim 3 p, ölçek 3 p."],
      ["z’nin işaretini ve artanlık durumunu yaz. z bire bir mi?", "", "x < 0 için pozitif, x > 0 için negatif, x = 0 için sıfır. Azalan ve bire bir.", "İşaret 6 p, azalanlık 3 p, bire birlik 3 p."],
      ["Yeni bir mod, 4 girdisini −2’ye gönderiyor. Yeni k(x) = ax kuralını yaz ve z ile dikliklerini karşılaştır.", "", "k(x) = −0,5x. |−2,5| > |−0,5| olduğu için z daha dik.", "Doğru kural ve işlem 8 p, diklik karşılaştırması ve gerekçe 6 p."]
    ]
  }
];

const levels = ["Kolay", "Kolay–Orta", "Orta", "Yeni Nesil"];
const points = [12, 12, 12, 14];
const course = [
  "Bir ilişkiyi modelle", "Referans fonksiyonunu oku", "Eğimi değiştir", "Grafiği ötele",
  "Doğrusal ve sabit fonksiyonları incele", "Parçalı model kur", "Gerçek yaşam modellerini karşılaştır"
];
