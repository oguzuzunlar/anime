"use strict";

const examples = [
  {
    title: "Sergi atölyesinin kartları",
    note: "Bir sergi atölyesi, en çok 10 ziyaret kartı hazırlıyor. 0–4 kart için hazırlık dahil toplam 12 TL alıyor. Dördüncü kartı aşan her kart için 4 TL ekliyor. Eğilim grafiğinde kart sayısını [0; 10] aralığında modelliyoruz.",
    rule: "Önce girdinin aralığını belirle. Eşik değerinde eşitlik işaretinin bulunduğu kuralı kullan.",
    chart: {x:"Kart sayısı",y:"Ücret (TL)",maxX:10,maxY:40, names:["İlk 4 kart","4 karttan sonra"],
      segments:[{from:0,to:4,a:0,b:12,c:0},{from:4,to:10,a:4,b:-4,c:1,openFrom:true}]},
    questions: [
      ["Kural hangi kart sayısında değişiyor? 4 kart için hangi kural kullanılır ve ücret nedir?", "İlk ücret aralığı 4’ü içerir.", "Eşik 4. İlk kural kullanılır. Ücret 12 TL.", "0 ≤ x ≤ 4 için ücret 12 TL. Ek ücret yalnızca x > 4 iken uygulanır."],
      ["Ücreti iki parçalı yaz. 2, 4, 5 ve 8 kartın ücretini hesapla.", "x > 4 için ek ücret, 4 × (x − 4) TL’dir.", "0 ≤ x ≤ 4 için 12. 4 < x ≤ 10 için 12 + 4(x − 4). Ücretler 12, 12, 16 ve 28 TL.", "İlk iki değer sabit parçadan gelir. 5 kartta bir, 8 kartta dört ek kart bulunur."],
      ["Grafiği çiz. Dirsek noktasının koordinatlarını ve iki parçanın eğimini yaz.", "Yatay parça 4’e kadar sürer. İkinci parçayı (8; 28) noktasına kadar örnekle.", "Dirsek (4; 12). Eğimler 0 ve 4 TL/kart.", "İki çizim 4’te aynı yüksekliğe ulaşır. (4; 12) grafikte doludur, çünkü ilk parça 4’ü içerir."],
      ["27 TL ile en fazla kaç tam kart alınır? Ücret hesabını göster.", "Ek kartlı modelde 12 + 4(x − 4) ≤ 27 koşulunu çöz.", "7 kart. 7 kart 24 TL, 8 kart 28 TL.", "x ≤ 7,75 bulunur. En büyük uygun tam sayı 7’dir."]
    ]
  },
  {
    title: "Işık sensöründe mod değişimi",
    note: "Bir prototip ışık sensörü 0–8 aralığındaki x değerlerini inceliyor. Okuma 0 ≤ x < 3 iken x + 1, 3 ≤ x ≤ 8 iken 2x oluyor.",
    rule: "Eşik noktasında boş uç, o parçanın eşiği dışarıda bıraktığını gösterir. Dolu uç, fonksiyonun eşikteki değerini verir.",
    chart: {x:"Girdi x",y:"Sensör çıktısı",maxX:8,maxY:18, names:["x < 3","x ≥ 3"],
      segments:[{from:0,to:3,a:1,b:1,c:0,openTo:true},{from:3,to:8,a:2,b:0,c:1}]},
    questions: [
      ["Eşik değeri nedir? x = 3 için doğru kuralı seç ve çıktıyı hesapla.", "3 hangi eşitsizliğe dahil?", "Eşik 3. x = 3 için 2x kullanılır ve sonuç 6’dır.", "x < 3 koşulu 3’ü içermez. x ≥ 3 koşulu 3’ü içerdiği için çıktı 2 × 3 = 6 olur."],
      ["2, 2,5, 3 ve 4 için çıktı tablosunu oluştur.", "İlk iki değer eşikten küçük, son ikisi eşiğe eşit veya daha büyüktür.", "Sırasıyla 3; 3,5; 6 ve 8.", "2,5 + 1 = 3,5. Tam eşikte kural 2x’e geçtiği için 3 girdisinde çıktı 6 olur."],
      ["Grafiği çiz ve x = 3 doğrusu üzerindeki boş ve dolu noktaları işaretle.", "Her iki formülü de 3’te hesapla, sonra koşullarına bak.", "(3; 4) boş, (3; 6) dolu.", "Birinci parça (0; 1)’den başlayıp (3; 4)’e yaklaşır. İkinci parça (3; 6)’dan (8; 16)’ya uzanır."],
      ["Çıktı 5 olabilir mi? Sensörün alabileceği bütün çıktı değerlerini aralıkla yaz.", "İlk parçanın üst ucu açık, ikinci parçanın alt ucu kapalıdır.", "5 alınamaz. Görüntü kümesi [1; 4) ∪ [6; 16].", "İlk kural 1 ile 4 arasında çıktı verir ve 4’ü içermez. İkinci kural 6’dan 16’ya kadar, iki uç dahil çıktı verir."]
    ]
  }
];

const assignments = [
  {
    title:"Prova odası süresi", note:"Bir prova odası en çok 8 saat kullanılabilir. 0–2 saat arası 30 TL, 2 saati aşan her saat için 12 TL ek ücret uygulanır.",
    questions:[
      ["Eşiği ve tam 2 saatin ücretini yaz.","","Eşik 2 saat. 2 saatlik ücret 30 TL.","Eşik 6 p, ücret 6 p."],
      ["Parçalı kuralı yaz. 1 ve 4 saat için ücreti hesapla.","","0 ≤ x ≤ 2 için 30, 2 < x ≤ 8 için 30 + 12(x − 2). Ücretler 30 ve 54 TL.","Parçalar 6 p, ücretler 6 p."],
      ["Grafiği çiz. Eşik noktasını ve iki parçanın eğimini yaz.","","(2; 30), eğimler 0 ve 12 TL/saat.","Grafik 6 p, nokta 2 p, eğimler 4 p."],
      ["68 TL ile en fazla kaç tam saat prova yapılır?","","5 saat. 5 saat 66 TL, 6 saat 78 TL.","İşlem 8 p, sonuç ve kontrol 6 p."]
    ]
  },
  {
    title:"Su seviyesinin test modu", note:"Bir test göstergesi 0 ≤ x < 2 iken x + 1, 2 ≤ x ≤ 6 iken x + 4 değerini gösteriyor.",
    questions:[
      ["f(1), f(2) ve f(4) değerlerini bul.","","2, 6 ve 8.","Her doğru değer 4 p."],
      ["Eşikteki boş ve dolu koordinatları yaz.","","(2; 3) boş, (2; 6) dolu.","Her doğru koordinat ve uç tipi 6 p."],
      ["Parçalı grafiği çiz ve bütün uç noktaları göster.","","(0; 1) doludan (2; 3) boşa, (2; 6) doludan (6; 10) doluya.","Her doğru parça ve uçları 6 p."],
      ["Çıktı 4 olabilir mi? Görüntü kümesini yaz.","","4 alınamaz. [1; 3) ∪ [6; 10].","Doğru yorum 4 p, her doğru aralık 5 p."]
    ]
  }
];
const levels=["Kolay","Kolay–Orta","Orta","Yeni Nesil"];
const points=[12,12,12,14];
const course=["Bir ilişkiyi modelle","Referans fonksiyonunu oku","Eğimi değiştir","Grafiği ötele","Doğrusal ve sabit fonksiyonları incele","Parçalı model kur","Gerçek yaşam modellerini karşılaştır"];
