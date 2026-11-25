"use strict";

const examples = [
  {
    title: "Ses mikserinin doğrudan modu",
    note: "Bir ses mikserinin test ekranında x, gönderilen örnek değeri; f(x), dönen örnek değerini gösteriyor. Doğrudan mod her gerçek sayıyı olduğu gibi döndürüyor: f(x) = x.",
    rule: "Grafikteki her nokta (x; x) biçimindedir. Sıfır, f(x) = 0 yapan girdidir. Eksenlerin ölçekleri eşitse doğru 45° eğimle görünür.",
    domain: {label:"ℝ"},
    questions: [
      ["f(−2), f(0) ve f(3) değerlerini bul. Grafikte karşılık gelen noktaları göster.", "Çıktı, seçtiğin girdiye eşittir.", "−2, 0, 3. Noktalar (−2; −2), (0; 0), (3; 3).", "f(x) = x kuralında x yerine her girdiyi yaz. Sonra girdiyi yatay, çıktıyı dikey eksende işaretle."],
      ["Tanım ve görüntü kümelerini, sıfırı ve fonksiyonun işaretini yaz.", "Hangi x değerlerini kullanabilirsin? Her gerçek sayı çıktı olarak alınabilir mi?", "Tanım ve görüntü ℝ. Sıfır 0. (−∞; 0) aralığında negatif, (0; ∞) aralığında pozitif.", "Her x ∈ ℝ aynı sayı olarak çıkar, bu nedenle tüm gerçek sayılar görüntüdedir. Çıktının işareti girdinin işaretiyle aynıdır."],
      ["(−2; −2) ve (3; 3) ile eğimi bul. Fonksiyonun artan ve bire bir olduğunu açıkla.", "İki nokta arasında Δy ve Δx aynı mı? Farklı iki girdi aynı çıktıyı verebilir mi?", "Eğim 1. Fonksiyon artan ve bire birdir.", "Δy/Δx = 5/5 = 1. a < b ise f(a) = a < b = f(b). Ayrıca f(a) = f(b) eşitliği a = b olmasını gerektirir."],
      ["Teknisyen en büyük ve en küçük çıktıyı arıyor. Bunlar var mı? Ekranda görünen pencere, fonksiyonun tanım kümesi midir?", "Seçilen bir çıktıdan her zaman daha büyük ve daha küçük bir çıktı üretilebilir mi?", "Maksimum ve minimum yoktur. Grafik penceresi tanım kümesinin yalnızca bir bölümünü gösterir.", "Her f(a) = a için f(a + 1) = a + 1 daha büyük, f(a − 1) = a − 1 daha küçüktür. Modelin tanım kümesi ℝ’dir."]
    ]
  },
  {
    title: "Robot kolunun güvenli aralığı",
    note: "Bir robot kolu, x cm komutuna f(x) = x cm hareketle yanıt veriyor. Güvenlik modu yalnızca −3 ≤ x < 4 komutlarını kabul ediyor.",
    rule: "Dolu uç, sınır değerinin tanım kümesine dahil olduğunu gösterir. Boş uç, sınır değerinin dışarıda kaldığını belirtir.",
    domain: {label:"[−3; 4)", min:-3, max:4, openMax:true},
    questions: [
      ["f(−3), f(0) ve f(3,5) değerlerini bul. x = 4 komutu kabul edilir mi?", "−3 için ≤, 4 için < kullanıldığını incele.", "f(−3) = −3, f(0) = 0, f(3,5) = 3,5. 4 kabul edilmez.", "−3 sınır değeri dahildir. 4 üst sınırdır, fakat x < 4 koşulunu sağlamaz."],
      ["Grafiği çiz, iki uç noktanın durumunu göster. Tanım ve görüntü kümelerini yaz.", "Yalnızca kabul edilen komutlara karşılık gelen (x; x) noktalarını çiz.", "(−3; −3) dolu, (4; 4) boş. Tanım ve görüntü [−3; 4).", "Grafik iki uç arasındaki doğru parçasıdır. Her kabul edilen girdi aynen çıktığı için iki kümenin sınırları ve uç durumları eşleşir."],
      ["Sıfırı ve işaret aralıklarını yaz. Güvenli aralıkta fonksiyon artan ve bire bir mi?", "Sıfır dahil mi? Negatif çıktılar için −3 dahil mi?", "Sıfır 0. Negatif: [−3; 0). Pozitif: (0; 4). Artan ve bire bir.", "İşaret girdiden gelir. a < b ise f(a) < f(b) ve farklı girdilerin çıktıları farklıdır."],
      ["Bu modda minimum ve maksimum çıktı var mı? İki uç için gerekçeni ayrı ayrı yaz.", "−3 alınabilir. 3,9’u artırmak için 4’e ulaşmak gerekir mi?", "Minimum −3. Maksimum yoktur.", "−3 kabul edilen en küçük girdidir. Her x < 4 için (x + 4)/2 daha büyük ve yine 4’ten küçük bir kabul edilen girdidir. 4 çıktı olarak alınmaz."]
    ]
  }
];

