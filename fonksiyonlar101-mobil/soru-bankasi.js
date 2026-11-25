"use strict";

const nf = new Intl.NumberFormat("tr-TR", {maximumFractionDigits: 3});
const n = value => nf.format(value).replace("-", "−");
const bin = (a,b) => `${n(a)}x${b ? (b < 0 ? " − " : " + ") + n(Math.abs(b)) : ""}`;
const ask = (prompt, correct, wrong, why, visual) => ({prompt, choices:[correct,...wrong],why,visual});
function numeric(prompt, answer, distractors, why, visual) {
  const alternatives = [...new Set([answer,...distractors,answer+1,answer-1,answer+2,answer-2])];
  return ask(prompt,n(answer),alternatives.slice(1,4).map(n),why,visual);
}
const variants = (items,make) => items.map((values,index) => make(...values,index));
const round = (title,questions) => ({title,questions});
const line = (a,b,from=-4,to=4,extra={}) => ({a,b,from,to,...extra});
const graph = (lines,options={}) => ({lines,minX:-4,maxX:4,minY:-6,maxY:6,caption:"Yatay eksen x, dikey eksen çıktı.",...options});
const positiveGraph = (lines,maxX,maxY,caption,alt) => graph(lines,{minX:0,maxX,minY:0,maxY,caption,alt});

