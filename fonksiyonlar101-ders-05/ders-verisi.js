"use strict";

const examples = [
  {
    title: "Sanal denge göstergesi",
    note: "Bir simülatörün denge göstergesi x = 0 iken 6 puan gösteriyor. Girdi x her 1 birim arttığında puan 2 azalıyor. Simülatör tüm gerçek girdileri kabul ediyor.",
    rule: "g(x) = ax + b kuralında a eğim, b başlangıç değeridir. a ≠ 0 ise sıfır x = −b/a olur.",
    model: {a:-2, b:6},
    questions: [
      ["Göstergenin kuralını yaz. x = −1, 0 ve 2 için puanı hesapla.", "Başlangıç 6. Girdi 1 arttığında puan 2 azalıyor.", "g(x) = −2x + 6. Puanlar sırasıyla 8, 6 ve 2.", "Başlangıç değeri b = 6, birim değişim a = −2. x yerine sırasıyla −1, 0 ve 2 yazılır."],
      ["Grafiği çiz. Eğimi ve eksenleri kestiği noktaları yaz.", "y ekseni için x = 0, x ekseni için g(x) = 0 kullanılır.", "Eğim −2. y ekseni (0; 6), x ekseni (3; 0).", "−2x + 6 = 0 ⇒ x = 3. İki kesişim noktasından geçen doğru, sola giderken yükselir ve sağa giderken alçalır."],
      ["Tanım ve görüntü kümelerini, işaret aralıklarını ve artanlık durumunu yaz. Fonksiyon bire bir mi?", "Eğim negatif olduğu için sıfırın hangi tarafı pozitiftir?", "Tanım ve görüntü ℝ. x < 3 için pozitif, x > 3 için negatif. Fonksiyon azalan ve bire bir.", "Her y için x = (6 − y)/2 tek bir değerdir. x arttığında puan azalır, x = 3’te 0 olur."],
      ["Yeni ekran (1; 5) ve (3; 1) noktalarından geçiyor. Kuralını bul ve iki ekranın başlangıç puanını karşılaştır.", "İki noktanın eğimini hesapla. x = 1, y = 5’i yeni kurala yerleştir.", "Yeni kural y = −2x + 7. Başlangıç puanı 7, önceki ekrandan 1 puan fazla.", "a = (1 − 5)/(3 − 1) = −2. 5 = −2 + b ⇒ b = 7. Eğimler eşit, y ekseni kesişimleri farklıdır."]
    ]
  },
  {
    title: "Sergi konsolunun sabit modu",
    note: "Bir sergi konsolu sabit parlaklık modunda her x ayarında 4 birim gösteriyor. Sıfırlama modunda gösterge her ayarda 0 oluyor. Ayarları gerçek sayılarla modelle.",
    rule: "a = 0 iken g(x) = b sabittir. Görüntü kümesi {b}’dir. b = 0 durumunda her girdi bir sıfırdır.",
    model: {a:0, b:4},
    questions: [
      ["Sabit parlaklık modunun kuralını yaz. x = −3, 0 ve 3 çıktıları nedir?", "Ayar değişse de konsolun gösterdiği sayı aynı kalıyor.", "g(x) = 4. Üç çıktı da 4.", "Genel biçimde a = 0 ve b = 4’tür. 0x + 4 her x için 4 eder."],
      ["Hem g(x) = 4 hem sıfırlama modunu çiz. Eğimlerini ve y ekseni kesişimlerini yaz.", "Sabit çıktı, yatay doğru oluşturur.", "İki eğim de 0. Kesişimler (0; 4) ve (0; 0).", "g(x) = 4 grafiği x eksenine paraleldir. Sıfırlama modunun grafiği x ekseniyle çakışır."],
      ["Her modun görüntü kümesini ve sıfırlarını yaz. Sabit parlaklık modu bire bir mi?", "Bir fonksiyonun sıfırı çıktının 0 olduğu girdidir.", "Görüntüler {4} ve {0}. İlk modun sıfırı yok, ikinci modun her girdisi sıfır. İlk mod bire bir değil.", "İlk modda g(1) = g(2) = 4. Sıfırlama modunda x ne olursa olsun çıktı 0’dır."],
      ["Bir teknisyen g(x) = 4 için maksimum ve minimum değer arıyor. Her ikisi nedir ve hangi girdilerde alınır?", "Bütün çıktılar birbirine eşit.", "Maksimum ve minimum değer 4’tür. Her gerçek girdide alınır.", "Görüntü kümesi yalnızca {4}’tür. Çıktılar değişmediği için 4 hem en küçük hem en büyük çıktı değeridir."]
    ]
  }
];

const assignments = [
  {
    title: "Dijital hareket önizlemesi",
    note: "Bir animasyon aracı x = 0 için y = 3 gösteriyor. x her 2 birim arttığında y 3 artıyor. Model ℝ’de geçerli.",
    questions: [
      ["Eğimi ve kuralı yaz. x = 4 için çıktıyı bul.", "", "a = 1,5. g(x) = 1,5x + 3. g(4) = 9.", "Eğim, kural ve çıktı 4’er p."],
      ["Grafiği çiz ve eksen kesişimlerini yaz.", "", "x ekseni (−2; 0), y ekseni (0; 3).", "Her kesişim 3 p, doğru grafik 6 p."],
      ["Sıfırı, işaret aralıklarını ve artanlık durumunu yaz.", "", "Sıfır −2. Solunda negatif, sağında pozitif. Eğim pozitif olduğu için artan.", "Sıfır 3 p, işaret aralıkları 6 p, artanlık 3 p."],
      ["g ile h(x) = 1,5x − 1’i karşılaştır. Kesişirler mi? Aynı x için çıktı farkı nedir?", "", "Paraleldir ve kesişmezler. g(x) − h(x) = 4.", "Paralellik ve gerekçe 8 p, çıktı farkı 6 p."]
    ]
  },
  {
    title: "Ses düzenleyicinin test çıkışı",
    note: "Bir ses düzenleyici A testinde her gerçek girdiye −3, B testinde ise her girdiye 0 değeri veriyor.",
    questions: [
      ["A ve B için fonksiyon kurallarını, a ve b değerleriyle yaz.", "", "A(x) = 0x − 3, B(x) = 0x + 0. Eğimler 0, başlangıçlar −3 ve 0.", "Her doğru model ve katsayıları 6 p."],
      ["İki grafiği çiz ve x ekseniyle ilişkilerini açıkla.", "", "A, x ekseninin 3 birim altında ve ona paralel. B, x ekseniyle çakışır.", "Grafikler 8 p, ilişkiler 4 p."],
      ["Her kuralın görüntü kümesini ve sıfırlarını yaz.", "", "A için görüntü {−3}, sıfır yok. B için görüntü {0}, sıfırların kümesi ℝ.", "Görüntüler 6 p, sıfırlar 6 p."],
      ["A’nın minimum ve maksimum değerlerini yaz. B’nin bire bir olup olmadığını örnekle açıkla.", "", "A’nın iki uç değeri de −3. B bire bir değildir; örneğin B(0) = B(1) = 0.", "Uç değerler ve gerekçe 7 p, bire birlik ve örnek 7 p."]
    ]
  }
];

const levels = ["Kolay", "Kolay–Orta", "Orta", "Yeni Nesil"];
const points = [12, 12, 12, 14];
const course = [
  "Bir ilişkiyi modelle", "Referans fonksiyonunu oku", "Eğimi değiştir", "Grafiği ötele",
  "Doğrusal ve sabit fonksiyonları incele", "Parçalı model kur", "Gerçek yaşam modellerini karşılaştır"
];