const assignments = [
  {
    title: "Sanal cetvel",
    note: "Bir çizim uygulamasında sanal cetvel, verilen her gerçek x koordinatını g(x) = x olarak ekrana yansıtıyor.",
    questions: [
      ["g(−4), g(0) ve g(2) değerlerini bul. Noktaları grafikte göster.", "", "−4, 0, 2. Noktalar (−4; −4), (0; 0), (2; 2).", "Her doğru değer ve karşılık gelen nokta 4 p."],
      ["Tanım ve görüntü kümelerini, sıfırı ve işaret aralıklarını yaz.", "", "Her iki küme ℝ. Sıfır 0. Negatif: (−∞; 0), pozitif: (0; ∞).", "Kümeler 4 p, sıfır 2 p, işaret aralıkları 6 p."],
      ["(−4; −4) ve (2; 2) ile eğimi bul. Fonksiyonun artanlığını açıkla.", "", "Eğim 6/6 = 1. x arttığında g(x) aynı miktarda artar.", "Eğim ve işlem 8 p, artma gerekçesi 4 p."],
      ["g(a) = g(b) ise a ve b için ne söyleyebilirsin? En büyük çıktı var mı?", "", "a = b, dolayısıyla g bire birdir. En büyük çıktı yoktur; her a için g(a + 1) daha büyüktür.", "Bire birlik ve gerekçe 7 p, en büyük çıktı ve gerekçe 7 p."]
    ]
  },
  {
    title: "Sensör kalibrasyonu",
    note: "Bir sensör, x mm ayarına h(x) = x mm çıktısı veriyor. Yalnızca −2 < x ≤ 3 ayarları kullanılabiliyor.",
    questions: [
      ["h(−1), h(0) ve h(3) değerlerini yaz. −2 mm ayarı kullanılabilir mi?", "", "−1, 0, 3. −2 kullanılamaz.", "Her doğru değer 3 p, dış uç 3 p."],
      ["Grafiği çiz. Uçları işaretle ve tanım ile görüntü kümelerini yaz.", "", "(−2; −2) boş, (3; 3) dolu. Her iki küme (−2; 3].", "Doğru parçası 4 p, uçlar 4 p, kümeler 4 p."],
      ["Sıfırı ve işaret aralıklarını yaz. Fonksiyon bire bir mi? Neden?", "", "Sıfır 0. Negatif: (−2; 0), pozitif: (0; 3]. Bire bir, çünkü farklı x’ler farklı çıktılar verir.", "Sıfır 2 p, aralıklar 6 p, bire birlik ve gerekçe 4 p."],
      ["Minimum ve maksimum çıktı olup olmadığını iki uç için ayrı ayrı gerekçelendir.", "", "Maksimum 3. Minimum yoktur, çünkü −2 dahil değildir ve her x > −2 için (x − 2)/2 daha küçük bir uygun girdidir.", "Maksimum ve gerekçe 7 p, minimum ve gerekçe 7 p."]
    ]
  }
];

const levels = ["Kolay", "Kolay–Orta", "Orta", "Yeni Nesil"];
const points = [12, 12, 12, 14];
const course = [
  "Bir ilişkiyi modelle", "Referans fonksiyonunu oku", "Eğimi değiştir", "Grafiği ötele",
  "Doğrusal ve sabit fonksiyonları incele", "Parçalı model kur", "Gerçek yaşam modellerini karşılaştır"
];