const lessons = [
  {
    id:1,folder:"01-v2",title:"Bir ilişkiyi modelle",description:"Değişkenleri tanı, tablo ve grafikten kuralı kur.",
    rounds:[
      round("Girdi ve çıktı",[
        ask("Bir yazıcıda çıktı ücreti, basılan sayfa sayısına göre hesaplanıyor. Bağımsız değişken hangisi?","Basılan sayfa sayısı",["Toplam ücret","Sayfa başı ücret","Başlangıç ücreti"],"Hesaba girdi olarak verilen basılan sayfa sayısıdır."),
        ask("Bir termometrenin kaydettiği sıcaklık saat başına ölçülüyor. Bağımlı değişken hangisi?","Sıcaklık",["Ölçüm saati","Saat birimi","Ölçüm sayısı"],"Sıcaklık, ölçüm zamanına göre kaydedilen çıktıdır."),
        ...variants([["kargo","paket ağırlığı","toplam ücret"],["atölye","parça sayısı","toplam maliyet"],["koşu parkuru","geçen süre","alınan yol"],["boya karışımı","eklenen su miktarı","karışım hacmi"]],(name,input,output)=>ask(`${name[0].toUpperCase()+name.slice(1)} modelinde ${output}, ${input} kullanılarak hesaplanıyor. Çıktı nedir?`,output,[input,"Ölçüm birimi","Başlangıç girdisi"],`Hesaplanan sonuç ${output} değeridir.`))
      ]),
      round("Tabloyu tamamla",[
        ...variants([[4,6,3],[3,10,5],[2,9,6],[5,8,4],[7,12,0],[6,14,2]],(a,b,x)=>numeric(`Bir atölye ${b} TL hazırlık, parça başına ${a} TL alıyor. Tabloda x = ${x} için toplam ücret kaç TL?`,a*x+b,[a*x,b,a+b],`Toplam ücret ${b} + ${a} × ${x} = ${a*x+b} TL.`))
      ]),
      round("Grafikten değişimi oku",[
        ...variants([[2,4],[3,3],[1,6],[4,2]],(a,b)=>numeric(`Grafikte (0; ${b}) ile (2; ${2*a+b}) noktaları var. x bir arttığında y kaç artar?`,a,[2*a,b,a+b],`Eğim (${2*a+b} − ${b}) ÷ 2 = ${a} olur.`,positiveGraph([line(a,b,0,4)],4,20,"Grafik iki nokta arasındaki sabit değişimi gösteriyor.",`Doğru (0; ${b}) ve (2; ${2*a+b}) noktalarından geçiyor.`))),
        ask("Bir grafiğin y eksenini (0; 9) noktasında kesmesi ne anlama gelir?","Girdi 0 iken çıktı 9’dur.",["Eğim 9’dur.","Grafik x eksenini 9’da keser.","Çıktı her zaman 9’dur."],"Y ekseninde x = 0 olduğundan y değeri başlangıç değeridir."),
        ask("Bir tablonun y değerleri 18, 15, 12, 9. x birer artıyor. Değişim oranı nedir?","−3",["3","−9","0"],"Her adımda çıktı 3 azalır. İşaret bu yüzden negatiftir.")
      ]),
      round("Kuralı seç",[
        ...variants([[3,5],[4,8],[2,7],[5,2]],(a,b)=>ask(`Başlangıç ${b}. x bir arttığında çıktı ${a} artıyor. Hangi kural uygundur?`,`y = ${bin(a,b)}`,[`y = ${bin(b,a)}`,`y = ${a}x`,`y = ${bin(-a,b)}`],`Eğim ${a}, başlangıç değeri ${b}. Kural y = ${bin(a,b)} olur.`)),
        ask("Depo 24 L ile başlıyor. Dakikada 3 L azalıyor. Kalan miktarın kuralı hangisi?","y = 24 − 3x",["y = 24 + 3x","y = 3x","y = 3 − 24x"],"Başlangıç 24 ve birim değişim −3’tür."),
        numeric("y = 4x + 6 kuralıyla, 22 TL bütçeyle en fazla kaç tam birim alınır?",4,[5,6,3],"4x + 6 ≤ 22, yani x ≤ 4.")
      ])
    ]
  },
  {
    id:2,folder:"02",title:"Referans fonksiyonunu oku",description:"f(x) = x grafiğinde kümeleri, işareti ve uç değerleri incele.",
    rounds:[
      round("Referans değerleri",[
        ...variants([[-4],[-1.5],[0],[3]],x=>numeric(`f(x) = x ise f(${n(x)}) kaçtır?`,x,[-x,1,x+2],"Referans fonksiyonu girdiyi aynen çıktı olarak verir.")),
        ask("f(x) = x grafiğinde hangi nokta yer alır?","(−2; −2)",["(−2; 2)","(2; −2)","(0; 2)"],"Doğru üzerindeki her noktada x ve y değerleri eşittir."),
        ask("f(x) = x doğrusu eşit ölçekli eksenlerde hangi iki noktadan geçer?","(0; 0) ve (2; 2)",["(0; 2) ve (2; 0)","(1; 0) ve (2; 1)","(0; 0) ve (2; 4)"],"f(0) = 0 ve f(2) = 2’dir.")
      ]),
      round("İşaret ve eğim",[
        ask("f(x) = x ne zaman negatiftir?","x < 0",["x > 0","x = 0","Tüm gerçek sayılarda"],"Girdi negatifse aynı değer çıktı olur."),
        ask("f(x) = x fonksiyonunun sıfırı nedir?","0",["1","−1","Her gerçek sayı"],"Yalnızca 0 girdisi 0 çıktısını verir."),
        ask("f(x) = x grafiğinin eğimi kaçtır?","1",["0","−1","2"],"x bir artarken y de bir artar."),
        ask("f(x) = x için f(a) = f(b) ise ne söylenir?","a = b",["a = −b","a + b = 0","a ve b her zaman farklı"],"f(a) = a ve f(b) = b olduğundan eşitlik a = b demektir."),
        ask("f(x) = x için x artınca çıktı ne yapar?","Aynı miktarda artar.",["Aynı miktarda azalır.","Dört kat artar.","Sabit kalır."],"İki girdinin farkı çıktılarda aynen korunur."),
        ask("Tanım kümesi ℝ iken f(x) = x’in maksimumu var mı?","Yok, her çıktıdan daha büyüğü alınabilir.",["Var, 0’dır.","Var, grafikte görünen son değerdir.","Var, 1’dir."],"Her f(x) değerinden daha büyük olan f(x + 1) tanımlıdır.")
      ]),
      round("Açık ve kapalı uçlar",[
        ...variants([[-3,4],[-2,3],[-1,5],[-4,2]],(a,b)=>ask(`f(x) = x yalnız ${n(a)} ≤ x < ${n(b)} için tanımlı. Sağ uç nasıl gösterilir?`,`(${n(b)}; ${n(b)}) boş nokta`,[`(${n(b)}; ${n(b)}) dolu nokta`,`(${n(a)}; ${n(a)}) boş nokta`,`(${n(b)}; 0) dolu nokta`],"Üst sınırda eşitlik olmadığı için sağ uç açık kalır.",graph([line(1,0,a,b,{openTo:true})],{minX:-5,maxX:5,minY:-5,maxY:5,alt:`Doğru parçası ${n(a)} ile ${n(b)} arasında, sağ uç boş.` }))),
        ask("f(x) = x ve tanım kümesi (−2; 4]. Görüntü kümesi hangisi?","(−2; 4]",["[−2; 4]","[−2; 4)","ℝ"],"Çıktı her girdinin aynısıdır. Aralığın uçları aynı kalır."),
        ask("f(x) = x ve tanım kümesi [−3; 2). Minimum nedir?","−3",["2","0","Minimum yoktur."],"Sol uç tanım kümesine dahildir ve artan fonksiyonun en küçük çıktısını verir.")
      ]),
      round("Tanım aralığını yorumla",[
        ask("f(x) = x ve tanım kümesi (−4; 2]. Maksimum nedir?","2",["−4","0","Maksimum yoktur."],"Sağ uç dahil ve fonksiyon artandır."),
        ask("f(x) = x ve tanım kümesi [−4; 2). Maksimum nedir?","Maksimum yoktur.",["2","−4","0"],"2 aralığa dahil değildir ve 2’den küçük her adayın daha büyüğü vardır."),
        ask("f(x) = x ve tanım kümesi [1; 5]. Fonksiyonun sıfırı nedir?","Sıfırı yoktur.",["0","1","5"],"0 bu tanım aralığına dahil değildir."),
        ask("f(x) = x, −5 < x ≤ −1. Çıktılar hangi işarete sahiptir?","Hepsi negatiftir.",["Hepsi pozitiftir.","Bazıları pozitif, bazıları negatif.","Hepsi sıfırdır."],"Bu aralıkta tüm girdiler negatiftir ve çıktılar girdilere eşittir."),
        ask("f(x) = x, −2 ≤ x ≤ 4. En küçük ve en büyük çıktılar hangileridir?","−2 ve 4",["−2 ve 0","0 ve 4","2 ve 4"],"Artan grafiğin kapalı iki ucu da alınır."),
        ask("Aynı kural ℝ’den [−1; 3] aralığına kısıtlanınca hangi özellik korunur?","Artanlık",["Görüntü kümesi ℝ kalır.","Maksimum yokluğu","Minimum yokluğu"],"Kısıtlama, girdi sıralamasını koruyan kuralı değiştirmez.")
      ])
    ]
  },
  {
    id:3,folder:"03",title:"Eğimi değiştir",description:"g(x) = ax için ölçek, yansıma ve eğimin işaretini keşfet.",
    rounds:[
      round("Katsayıyı uygula",[
        ...variants([[2,3],[-2,3],[.5,4],[-1.5,-2],[.25,-4],[-.5,0]],(a,x)=>numeric(`g(x) = ${bin(a,0)} ise g(${n(x)}) kaçtır?`,a*x,[-a*x,a+x,x],`g(${n(x)}) = ${n(a)} × ${n(x)} = ${n(a*x)}.`))
      ]),
      round("Dikliği karşılaştır",[
        ...variants([[2,.5],[-3,1],[-.5,2],[1,-2.5]],(a,b)=>ask(`g(x) = ${bin(a,0)}, h(x) = ${bin(b,0)}. Hangisinin grafiği daha dik?`,Math.abs(a)>Math.abs(b)?"g":"h",[Math.abs(a)>Math.abs(b)?"h":"g","İkisi eşit","Girdiye göre değişir"],`Diklik için |a| karşılaştırılır. ${n(Math.abs(a))} ve ${n(Math.abs(b))} aynı büyüklükte değildir.`,graph([line(a,0),line(b,0,-4,4,{c:1})],{caption:"Mavi doğru g, yeşil doğru h.",alt:`Mavi doğrunun eğimi ${n(a)}, yeşil doğrunun eğimi ${n(b)}.` }))),
        ask("a = 0,25 iken f(x) = x’e göre nasıl bir dönüşüm olur?","Dikey daralma",["Dikey genişleme","Yatay öteleme","x eksenine göre yansıma"],"0 < |a| < 1 olduğunda y değerlerinin büyüklüğü küçülür."),
        ask("a = −1 iken hangi dönüşüm gerçekleşir?","x eksenine göre yansıma",["2 kat dikey genişleme","Yukarı öteleme","Dikey daralma"],"Her y değeri işaret değiştirir, büyüklüğü aynı kalır.")
      ]),
      round("İşaret ve yön",[
        ...variants([[2],[-2],[.5],[-.75]],a=>ask(`g(x) = ${bin(a,0)} için yön ve x > 0 olduğundaki işaret hangisi?`,a>0?"Artan ve pozitif":"Azalan ve negatif",[a>0?"Azalan ve negatif":"Artan ve pozitif","Artan ve negatif","Azalan ve pozitif"],`a ${a>0?"pozitif":"negatif"} olduğundan eğim ve pozitif girdideki çıktı aynı işarettedir.`)),
        ask("a ≠ 0 iken g(x) = ax’in sıfırı nedir?","0",["a","−a","Sıfırı yoktur."],"ax = 0 ve a ≠ 0 ise x = 0."),
        ask("ℝ’de tanımlı g(x) = −2x bire bir mi?","Evet, farklı girdiler farklı çıktılar verir.",["Hayır, çünkü azalan.","Hayır, çünkü 0’dan geçer.","Yalnız pozitif girdilerde bire bir."],"−2 ile çarpma, iki farklı girdiyi aynı değerde birleştirmez.")
      ]),
      round("Modeli geri kur",[
        ...variants([[2,6],[4,-2],[-2,3],[3,.75]],(x,y)=>numeric(`g(x) = ax ve g(${n(x)}) = ${n(y)}. a kaçtır?`,y/x,[y*x,-y/x,x/y],`a = ${n(y)} ÷ ${n(x)} = ${n(y/x)}.`)),
        ask("g(2) = −6 ve g(x) = ax. Referansa göre hangi dönüşüm var?","3 kat dikey genişleme ve yansıma",["Dikey daralma ve yansıma","Yukarı 3 birim öteleme","Yansımasız 3 kat dikey genişleme"],"a = −3. Büyüklük 3, işaret negatiftir."),
        ask("Orijinden geçen bir doğru (4; 1) noktasını içeriyor. Kural hangisi?","g(x) = 0,25x",["g(x) = 4x","g(x) = x + 1","g(x) = −0,25x"],"Eğim (1 − 0)/(4 − 0) = 0,25.")
      ])
    ]
  },
  {
    id:4,folder:"04",title:"Grafiği ötele",description:"Dikey ve yatay ötelemede noktaların ve aralıkların hareketini karşılaştır.",
    rounds:[
      round("Noktayı taşı",[
        ...variants([[1,2],[-2,3],[0,-3],[3,-1.5]],(t,b)=>ask(`f(x) = x grafiğinde (${n(t)}; ${n(t)}) noktası f(x) + (${n(b)}) dönüşümüyle nereye gider?`,`(${n(t)}; ${n(t+b)})`,[`(${n(t+b)}; ${n(t)})`,`(${n(t)}; ${n(t-b)})`,`(${n(t)}; ${n(t)})`],"Dikey öteleme yalnızca y koordinatına b ekler.")),
        ask("f(x + 2), referans grafiğini hangi yöne taşır?","2 birim sola",["2 birim sağa","2 birim yukarı","2 birim aşağı"],"Aynı f girdisini elde etmek için yeni x’ten 2 eksiltilir."),
        ask("f(x − 3) dönüşümünde (1; 1) hangi noktaya gider?","(4; 1)",["(−2; 1)","(1; 4)","(1; −2)"],"Yatayda 3 birim sağa ötelenir, y değişmez.")
      ]),
      round("Eksen kesişimleri",[
        ...variants([[2],[-3],[1.5],[-2.5]],b=>numeric(`g(x) = ${bin(1,b).replace("1x","x")}. Bu fonksiyonun sıfırı kaçtır?`,-b,[b,0,-2*b],`x + (${n(b)}) = 0 ⇒ x = ${n(-b)}.`,graph([line(1,0),line(1,b,-4,4,{c:1})],{caption:"Mavi f, yeşil g grafiği.",alt:`Yeşil doğru y eksenini ${n(b)} değerinde keser.` }))),
        ask("g(x) = x − 4, y eksenini nerede keser?","(0; −4)",["(−4; 0)","(4; 0)","(0; 4)"],"y ekseninde x = 0 alınır."),
        ask("f grafiği 3 birim yukarı taşınırsa eğimi ne olur?","Aynı kalır.",["3 artar.","3 azalır.","İşaret değiştirir."],"İki noktanın y değerlerine aynı sayı eklenince farkları değişmez.")
      ]),
      round("Aralıkları taşı",[
        ...variants([[-3,3,2],[-2,4,-1],[-1,3,3],[-4,2,-2]],(lo,hi,b)=>ask(`f(x) = x, tanım kümesi [${n(lo)}; ${n(hi)}]. f(x + (${n(b)})) için yeni tanım kümesi hangisi?`,`[${n(lo-b)}; ${n(hi-b)}]`,[`[${n(lo+b)}; ${n(hi+b)}]`,`[${n(lo)}; ${n(hi)}]`,`[${n(lo-b)}; ${n(hi+b)}]`],`Eski aralık x + (${n(b)}) için geçerli. İki uçtan da ${n(b)} çıkarılır.`)),
        ask("f(x) = x, tanım kümesi [−3; 3]. f(x) + 2 için görüntü kümesi hangisi?","[−1; 5]",["[−5; 1]","[−3; 3]","[1; 5]"],"Dikey öteleme görüntü aralığının iki ucuna 2 ekler."),
        ask("Bir grafik 2 birim sola kaydırılıyor. Hangi küme aynı kalır?","Görüntü kümesi",["Tanım kümesi","Sıfırlar kümesi","Yalnızca tanım aralığının alt ucu"],"Yatay öteleme x koordinatlarını taşır. Alınan y değerleri değişmez.")
      ]),
      round("Ötelemeyi yorumla",[
        ask("f(x) = x, x ∈ [−3; 3]. A(x) = f(x) + 2 ve B(x) = f(x + 2). x = −4 için hangisi tanımlı?","Yalnız B",["Yalnız A","Her ikisi","Hiçbiri"],"A’nın tanımı [−3; 3], B’ninki [−5; 1]’dir."),
        ask("A(x) = x + 2, x ∈ [−3; 3]; B(x) = x + 2, x ∈ [−5; 1]. Tanım kümelerinin ortak kısmı hangisi?","[−3; 1]",["[−5; 3]","[−5; −3]","[1; 3]"],"İki aralıkta da bulunan sayılar −3 ile 1 arasındadır."),
        numeric("f(2) = 2 iken dikey öteleme sonrası g(2) = 7 oldu. b kaçtır?",5,[7,-5,9],"g(2) − f(2) = 7 − 2 = 5."),
        numeric("f(−1) = −1 iken g(−1) = −4. Dikey öteleme katsayısı kaçtır?",-3,[3,-5,-4],"b = −4 − (−1) = −3."),
        ask("Bir grafiğin sağ ucu boş. Aynı grafik sağa ötelenirse bu ucun türü ne olur?","Yine boş kalır.",["Dolu olur.","Grafiğin ortasına gider.","Uç tipi eğime göre belirlenir."],"Öteleme noktanın yerini değiştirir, uç noktanın dahil olup olmamasını değiştirmez."),
        ask("f(x) = x bütün gerçek sayılarda. f(x) + 2 ile f(x + 2) grafikleri nasıl görünür?","Çakışır.",["Paralel ve ayrıdır.","Sadece orijinde kesişir.","Biri yatay, biri dikeydir."],"Her iki kural da tüm gerçek x’ler için x + 2 sonucunu verir.")
      ])
    ]
  },
  {
    id:5,folder:"05",title:"Doğrusal ve sabit fonksiyonları incele",description:"ax + b kuralında eğimi, eksen kesişimlerini ve sabit özel durumu çalış.",
    rounds:[
      round("a ve b’yi oku",[
        ...variants([[2,7],[-3,6],[.5,-2],[-1,4]],(a,b)=>ask(`g(x) = ${bin(a,b)}. Eğim ve başlangıç değeri sırasıyla nedir?`,`${n(a)} ve ${n(b)}`,[`${n(b)} ve ${n(a)}`,`${n(-a)} ve ${n(b)}`,`${n(a)} ve 0`],"x’in katsayısı eğimdir. Sabit terim x = 0’daki çıktıdır.")),
        ask("Grafik (0; 5) ve (1; 2) noktalarından geçiyor. Kural hangisi?","g(x) = −3x + 5",["g(x) = 3x + 5","g(x) = −3x + 2","g(x) = 5x − 3"],"Eğim 2 − 5 = −3, başlangıç 5’tir."),
        ask("Eğim −4, y ekseni kesişimi (0; −2). Kural hangisi?","g(x) = −4x − 2",["g(x) = 4x − 2","g(x) = −2x − 4","g(x) = −4x + 2"],"a = −4 ve b = −2, ax + b biçimine yerleştirilir.")
      ]),
      round("Sıfırı ve işareti bul",[
        ...variants([[2,-4],[-2,6],[3,6],[-1,-3]],(a,b)=>numeric(`g(x) = ${bin(a,b)}. Fonksiyonun sıfırı kaçtır?`,-b/a,[b,b/a,0],`ax + b = 0 ⇒ x = ${n(-b/a)}.`,graph([line(a,b)],{caption:"Doğrunun yatay eksen kesişimini incele.",alt:`Eğim ${n(a)}, düşey eksen kesişimi ${n(b)} olan doğru.` }))),
        ask("g(x) = −2x + 6 hangi aralıkta pozitiftir?","x < 3",["x > 3","x < −3","x = 3"],"Sıfır 3’tür ve negatif eğimde pozitif değerler sıfırın solundadır."),
        ask("g(x) = 3x − 6 hangi aralıkta negatiftir?","x < 2",["x > 2","x < −2","x = 2"],"Sıfır 2 ve eğim pozitiftir. Negatif çıktılar sıfırın solundadır.")
      ]),
      round("Sabit fonksiyonlar",[
        ...variants([[4],[-3],[2],[-1]],b=>ask(`g(x) = ${n(b)} bütün gerçek x’ler için tanımlı. Görüntü kümesi hangisi?`,`{${n(b)}}`,["ℝ","{0}",`{${n(-b)}}`],"Her girdi aynı tek çıktıyı verir.")),
        ask("g(x) = 0 fonksiyonunun sıfırlarının kümesi hangisidir?","ℝ",["{0}","∅","{1}"],"Her gerçek girdi 0 çıktısını verdiği için hepsi birer sıfırdır."),
        ask("g(x) = −2 fonksiyonunun minimum ve maksimum değerleri nelerdir?","İkisi de −2",["−2 ve 0","Minimum −2, maksimum yok.","İkisi de yok."],"Çıktı kümesinde yalnız −2 vardır.")
      ]),
      round("Grafikleri karşılaştır",[
        ask("g(x) = 2x + 1 ve h(x) = 2x − 3 grafikleri nasıldır?","Paralel doğrular",["Çakışan doğrular","Dik doğrular","Orijinde kesişen doğrular"],"Eğimler eşit, y ekseni kesişimleri farklıdır."),
        numeric("g(x) = 2x + 1 ve h(x) = x + 4 grafikleri hangi x değerinde kesişir?",3,[4,1,-3],"2x + 1 = x + 4 ⇒ x = 3."),
        ask("g(x) = −x + 2 ve h(x) = x + 2 hangi noktada kesişir?","(0; 2)",["(2; 0)","(0; 0)","(2; 2)"],"Her iki grafiğin y ekseni kesişimi aynıdır."),
        ask("Bir fonksiyonun grafiği y = 5 doğrusu. Eğim ve sıfırlar kümesi nedir?","Eğim 0, sıfırlar kümesi ∅.",["Eğim 5, sıfırlar kümesi {0}.","Eğim 0, sıfırlar kümesi ℝ.","Eğim 5, sıfırlar kümesi {5}."],"Yatay çizgi olduğu için eğim 0. Çıktı 5 olduğu için hiç sıfır yok."),
        ask("ℝ’de g(x) = −2x + 5’in maksimum değeri var mı?","Yok, x küçüldükçe çıktı sınırsız artar.",["Var, 5’tir.","Var, 0’dır.","Var, eğimin mutlak değeridir."],"Tanım kümesinde alt sınır yoktur. Negatif eğim nedeniyle daha küçük girdiler daha büyük çıktılar verir."),
        ask("Hangisi ℝ’de bire bir değildir?","g(x) = 4",["g(x) = 4x","g(x) = −x + 4","g(x) = x + 4"],"Sabit fonksiyon farklı girdilere aynı çıktıyı verir.")
      ])
    ]
  },
  {
    id:6,folder:"06",title:"Parçalı model kur",description:"Doğru kuralı seç, eşik değerini ve açık–kapalı uçları yorumla.",
    rounds:[
      round("Doğru dalı seç",[
        ...variants([[3,3],[4,3],[2,4],[5,5]],(k,x)=>ask(`İlk kural x < ${k}, ikinci kural x ≥ ${k} için. x = ${x} hangi kurala girer?`,x<k?"İlk kural":"İkinci kural",[x<k?"İkinci kural":"İlk kural","Her iki kural","Hiçbiri"],`x = ${x} değerini eşitsizliklerle karşılaştır. Eşitlik işareti ikinci kurala ait.`)),
        ask("İlk kural x ≤ 2, ikinci kural x > 2 için. 2’de hangi uç dolu?","İlk kuralın ucu",["İkinci kuralın ucu","İkisi de","İkisi de değil"],"2 yalnızca ilk kuralın koşuluna dahildir."),
        ask("Bir parçalı fonksiyonun eşik değerinde iki formül farklı sonuç veriyor. Gerçek çıktıyı nasıl seçersin?","Eşitliği içeren koşulun formülünü kullanırım.",["Sonuçların ortalamasını alırım.","Her zaman küçük sonucu alırım.","Her zaman ilk formülü seçerim."],"Fonksiyon her girdide bir çıktı verir. Eşitlik işareti doğru dalı belirler.")
      ]),
      round("Çıktıyı hesapla",[
        ...variants([[3,2],[3,3],[3,4],[4,1],[4,4],[4,5]],(k,x)=>numeric(`f(x) = x + 1 (x < ${k}), f(x) = 2x (x ≥ ${k}). f(${x}) kaçtır?`,x<k?x+1:2*x,[x+1,2*x,x,2*x+1],`${x} ${x<k?"<":"≥"} ${k}. Uygun formülle sonuç ${x<k?x+1:2*x}.`))
      ]),
      round("Açık ve dolu uçlar",[
        ...variants([[2,1],[3,1],[3,2],[4,1]],(k,b)=>{const open=k+b,closed=2*k;return ask(`İlk parça y = x + ${b}, x < ${k}; ikinci parça y = 2x, x ≥ ${k}. x = ${k} için hangi nokta dolu?`,`(${k}; ${closed})`,[`(${k}; ${open})`,`(${k}; 0)`,`(0; ${closed})`],`İkinci parça ${k} değerini içerir ve burada çıktı ${closed} olur.`,positiveGraph([line(1,b,0,k,{openTo:true}),line(2,0,k,6,{c:1})],6,12,"Boş ve dolu noktaları karşılaştır.",`Açık uç (${k}; ${open}), kapalı uç (${k}; ${closed}).`));}),
        ask("İlk parçanın çıktıları [1; 3), ikinci parçanın çıktıları [5; 9]. Hangi çıktı alınamaz?","4",["1","5","9"],"4 iki aralığın arasında kalır."),
        ask("İki parça eşikte aynı yüksekliğe geliyor ve bir tanesi eşiği içeriyor. Grafikte o nokta nasıl görünür?","Dolu nokta",["Boş nokta","Çift yükseklikte iki nokta","Görünmez"],"En az bir parça eşik girdisini ve o çıktıyı içerdiği için nokta grafiğe dahildir.")
      ]),
      round("Tarife ve eşik yorumları",[
        ...variants([[4,12,3,7],[3,10,4,2],[2,16,5,2],[5,20,2,9]],(k,b,a,x)=>numeric(`İlk ${k} birim için toplam ${b} TL. Sonraki her birim için ${a} TL ekleniyor. ${x} birimin ücreti nedir?`,b+a*Math.max(0,x-k),[x*a,b+x*a,b-a],`Eklenen birim sayısı ${Math.max(0,x-k)}. Ödenecek tutar ${b+a*Math.max(0,x-k)} TL.`)),
        ask("İlk dilimde fiyat sabit, ikinci dilimde kullanım arttıkça artıyor. Eğimler nasıl sıralanır?","Önce 0, sonra pozitif",["Önce negatif, sonra 0","İkisi de 0","Önce pozitif, sonra negatif"],"Sabit fiyat yatay grafik, artan fiyat pozitif eğimli grafik verir."),
        numeric("İlk 3 birim 10 TL, sonraki her birim 4 TL. 23 TL ile en fazla kaç tam birim alınabilir?",6,[5,7,4],"6 birim 22 TL, 7 birim 26 TL tutar.")
      ])
    ]
  },
  {
    id:7,folder:"07",title:"Gerçek yaşam modellerini karşılaştır",description:"İki modelin eğimlerini, kesişimini ve geçerli olduğu aralığı yorumla.",
    rounds:[
      round("Başlangıç ve eğim",[
        ...variants([[20,4,26,2],[12,6,18,3],[30,5,39,2],[24,7,40,3]],(p,a,q,b)=>ask(`A = ${p} + ${a}t, B = ${q} + ${b}t. Hangisi daha yüksek başlar, hangisi daha hızlı artar?`,"B daha yüksek başlar, A daha hızlı artar.",["A daha yüksek başlar, B daha hızlı artar.","A hem daha yüksek başlar hem daha hızlı artar.","İkisi aynı başlar ve aynı artar."],`B’nin sabit terimi ${q} daha büyük, A’nın eğimi ${a} daha büyüktür.`)),
        ask("Batarya A saatte 4 yüzde puan azalıyor. B saatte 2 yüzde puan artıyor. Eğimler hangileri?","−4 ve +2",["+4 ve +2","−4 ve −2","+4 ve −2"],"Azalma negatif, artış pozitif eğim verir."),
        ask("İki modelin başlangıç ölçümü hangi anda karşılaştırılır?","t = 0",["t = 1","Kesişim anında","Deney bitince"],"Kuralın sabit terimi t = 0 anındaki değeri verir.")
      ]),
      round("Kesişimi hesapla",[
        ...variants([[12,5,18,2],[20,6,32,2],[10,7,22,4],[30,4,38,2],[48,-4,24,2],[70,-5,35,2]],(p,a,q,b)=>numeric(`A(t) = ${p} ${a<0?"−":"+"} ${Math.abs(a)}t, B(t) = ${q} + ${b}t. Seviyeler ne zaman eşitlenir?`,(q-p)/(a-b),[(q-p)/(Math.abs(a)+b),q-p,(p-q)/(a-b)],`İki kural eşitlenir. (${n(a)} − ${b})t = ${q-p}, dolayısıyla t = ${n((q-p)/(a-b))}.`))
      ]),
      round("Grafikten karar ver",[
        ...variants([[14,4,20,2,1],[12,5,18,2,4],[18,6,26,2,3],[24,-2,8,2,2]],(p,a,q,b,t)=>{
          const left=p+a*t,right=q+b*t;
          return ask(`Grafikte t = ${t} için hangi modelin değeri daha büyük?`,left>right?"A":"B",[left>right?"B":"A","Eşit","Grafikten okunamaz"],`t = ${t} iken A = ${left}, B = ${right}. Dikeyde daha yukarıda olan daha büyüktür.`,
            positiveGraph([line(a,p,0,6),line(b,q,0,6,{c:1})],6,60,"Mavi çizgi A, yeşil çizgi B.",`A, ${p} ile; B, ${q} ile başlar. Eğimler sırasıyla ${n(a)} ve ${n(b)}.`));
        }),
        ask("İki maliyet grafiği (4; 80) noktasında kesişiyor. Bu nokta neyi anlatır?","4 birimde iki model de 80 TL’dir.",["80 birimde fiyat 4 TL’dir.","İki grafiğin eğimi 4’tür.","Başlangıç ücreti 80 TL’dir."],"Kesişim aynı girdide aynı çıktının elde edildiği noktadır."),
        ask("A’nın başlangıç tutarı küçük, eğimi daha büyük. Grafikleri bir kez kesişiyor. Kesişimden sonra hangisi daha ucuz?","Eğimi küçük olan B",["Başlangıcı küçük olan A","Her zaman eşitler","Karşılaştırılamaz"],"Eşitlendikten sonra A’nın ücreti daha hızlı artar.")
      ]),
      round("Modelin sınırını yorumla",[
        ask("Bir deney modeli yalnız 0 ≤ t ≤ 8 için verilmiş. t = 10 sonucu hakkında ne söylenebilir?","Verilen koşullarla doğrulanamaz.",["Kesinlikle grafiğin devamındaki değerdir.","Her zaman 0’dır.","Son ölçüme eşittir."],"10, kabul edilen zaman aralığının dışındadır."),
        ask("Kapalı [0; 6] aralığında azalan model en küçük çıktıyı nerede alır?","t = 6’da",["t = 0’da","t = 3’te","En küçük değer yok."],"Azalan bir modelin en küçük değeri dahil olan sağ uçtadır."),
        numeric("Bir tankta 30 L var ve dakikada 4 L azalıyor. En az 10 L kalması için en fazla kaç dakika geçebilir?",5,[4,6,10],"30 − 4t ≥ 10 ⇒ t ≤ 5."),
        numeric("A = 14 + 4t, B = 20 + 2t. t = 5’te A ile B arasındaki pozitif fark kaçtır?",4,[2,6,8],"A(5) = 34, B(5) = 30. Fark 4’tür."),
        ask("İki model 4,2 saatte eşitleniyor. 0,2 saat kaç dakikadır?","12",["2","20","24"],"0,2 × 60 = 12 dakika."),
        ask("Bir doğrusal modeli kullanırken ölçüm aralığı neden önemlidir?","Kuralın hangi girdilerde geçerli olduğunu belirtir.",["Eğimi her zaman sıfır yapar.","Başlangıç değerini siler.","Her aralıkta çıktı otomatik olarak aynıdır."],"Bir modeli, şartlarının geçerli olduğu girdi aralığında yorumlarız.")
      ])
    ]
  }
];
