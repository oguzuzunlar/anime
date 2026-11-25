"use strict";

const examples = [
  {
    title: "Okul şenliği afişleri", note: "Okul kulübü şenlik için en fazla 30 afiş bastırabiliyor. Baskı atölyesi hazırlık için 24 TL, basılan her afiş için 3 TL alıyor. Hazırlık yapıldıysa afiş basılmasa bile 24 TL ödeniyor.",
    rule: "Girdi afiş sayısı, çıktı toplam maliyettir. Eğim, maliyetteki değişimin afiş sayısındaki değişime oranıdır.",
    graph: {base:24, rate:3, limit:30, step:1, discrete:true, x:"Afiş sayısı", y:"Maliyet (TL)"},
    questions: [
      ["Bağımsız ve bağımlı değişkenleri yaz. Hazırlık sonrası 0 afiş basılırsa kulüp kaç TL öder?", "Hesabı başlatan bilgiyi ve hesaplanan tutarı ayır.", "x: afiş sayısı. y: toplam maliyet (TL). Kulüp 24 TL öder.", "x = 0 iken afiş başına maliyetin katkısı 0 TL’dir. Yalnızca 24 TL hazırlık ücreti kalır."],
      ["0, 4, 8 ve 12 afiş için maliyet tablosunu oluştur.", "Afiş sayısını 3 ile çarp, hazırlık ücretini ekle.", "Sırasıyla 24, 36, 48 ve 60 TL.", "Ek ücretler sırasıyla 0, 12, 24 ve 36 TL’dir. Her tutara 24 TL eklenir."],
      ["4 ve 8 afişe karşılık gelen noktaları işaretle, eksenleri adlandır ve eğimi hesapla. Grafikte ara değerleri neden işaretlemezsin?", "İki noktadan maliyet farkını ve afiş sayısı farkını bul.", "(4; 36) ve (8; 48). Eğim 3 TL/afiş. Afiş sayısı tam sayıdır.", "Yatay eksen afiş sayısı, dikey eksen maliyettir. Eğim (48 − 36) ÷ (8 − 4) = 3 TL/afiş. Kesirli sayıda afiş basılamaz."],
      ["Maliyet kuralını yaz. Kulüp 85 TL ile en fazla kaç afiş bastırır? Neden bir fazlasını bastıramaz?", "Hazırlık ücretini bütçeden çıkar ve kalan parayı 3’e böl.", "y = 24 + 3x. En fazla 20 afiş.", "24 + 3x ≤ 85, dolayısıyla x ≤ 61/3. En büyük uygun tam sayı 20’dir. 20 afiş 84 TL, 21 afiş 87 TL tutar."]
    ]
  },
  {
    title: "Robotun test pisti", note: "Bir robot, cetvelli test pistinde 6 cm işaretinden başlayıp cetvelin artan yönünde saniyede 4 cm ilerliyor. Ölçüm ilk 10 saniyeyi kapsıyor.",
    rule: "Eğim, konumun saniye başına değişimidir. Süre kesirli değerler de alabildiğinden grafik bir doğru parçasıdır.",
    graph: {base:6, rate:4, limit:10, step:.5, x:"Süre (sn)", y:"Konum (cm)"},
    questions: [
      ["Değişkenleri ve birimlerini yaz. t = 0 anında robot hangi işarettedir?", "İlk ölçüm, robot hareket etmeye başladığı anda alınır.", "t: süre (sn), y: pistteki konum (cm). Başlangıç konumu 6 cm.", "Zamana göre konum hesaplanır. t = 0 iken robot henüz ilerlememiştir ve 6 cm işaretindedir."],
      ["0, 2, 2,5 ve 5 saniyedeki konumları tabloya yaz.", "Geçen süreyi 4 ile çarp. Pist üzerindeki ilk konumu da hesaba kat.", "Sırasıyla 6, 14, 16 ve 26 cm.", "2,5 saniyede 4 × 2,5 = 10 cm ilerler. Başlangıç konumu 6 cm olduğundan cetvelde 16 cm’yi gösterir."],
      ["(2; 14) ve (5; 26) noktalarını çiz ve eğimi hesapla. Noktalar arasındaki süreler bu modelde anlamlı mı?", "Konum farkını süre farkına böl. 2,5 saniyeyi düşün.", "Eğim 4 cm/sn. Ara süreler modelde anlamlıdır.", "26 − 14 = 12 cm değişim, 5 − 2 = 3 saniyede gerçekleşir. Robot ara anlarda da pisttedir, bu yüzden grafikte doğru parçası kullanılır."],
      ["İlk 10 saniye için konum kuralını yaz. Robot 36 cm işaretine ne zaman ulaşır? Bu an modelin geçerli olduğu aralıkta mı?", "36’dan başlangıç konumunu çıkarıp saniye başına ilerlemeye böl.", "y = 6 + 4t, 0 ≤ t ≤ 10. Robot 7,5 saniyede ulaşır.", "6 + 4t = 36 ⇒ 4t = 30 ⇒ t = 7,5. Sonuç 0 ile 10 saniye arasında olduğundan model bu anı kapsar."]
    ]
  }
];

