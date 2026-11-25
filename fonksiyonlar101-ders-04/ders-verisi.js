"use strict";

const examples = [
  {
    title: "Sahne ışığının yükseklik ayarı",
    note: "Bir sahne önizlemesinde x yatay konumu, f(x) = x ise ışık çizgisinin referans yüksekliğini gösteriyor. Yazılım tüm çizgiyi yukarı 2 birim taşıyınca g, aşağı 3 birim taşıyınca h oluşuyor. Modeller ℝ’de tanımlı.",
    rule: "g(x) = f(x) + b, (x; y) noktasını (x; y + b) noktasına taşır. b > 0 için yukarı, b < 0 için aşağı ötelenir.",
    shift: {kind:"vertical", amount:2, limited:false},
    questions: [
      ["g ve h’nin kurallarını yaz. Üç fonksiyonun x = −2, 0 ve 2 için değerlerini tabloya geçir.", "Her referans çıktısına g için 2 ekle, h için 3 çıkar.", "g(x) = x + 2, h(x) = x − 3. f: −2, 0, 2. g: 0, 2, 4. h: −5, −3, −1.", "x değişmez. Örneğin x = −2 iken g(−2) = −2 + 2 = 0 ve h(−2) = −2 − 3 = −5."],
      ["g ve h grafiklerini f ile aynı eksenlerde çiz. Eğimleri ve y eksenini kestikleri noktaları yaz.", "x = 0 değerini kullan. x bir birim artınca y ne kadar artıyor?", "Üç eğim de 1. y ekseni kesişimleri f için (0; 0), g için (0; 2), h için (0; −3).", "Dikey öteleme bütün çıktılara aynı değeri ekler. Bu değer iki çıktı arasındaki farkı değiştirmediği için eğim korunur."],
      ["g ve h’nin sıfırlarını, işaret aralıklarını, tanım ve görüntü kümelerini yaz.", "Sıfırı bulmak için fonksiyon değerini 0’a eşitle. Doğruların ikisi de artandır.", "g’nin sıfırı −2, h’nin 3. Her biri kendi sıfırının solunda negatif, sağında pozitif. Tüm kümeler ℝ.", "x + 2 = 0 ⇒ x = −2 ve x − 3 = 0 ⇒ x = 3. Eğim 1 olduğundan sıfırın sağında pozitif değerler alınır."],
      ["Yeni bir ayar x = 2’de ışığı −1 yüksekliğine getiriyor. Öteleme miktarını, yeni kuralı ve sıfırı bul.", "2 + b = −1 eşitliğini kur.", "b = −3. k(x) = x − 3. Sıfırı x = 3.", "Yeni yükseklik ile f(2) arasındaki fark −1 − 2 = −3’tür. Bu ayar f grafiğini 3 birim aşağı taşır."]
    ]
  },
  {
    title: "Montaj rayındaki ölçüm şeridi",
    note: "Bir montaj rayının test şeridi f(t) = t değerini yalnızca −3 ≤ t ≤ 3 için gösteriyor. İki tasarım deneniyor: A’da çıktı 2 birim yükseltiliyor, B’de ölçüm şeridi 2 birim sola kaydırılıyor.",
    rule: "f(x + b) için referans noktası (t; y), (t − b; y) konumuna taşınır. Yatay ötelemede tanım aralığı da taşınır.",
    shift: {kind:"horizontal", amount:2, limited:true},
    questions: [
      ["Referans grafiğinin iki uç noktasını yaz. Bu uçlar sola 2 birim kayınca nereye gider?", "Sola ötelemede yalnızca yatay koordinattan 2 çıkar.", "Referans: (−3; −3) ve (3; 3). B: (−5; −3) ve (1; 3).", "Her noktanın yüksekliği korunur. Yeni yatay koordinatlar −3 − 2 = −5 ve 3 − 2 = 1 olur."],
      ["A ve B’nin kurallarını yaz ve grafiklerini çiz. B grafiğinde (0; 0) referans noktası nereye taşınır?", "A için çıktıya 2 ekle. B’de yeni x konumu, eski t konumundan 2 küçüktür.", "A(x) = f(x) + 2, B(x) = f(x + 2). B’de (0; 0) → (−2; 0).", "A’nın uçları (−3; −1) ve (3; 5). B’nin uçları (−5; −3) ve (1; 3). Her iki doğru parçasının eğimi 1’dir."],
      ["A ve B için tanım ve görüntü kümelerini yaz. İki kural ortak girdilerde aynı sonucu verir mi?", "x + 2’nin −3 ile 3 arasında olması B için hangi x aralığını verir?", "A: tanım [−3; 3], görüntü [−1; 5]. B: tanım [−5; 1], görüntü [−3; 3]. Ortak girdilerde ikisi de x + 2.", "A’da x aralığı korunur, çıktılar 2 artar. B’de −3 ≤ x + 2 ≤ 3, yani −5 ≤ x ≤ 1. Çıktı aralığı korunur."],
      ["x = −4 ve x = 2 için hangi tasarımın değer ürettiğini ve bu değerleri yaz.", "Her x’in önce hangi tanım kümesinde olduğunu kontrol et.", "x = −4 için yalnız B ve B(−4) = −2. x = 2 için yalnız A ve A(2) = 4.", "−4 yalnız [−5; 1] aralığında, 2 yalnız [−3; 3] aralığındadır. İki tasarım aynı cebirsel ifadeyi farklı tanım aralıklarında kullanır."]
    ]
  }
];

