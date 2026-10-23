/* Cube sequences: classification, common difference/ratio and the nth term. */
const SequenceActivities=(()=>{
 const edges=Object.freeze([16,8,4,2]),cubeNumbers=Object.freeze([8,4,2,1]),areas=Object.freeze(edges.map(e=>e*e));
 const edgeRatio=1/2,areaRatio=1/4;
 function arithmeticTerm(first,difference,n){if(!Number.isInteger(n)||n<1)throw new RangeError('Sıra numarası pozitif tam sayı olmalıdır.');return first+(n-1)*difference;}
 function geometricTerm(first,ratio,n){if(!Number.isInteger(n)||n<1)throw new RangeError('Sıra numarası pozitif tam sayı olmalıdır.');return first*ratio**(n-1);}
 function matchesNumeric(question,answer){
  let raw=String(answer).trim().toLowerCase().replace(/\s+/g,'').replace(',','.');
  if(question.unit==='cm²')raw=raw.replace(/cm(?:²|2)$/,'');
  else if(question.unit==='cm')raw=raw.replace(/cm$/,'');
  else raw=raw.replace(/kat$/,'');
  const match=/^\+?(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?$/.exec(raw);if(!match)return false;
  const value=Number(match[1])/(match[2]===undefined?1:Number(match[2]));
  return Number.isFinite(value)&&Math.abs(value-question.numericValue)<1e-10;
 }
 const mn=t=>`<mn>${t}</mn>`,mi=t=>`<mi mathvariant="normal">${t}</mi>`,op=t=>`<mo>${t}</mo>`,row=t=>`<mrow>${t}</mrow>`;
 const sub=(name,i)=>`<msub>${mi(name)}${/^\d+$/.test(i)?mn(i):mi(i)}</msub>`;
 const frac=(a,b)=>`<mfrac>${row(a)}${row(b)}</mfrac>`;
 const power=(base,e)=>`<msup>${row(op('(')+base+op(')'))}${row(e)}</msup>`;
 const exponent=mi('n')+op('−')+mn(1),q=frac(mn(1),mn(4)),h=frac(mn(1),mn(2));
 const par=t=>op('(')+t+op(')'),an=sub('a','n')+op('='),An=sub('A','n')+op('=');
 const formulas={
  arithRule:[an+mn(2)+op('+')+mn(4)+op('×')+par(exponent),'a n eşittir 2 artı 4 çarpı n eksi bir'],
  arithShift:[an+mn(2)+op('+')+mn(4)+op('×')+mi('n'),'a n eşittir 2 artı 4 çarpı n'],
  arithSwapped:[an+mn(4)+op('+')+mn(2)+op('×')+par(exponent),'a n eşittir 4 artı 2 çarpı n eksi bir'],
  arithGeometric:[an+mn(2)+op('×')+`<msup>${mn(4)}${row(exponent)}</msup>`,'a n eşittir 2 çarpı 4 üzeri n eksi bir'],
  half:[h,'İkide bir'],quarter:[q,'Dörtte bir'],eighth:[frac(mn(1),mn(8)),'Sekizde bir'],two:[mn(2),'İki'],four:[mn(4),'Dört'],
  area:[An+mn(256)+op('×')+power(q,exponent),'A n eşittir 256 çarpı dörtte bir üzeri n eksi bir'],
  halfArea:[An+mn(256)+op('×')+power(h,exponent),'A n eşittir 256 çarpı ikide bir üzeri n eksi bir'],
  shiftedArea:[An+mn(256)+op('×')+power(q,mi('n')),'A n eşittir 256 çarpı dörtte bir üzeri n'],
  edge:[An+mn(16)+op('×')+power(h,exponent),'A n eşittir 16 çarpı ikide bir üzeri n eksi bir'],
  thirdArea:[An+mn(324)+op('×')+power(frac(mn(1),mn(9)),exponent),'A n eşittir 324 çarpı dokuzda bir üzeri n eksi bir'],
  thirdEdge:[An+mn(324)+op('×')+power(frac(mn(1),mn(3)),exponent),'A n eşittir 324 çarpı üçte bir üzeri n eksi bir'],
  oldFirst:[An+mn(256)+op('×')+power(frac(mn(1),mn(9)),exponent),'A n eşittir 256 çarpı dokuzda bir üzeri n eksi bir'],
  thirdShift:[An+mn(324)+op('×')+power(frac(mn(1),mn(9)),mi('n')),'A n eşittir 324 çarpı dokuzda bir üzeri n']
 };
 function appendFormula(element,id){
  const [expression,label]=formulas[id],wrap=document.createElement('span');wrap.className='geo-formula';
  wrap.innerHTML=`<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline" mathvariant="normal" aria-label="${label}">${row(expression)}</math>`;element.append(wrap);
 }
 function dataFor(step){return step?.data||{edges,cubeNumbers,areas};}
 function classify(values){
  if(values.length<3)throw new RangeError('En az üç terim gerekir.');const close=(a,b)=>Math.abs(a-b)<1e-9;
  const difference=values[1]-values[0],ratio=values[0]===0?NaN:values[1]/values[0];
  const arithmetic=values.slice(1).every((v,i)=>close(v-values[i],difference));
  const geometric=Number.isFinite(ratio)&&values.slice(1).every((v,i)=>close(v,values[i]*ratio));
  return arithmetic&&geometric?'both':arithmetic?'arithmetic':geometric?'geometric':'neither';
 }
 const arithmeticModule={
  "title": "Uygulama 1: Ayrıt Dizileri",
  "watermark": "AYRIT DİZİLERİ",
  "steps": [
    {
      "id": "type",
      "title": "Ayrıt dizisinin türünü belirleyiniz",
      "sceneMode": "side",
      "a1": 2,
      "d": 4,
      "nCount": 5,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>Beş küpün ayrıt uzunlukları küçükten büyüğe 2 cm, 6 cm, 10 cm, 14 cm ve 18 cm’dir. Her sütun bir küpün ayrıt uzunluğunu gösterir.</p><p>Ardışık ayrıtların farklarını ve oranlarını karşılaştırarak bu dizinin türünü belirleyiniz.</p>",
      "reason": {
        "prompt": "Bu sınıflandırmayı hangi özellik destekler?",
        "options": [
          "Ardışık ayrıt uzunlukları arasındaki fark her adımda aynıdır.",
          "Ayrıtlar büyüdüğü için her iki tür dizi de oluşur.",
          "Küp sayısı beş olduğu için oran sabittir.",
          "Yalnız ilk iki küpün ayrıtları birbiriyle orantılıdır."
        ],
        "answer": 0,
        "hint": "Yalnız artış olmasına değil, artış miktarının her adımda aynı olup olmadığına bakınız."
      },
      "question": {
        "label": "Ayrıt uzunlukları 2 cm, 6 cm, 10 cm, 14 cm ve 18 cm olan küplerin ayrıt dizisi hangi türdedir?",
        "options": [
          "Aritmetik dizi",
          "Geometrik dizi",
          "Hem aritmetik hem geometrik dizi",
          "İki türe de uymaz"
        ],
        "answers": [
          "Aritmetik dizi"
        ],
        "success": "✓ Ardışık ayrıtlar arasındaki fark sabittir. Bu nedenle ayrıt uzunlukları bir aritmetik dizi oluşturur. Ardışık terimlerin oranları aynı değildir.",
        "hint": "Aynı ilişkinin bütün ardışık küp çiftlerinde korunup korunmadığını inceleyiniz."
      }
    },
    {
      "id": "difference",
      "title": "Ortak farkı belirleyiniz",
      "sceneMode": "side",
      "a1": 2,
      "d": 4,
      "nCount": 5,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>Aynı küpleri küçükten büyüğe inceleyiniz. Sonraki küpün ayrıt uzunluğundan önceki küpün ayrıt uzunluğunu çıkarınız.</p><p>Bütün ardışık çiftlerde aynı kalan fark d ile gösterilir.</p>",
      "question": {
        "label": "Ayrıtları 2 cm, 6 cm, 10 cm, 14 cm ve 18 cm olan küplerin ayrıt dizisinin ortak farkı d kaç santimetredir?",
        "options": [
          "2 cm",
          "4 cm",
          "6 cm",
          "8 cm"
        ],
        "answers": [
          "4 cm"
        ],
        "numericValue": 4,
        "unit": "cm",
        "success": "✓ 6 − 2 = 10 − 6 = 14 − 10 = 18 − 14 = 4 cm olduğundan ortak fark 4 cm’dir.",
        "hint": "Ardışık iki küpün ayrıtlarını çıkarınız. Bulduğunuz farkı başka bir çiftte de kontrol ediniz."
      }
    },
    {
      "id": "general-rule",
      "title": "Sıra numarasından ayrıt uzunluğuna",
      "sceneMode": "side",
      "a1": 2,
      "d": 4,
      "nCount": 5,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>İlk küpün ayrıt uzunluğu 2 cm’dir. Her sonraki küpe geçildiğinde ayrıt uzunluğu 4 cm artar.</p><p>aₙ, n. sıradaki küpün ayrıt uzunluğunu gösterir. Birinci küpten n. küpe ulaşmak için kaç kez artış yapıldığını düşününüz.</p>",
      "reason": {
        "prompt": "Ortak fark neden n − 1 ile çarpılır?",
        "options": [
          "İlk kübe ulaşmak için bir kez artış yapılır.",
          "Birinci küpten n. küpe geçerken n − 1 artış yapılır.",
          "Küpün her yüzü için ayrı artış yapılır.",
          "Sıra numarası ortak farka eşittir."
        ],
        "answer": 1,
        "hint": "Birinci, ikinci ve üçüncü küpe ulaşmak için kaç geçiş yapıldığını sayınız."
      },
      "question": {
        "label": "İlk ayrıtı 2 cm ve ortak farkı 4 cm olan bu dizide n. sıradaki küpün ayrıt uzunluğunu santimetre cinsinden hangi kural verir?",
        "options": [
          "aₙ = 2 + 4n",
          "aₙ = 4 + 2 × (n − 1)",
          "aₙ = 2 + 4 × (n − 1)",
          "aₙ = 2 × 4ⁿ⁻¹"
        ],
        "formulaOptions": [
          "arithShift",
          "arithSwapped",
          "arithRule",
          "arithGeometric"
        ],
        "answers": [
          "aₙ = 2 + 4 × (n − 1)"
        ],
        "successFormula": "arithRule",
        "success": "✓ İlk ayrıt 2 cm alınır ve ortak fark n − 1 kez eklenir. Aritmetik dizide aₙ = a₁ + d × (n − 1) olur.",
        "hint": "Seçtiğiniz kuralın n = 1 için ilk ayrıtı verdiğini kontrol ediniz. Birinci küpe ulaşmak için artış yapılmaz."
      }
    },
    {
      "id": "missing-term",
      "title": "Eksik ayrıt uzunluğunu bulunuz",
      "sceneMode": "side",
      "a1": 2,
      "d": 4,
      "nCount": 5,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>Aynı aritmetik dizide dördüncü küpün ayrıt ölçüsü gizlenmiştir. Bilinen ilk ayrıtı ve ortak farkı kullanınız.</p><p>Bulduğunuz genel terim kuralında n yerine 4 yazınız. Soru işaretiyle gösterilen sütunun yüksekliği gizli ölçüyü temsil etmez.</p>",
      "hiddenMeasurements": {
        "edges": [
          3
        ]
      },
      "question": {
        "label": "İlk ayrıtı 2 cm ve ortak farkı 4 cm olan küp dizisinde dördüncü sıradaki küpün ayrıt uzunluğu kaç santimetredir?",
        "options": [
          "10 cm",
          "12 cm",
          "14 cm",
          "18 cm"
        ],
        "answers": [
          "14 cm"
        ],
        "numericValue": 14,
        "unit": "cm",
        "success": "✓ a₄ = 2 + 4 × (4 − 1) = 14 cm olur. İlk küpten dördüncü küpe üç artış yapılır.",
        "hint": "Genel terim kuralında sıra numarasını 4 alınız. Ortak farkın kaç kez ekleneceğini belirleyiniz."
      }
    },
    {
      "id": "new-first",
      "title": "İlk ayrıt değiştiğinde kuralı kullanınız",
      "sceneMode": "side",
      "a1": 4,
      "d": 4,
      "nCount": 4,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>Bu kez ilk ayrıt 4 cm, ortak fark yine 4 cm’dir. İlk dört küpün ayrıtları 4 cm, 8 cm, 12 cm ve 16 cm olarak verilmiştir.</p><p>Yeni ilk terimi dikkate alarak beşinci sıradaki küpün ayrıtını bulunuz.</p>",
      "question": {
        "label": "İlk ayrıtı 4 cm ve ortak farkı 4 cm olan bu yeni dizide beşinci sıradaki küpün ayrıt uzunluğu kaç santimetredir?",
        "options": [
          "16 cm",
          "18 cm",
          "20 cm",
          "24 cm"
        ],
        "answers": [
          "20 cm"
        ],
        "numericValue": 20,
        "unit": "cm",
        "success": "✓ a₅ = 4 + 4 × (5 − 1) = 20 cm olur. Ortak fark aynı kalsa da ilk terim değiştiğinde genel terim kuralındaki başlangıç değeri değişir.",
        "hint": "Önceki dizinin ilk terimi yerine bu dizinin ilk ayrıtını kullanınız."
      }
    },
    {
      "id": "ninth-term",
      "title": "Yeni bir sıra numarasında kuralı sınayınız",
      "sceneMode": "side",
      "a1": 2,
      "d": 2,
      "nCount": 4,
      "chip": "Sıra numarası ve küpün ayrıt uzunluğu",
      "body": "<p>Takımdaki küpler bu kez 2 cm, 4 cm, 6 cm, 8 cm, … ayrıt uzunluklarıyla küçükten büyüğe sıralanıyor. Modelde ilk dört küp gösterilmiştir.</p><p>Ortak farkı bu yeni diziden belirleyiniz ve genel terim kuralıyla dokuzuncu küpün ayrıtını bulunuz.</p>",
      "final": true,
      "reason": {
        "prompt": "Dokuzuncu terimi bulmak için hangi işlem yapılır?",
        "options": [
          "İlk ayrıt dokuz ile çarpılır.",
          "İlk ayrıtın üzerine ortak fark dokuz kez eklenir.",
          "İlk ayrıtın üzerine ortak fark sekiz kez eklenir.",
          "Ortak fark ilk ayrıtın yerine yazılır."
        ],
        "answer": 2,
        "hint": "Birinci küp zaten başlangıç terimidir. Sonraki küplere kaç geçiş yapıldığını sayınız."
      },
      "question": {
        "label": "Ayrıt uzunlukları 2 cm, 4 cm, 6 cm, 8 cm, … olan aritmetik küp dizisinde dokuzuncu sıradaki küpün ayrıt uzunluğu kaç santimetredir?",
        "options": [
          "16 cm",
          "18 cm",
          "20 cm",
          "36 cm"
        ],
        "answers": [
          "18 cm"
        ],
        "numericValue": 18,
        "unit": "cm",
        "success": "✓ İlk ayrıt 2 cm ve ortak fark 2 cm’dir. a₉ = 2 + 2 × (9 − 1) = 18 cm olur. Sıra numarası küpün dizideki yerini, terim ise ayrıt uzunluğunu belirtir.",
        "hint": "Yeni ortak farkı belirleyiniz. İlk küpten dokuzuncu küpe geçmek için sekiz artış gerekir."
      }
    }
  ]
};
 const module={
  "title": "Uygulama 2: Ayrıt ve Alan Dizileri",
  "watermark": "AYRIT VE ALAN DİZİLERİ",
  "steps": [
    {
      "id": "patterns",
      "title": "Aritmetik ve geometrik dizileri ayırt ediniz",
      "sceneMode": "geo",
      "geoStep": 4,
      "geoView": "patterns",
      "chip": "Farkı ve oranı birlikte inceleyiniz",
      "series": [
        {
          "label": "I",
          "edges": [
            2,
            4,
            8
          ]
        },
        {
          "label": "II",
          "edges": [
            2,
            4,
            6
          ]
        },
        {
          "label": "III",
          "edges": [
            2,
            4,
            6,
            10
          ]
        }
      ],
      "body": "<p>Aynı küpler takımından üç farklı seçim yapılmıştır. Her kuleyi küçükten büyüğe inceleyiniz. Ayrıt çiziminde uzunluklar aynı sırayla verilmiştir.</p><p>Her seçimde ardışık ayrıtların farklarını ve oranlarını karşılaştırınız. Bir ilişkinin bütün ardışık çiftlerde korunup korunmadığını belirleyiniz.</p>",
      "question": {
        "label": "Ayrıt uzunlukları I. dizilimde 2, 4 ve 8 cm; II. dizilimde 2, 4 ve 6 cm; III. dizilimde 2, 4, 6 ve 10 cm olan küplerin örüntüleri hangi seçenekte doğru sınıflandırılmıştır?",
        "options": [
          "I geometrik, II aritmetik, III her ikisine de uymaz.",
          "Üç dizilim de geometriktir.",
          "I aritmetik, II geometrik, III her ikisine de uymaz.",
          "I geometrik, II ve III aritmetiktir."
        ],
        "answers": [
          "I geometrik, II aritmetik, III her ikisine de uymaz."
        ],
        "success": "✓ I. dizilimde oranlar 2 ve 2; II. dizilimde farklar 2 ve 2’dir. III. dizilimde farklar 2, 2, 4; oranlar 2, 3/2, 5/3 olur. Yalnız artan uzunluklar görmek geometrik dizi demek için yeterli değildir.",
        "hint": "Her kule için bütün ardışık farkları ve bütün ardışık oranları karşılaştırınız. İlk iki küpteki ilişkinin sonraki küplerde de sürmesi gerekir."
      }
    },
    {
      "title": "Ayrıt dizisinin türünü ve oranını belirleyiniz",
      "sceneMode": "geo",
      "geoStep": 4,
      "geoView": "edges",
      "chip": "Büyükten küçüğe • Her sırada bir küp",
      "body": "<p>16 cm, 8 cm, 4 cm ve 2 cm ayrıtlı küpler büyükten küçüğe sıralanmıştır. Önceki adımda karşılaştırdığınız fark ve oran ilişkilerini bu seçime uygulayınız.</p><p>Sonraki ayrıtı önceki ayrıta bölerek aynı oranın korunup korunmadığını inceleyiniz.</p>",
      "question": {
        "label": "Büyükten küçüğe 16 cm, 8 cm, 4 cm ve 2 cm ayrıtlarıyla sıralanan küplerin ayrıt dizisinin türü ve ortak oranı hangi seçenekte doğru verilmiştir?",
        "options": [
          "Geometrik dizi; ortak oran 1/2",
          "Aritmetik dizi; ortak fark 8 cm",
          "Geometrik dizi; ortak oran 2",
          "Geometrik dizi; ortak oran 1/4"
        ],
        "answers": [
          "Geometrik dizi; ortak oran 1/2"
        ],
        "success": "✓ 8/16 = 4/8 = 2/4 = 1/2 olur. Ardışık ayrıtların oranı sabit olduğundan dizi geometriktir. Sıralama büyükten küçüğe olduğu için ortak oran 1/2’dir.",
        "hint": "Sıralamanın yönünü dikkate alınız. Her sonraki ayrıtı bir önceki ayrıta bölünüz."
      },
      "id": "edges"
    },
    {
      "title": "Bir yüzün alanı nasıl değişir?",
      "sceneMode": "geo",
      "geoStep": 2,
      "geoView": "area-pair",
      "chip": "İki küp • Birer kare ön yüz",
      "body": "<p>Şimdi kulenin en büyük iki küpünün birer ön yüzünü karşılaştırınız. Büyük karedeki yardımcı çizgiler, küçük karenin bu yüzü nasıl kaplayabileceğini gösterir.</p><p>Ayrıt uzunluğu yarıya indiğinde kare yüzün her iki kenarı da değişir. Alan oranını çizimden yararlanarak belirleyiniz.</p>",
      "question": {
        "label": "Ayrıt uzunluğu 8 cm olan küpün bir kare ön yüzünün alanı, ayrıt uzunluğu 16 cm olan küpün bir kare ön yüzünün alanının kaç katıdır?",
        "options": [
          "1/2",
          "1/4",
          "1/8",
          "4"
        ],
        "formulaOptions": [
          "half",
          "quarter",
          "eighth",
          "four"
        ],
        "answers": [
          "1/4",
          "0,25",
          "0.25",
          "çeyreği",
          "1 / 4"
        ],
        "numericValue": 0.25,
        "success": "✓ Doğru. Büyük kare yüzü, küçük kare yüzlerden dört tanesi kaplar. 8 × 8 = 64 cm² ve 16 × 16 = 256 cm² olduğundan alan oranı 64/256 = 1/4 olur. Ayrıt oranı 1/2 iken alan oranı 1/4’tür.",
        "hint": "Küçük kareyle büyük karenin hem bir satırını hem de bir sütununu kaplamayı düşününüz. Bir uzunluk oranı ile bir alan oranı aynı ölçüyü anlatmaz."
      },
      "id": "area-pair",
      "reason": {
        "prompt": "Ayrıt oranı ile alan oranının farklı olmasını hangi açıklama destekler?",
        "options": [
          "Karenin yalnız bir kenarı küçüldüğü için alan yarıya iner.",
          "Karenin iki kenarı da yarıya indiği için alan 1/2 × 1/2 oranında değişir.",
          "Küpün üç boyutu olduğu için bir kare yüzün alanı sekizde bire iner.",
          "Küpün yüksekliği alan hesabına katılmazsa alan değişmez."
        ],
        "answer": 1,
        "hint": "Kare yüzün alanını bulurken kullanılan iki kenarın uzunluklarını ayrı ayrı karşılaştırınız."
      }
    },
    {
      "title": "Sıra numarasından yüz alanına",
      "sceneMode": "geo",
      "geoStep": 4,
      "geoView": "area-rule",
      "chip": "Aₙ • Sıradaki tek küpün ön yüz alanı",
      "body": "<p>Aynı dört küpün birer kare ön yüzünü büyükten küçüğe inceleyiniz. İlk alan 256 cm²’dir. Her sonraki alan, bir öncekinin dörtte biridir.</p><p>Aₙ, n. sıradaki küpün bir kare ön yüzünün alanını gösterir. İlk yüzden n. yüze geçerken ortak oranın kaç kez kullanıldığını düşününüz.</p>",
      "question": {
        "label": "Büyükten küçüğe sıralanan bu dört küpten n. sıradaki küpün ön yüz alanını santimetrekare cinsinden hangi kural verir?",
        "options": [
          "Aₙ = 256 × (1/2)ⁿ⁻¹",
          "Aₙ = 256 × (1/4)ⁿ⁻¹",
          "Aₙ = 256 × (1/4)ⁿ",
          "Aₙ = 16 × (1/2)ⁿ⁻¹"
        ],
        "formulaOptions": [
          "halfArea",
          "area",
          "shiftedArea",
          "edge"
        ],
        "answers": [
          "Aₙ = 256 × (1/4)ⁿ⁻¹"
        ],
        "successFormula": "area",
        "success": "✓ Doğru. İlk alan 256 cm²’dir. n. küpe kadar n − 1 kez 1/4 ile çarpılır. n = 1 için 256, n = 3 için 16 cm² elde edilir. Bu etkinlikte n, 1 ile 4 arasında bir tam sayıdır.",
        "hint": "Önce seçtiğiniz kuralın n = 1 için ilk alanı verdiğini kontrol ediniz. Sonra n = 2 için alanın kaç katına dönüştüğünü inceleyiniz."
      },
      "id": "area-rule",
      "reason": {
        "prompt": "Genel terimdeki üssün n − 1 olmasını hangi açıklama destekler?",
        "options": [
          "İlk küpe ulaşmak için bir kez küçültme yapılır.",
          "Küpün sıra numarası her zaman yüzünün alanına eşittir.",
          "İlk küpte küçültme yapılmaz; n. küpe ulaşmak için n − 1 kez küçültme yapılır.",
          "Genel terimdeki üs her sırada aynı kalır."
        ],
        "answer": 2,
        "hint": "Birinci ve ikinci sıradaki küplere ulaşana kadar kaç kez 1/4 ile çarpıldığını karşılaştırınız."
      }
    },
    {
      "id": "new-rule",
      "title": "Kuralı başka küplerde sınayınız",
      "sceneMode": "geo",
      "geoStep": 3,
      "geoView": "new-rule",
      "data": {
        "edges": [
          18,
          6,
          2
        ],
        "cubeNumbers": [
          9,
          3,
          1
        ],
        "areas": [
          324,
          36,
          4
        ]
      },
      "hideAreasUntilAnswer": true,
      "chip": "Takımdan seçilen 9, 3 ve 1 numaralı küpler",
      "body": "<p>Bu kez aynı takımdan ayrıt uzunlukları 18 cm, 6 cm ve 2 cm olan üç küp seçilmiştir. Küpleri büyükten küçüğe inceleyiniz.</p><p>Ayrıt oranını ve bir kare yüzün alan oranını yeniden belirleyiniz. Önceki kuraldaki ilk alanın ve ortak oranın bu seçimde nasıl değiştiğini düşününüz. Bu seçimde n, 1, 2 veya 3 değerini alır.</p>",
      "question": {
        "label": "Ayrıt uzunlukları büyükten küçüğe 18 cm, 6 cm ve 2 cm olan küplerden n. sıradaki küpün bir ön yüzünün alanını santimetrekare cinsinden hangi kural verir?",
        "options": [
          "Aₙ = 324 × (1/3)ⁿ⁻¹",
          "Aₙ = 256 × (1/9)ⁿ⁻¹",
          "Aₙ = 324 × (1/9)ⁿ⁻¹",
          "Aₙ = 324 × (1/9)ⁿ"
        ],
        "formulaOptions": [
          "thirdEdge",
          "oldFirst",
          "thirdArea",
          "thirdShift"
        ],
        "answers": [
          "Aₙ = 324 × (1/9)ⁿ⁻¹"
        ],
        "successFormula": "thirdArea",
        "success": "✓ İlk yüzün alanı 18 × 18 = 324 cm²’dir. Ayrıt oranı 1/3 iken alan oranı 1/9 olur. İlk alan 324 ile alınır ve ortak oran n − 1 kez çarpılır. Her küp seçimi için ilk terim ve oran yeniden belirlenmelidir.",
        "hint": "Önce en büyük küpün bir kare yüzünün alanını hesaplayınız. Sonraki küpün iki kenarının da hangi oranda değiştiğini inceleyiniz."
      },
      "reason": {
        "prompt": "Bu küp seçiminde ortak alan oranının 1/9 olmasını hangi açıklama destekler?",
        "options": [
          "Bir kare yüzün iki kenarı da 1/3 oranında değiştiğinden alan 1/3 × 1/3 oranında değişir.",
          "Üç küp seçildiği için alan oranı 1/9 olur.",
          "Küpler takımındaki bütün alan oranları her zaman 1/9’dur.",
          "Ayrıt oranı ile alan oranı aynı olduğundan alan oranı 1/9 olur."
        ],
        "answer": 0,
        "hint": "Bir yüzün alanını, karenin iki kenarının çarpımıyla ifade ediniz. Her iki kenara uygulanan değişimi ayrı ayrı dikkate alınız."
      },
      "alwaysHiddenMeasurements": {
        "areas": [
          2
        ]
      }
    },
    {
      "id": "third-area",
      "title": "Genel terimle bir yüzün alanını bulunuz",
      "sceneMode": "geo",
      "geoStep": 3,
      "geoView": "nth-area",
      "data": {
        "edges": [
          18,
          6,
          2
        ],
        "cubeNumbers": [
          9,
          3,
          1
        ],
        "areas": [
          324,
          36,
          4
        ]
      },
      "hiddenMeasurements": {
        "areas": [
          2
        ]
      },
      "final": true,
      "chip": "A₃ • Üçüncü küpün bir kare ön yüzü",
      "body": "<p>18 cm, 6 cm ve 2 cm ayrıtlı aynı üç küp büyükten küçüğe sıralıdır. Üçüncü küpün ön yüz alanı çizimde ve tabloda gizlenmiştir.</p><p>İlk alanı 324 cm² ve ortak oranı 1/9 olan geometrik dizinin genel terim kuralında n yerine 3 yazınız.</p>",
      "question": {
        "label": "İlk ön yüz alanı 324 cm² ve ortak alan oranı 1/9 olan bu geometrik küp dizisinde üçüncü sıradaki küpün bir kare ön yüzünün alanı kaç santimetrekaredir?",
        "options": [
          "4 cm²",
          "12 cm²",
          "36 cm²",
          "108 cm²"
        ],
        "answers": [
          "4 cm²"
        ],
        "numericValue": 4,
        "unit": "cm²",
        "success": "✓ A₃ = 324 × (1/9)² = 4 cm² olur. Birinci yüzden üçüncü yüze geçerken ortak oran iki kez kullanılır. Sonuç, üçüncü küpün 2 cm ayrıtıyla da kontrol edilebilir.",
        "hint": "Üs için n − 1 değerini kullanınız. Üçüncü sıraya ulaşmak için kaç kez küçültme yapılır?"
      },
      "reason": {
        "prompt": "Genel terim kuralında ortak oran neden ikinci kuvvete yükseltilir?",
        "options": [
          "Üç küp olduğu için alan üçe bölünür.",
          "Kare yüzün iki kenarı olduğu için her zaman üs 2 alınır.",
          "Birinci yüzden üçüncü yüze geçerken ortak oran iki kez kullanılır.",
          "Son küpün ayrıtı sıra numarası yerine yazılır."
        ],
        "answer": 2,
        "hint": "Birinci yüzden ikinciye ve ikinciden üçüncüye geçişleri ayrı ayrı sayınız."
      }
    }
  ]
};
 return {edges,cubeNumbers,areas,edgeRatio,areaRatio,arithmeticTerm,geometricTerm,arithmeticModule,module,appendFormula,matchesNumeric,dataFor,classify};
})();
if(typeof module!=='undefined')module.exports=SequenceActivities;