const assignments = [
  {
    title: "Okul bahçesi mozaikleri", note: "Bir mozaik için ahşap taban 18 TL, üzerine eklenen her renkli parça 4 TL. Takım bu tasarımda en fazla 20 renkli parça kullanabiliyor.",
    questions: [
      ["Bağımsız ve bağımlı değişkenleri birimleriyle yaz.", "", "x: renkli parça sayısı. y: toplam maliyet (TL).", "6 p bağımsız değişken ve birimi, 6 p bağımlı değişken ve birimi."],
      ["0, 2 ve 5 parça için maliyet tablosunu oluştur.", "", "18, 26 ve 38 TL.", "Her doğru tablo değeri 4 p."],
      ["2 ve 5 parçaya karşılık gelen noktaları çiz. Eğim ve birimini yaz.", "", "(2; 26) ve (5; 38). Eğim 4 TL/parça.", "İki nokta ve doğru eksenler 6 p, işlem ve birim 6 p."],
      ["Maliyet kuralını ve 61 TL ile en fazla kaç parça kullanılabileceğini yaz.", "", "y = 18 + 4x. En fazla 10 parça, çünkü 10 parça 58 TL ve 11 parça 62 TL tutar.", "Model 6 p, gerekçeli bütçe hesabı 8 p."]
    ]
  },
  {
    title: "Seramik atölyesinde soğuma", note: "Bir seramik parçasının sıcaklığı ölçüm başında 36 °C’dir. Kullanılan modelde parça 20 °C’ye ulaşana kadar sıcaklık dakikada 2 °C azalıyor.",
    questions: [
      ["Bağımsız ve bağımlı değişkenleri yaz. Başlangıç sıcaklığı nedir?", "", "x: süre (dk), y: sıcaklık (°C). Başlangıç 36 °C.", "Değişkenler 8 p, başlangıç sıcaklığı 4 p."],
      ["0, 3 ve 6 dakikadaki sıcaklıkları tabloya yaz.", "", "36, 30 ve 24 °C.", "Her doğru tablo değeri 4 p."],
      ["3 ve 6 dakikaya karşılık gelen noktaları çiz. Eğim ve birimini yaz.", "", "(3; 30) ve (6; 24). Eğim −2 °C/dk.", "İki nokta ve doğru eksenler 6 p, işlem ve birim 6 p."],
      ["Sıcaklığın kuralını, parçanın 20 °C’ye ulaşma süresini ve modelin geçerli olduğu süre aralığını yaz.", "", "y = 36 − 2x. Parça 8 dakikada 20 °C’ye ulaşır. 0 ≤ x ≤ 8.", "Model 5 p, hedefe ulaşma süresi 5 p, süre aralığı 4 p."]
    ]
  }
];

const levels = ["Kolay", "Kolay–Orta", "Orta", "Yeni Nesil"];
const points = [12, 12, 12, 14];
const course = [
  "Bir ilişkiyi modelle", "Referans fonksiyonunu oku", "Eğimi değiştir", "Grafiği ötele",
  "Doğrusal ve sabit fonksiyonları incele", "Parçalı model kur", "Gerçek yaşam modellerini karşılaştır"
];