const assignments = [
  {
    title: "Sayısal yükseklik haritası",
    note: "Bir yükseklik haritasının referansı f(x) = x. Kalibrasyon her çıktıya −1,5 birim ekliyor. Girdiler ℝ’de.",
    questions: [
      ["Yeni kuralı yaz. x = −2, 0 ve 3 için çıktıları bul.", "", "g(x) = x − 1,5. Çıktılar −3,5; −1,5 ve 1,5.", "Kural 3 p, her doğru değer 3 p."],
      ["f ve g grafiklerini çiz. g’nin eğimini ve y eksenini kestiği noktayı yaz.", "", "Doğrular paralel. Eğim 1, y ekseni kesişimi (0; −1,5).", "Grafikler 6 p, eğim 3 p, kesişim 3 p."],
      ["g’nin sıfırını ve işaret aralıklarını yaz.", "", "Sıfır 1,5. x < 1,5 için negatif, x > 1,5 için pozitif.", "Sıfır 4 p, işaret aralıkları 8 p."],
      ["Bir başka ayar x = −3 noktasında 1 sonucunu veriyor. Yukarı/aşağı ötelemeyi ve yeni kuralı bul.", "", "4 birim yukarı, k(x) = x + 4; çünkü 1 − (−3) = 4.", "İşlem ve yön 8 p, kural 6 p."]
    ]
  },
  {
    title: "Işıklı prova şeridi",
    note: "Bir prova şeridinde f(t) = t yalnızca −2 ≤ t ≤ 4 için tanımlı. Şerit 3 birim sağa taşınarak g oluşturuluyor.",
    questions: [
      ["Yeni kuralı f cinsinden yaz ve (0; 0) noktasının yeni konumunu bul.", "", "g(x) = f(x − 3). (0; 0) → (3; 0).", "Kural 6 p, yeni nokta 6 p."],
      ["g’nin grafiğini çiz ve iki uç noktasını yaz.", "", "Dolu uçlar (1; −2) ve (7; 4). Bu uçlar bir doğru parçasıyla birleştirilir.", "Uçlar 6 p, grafik ve uçların dolu gösterimi 6 p."],
      ["g’nin tanım ve görüntü kümelerini ve sıfırını yaz.", "", "Tanım [1; 7], görüntü [−2; 4], sıfır 3.", "Tanım 4 p, görüntü 4 p, sıfır 4 p."],
      ["Aynı şerit 3 birim aşağı taşınsaydı tanım ve görüntü kümeleri nasıl olurdu? Sağa öteleme ile karşılaştır.", "", "Aşağı ötelemede tanım [−2; 4], görüntü [−5; 1]. Sağa öteleme tanımı, aşağı öteleme görüntüyü değiştirir.", "Her doğru küme 4 p, gerekçeli karşılaştırma 6 p."]
    ]
  }
];

const levels = ["Kolay", "Kolay–Orta", "Orta", "Yeni Nesil"];
const points = [12, 12, 12, 14];
const course = [
  "Bir ilişkiyi modelle", "Referans fonksiyonunu oku", "Eğimi değiştir", "Grafiği ötele",
  "Doğrusal ve sabit fonksiyonları incele", "Parçalı model kur", "Gerçek yaşam modellerini karşılaştır"
];
