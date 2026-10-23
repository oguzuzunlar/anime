# Küpler Materyali 3.2.3

3.2.2 sürümü korunarak ayrı bir kopya hazırlanmıştır. Klasörü bütün dosyalarıyla çıkarıp index.html dosyasını açınız. WebGL destekli tarayıcı gerekir; kütüphaneler pakette bulunur.

Uygulama 1 ve Uygulama 2 artık dizinin türüne, ortak farkına veya ortak oranına ve n. terimin nasıl bulunacağına odaklanır. Kule yüksekliğini, yüz alanları toplamını ve kâğıt bütçesini bulma görevleri; alan terimlerini çıkararak seri toplamını türetme aşamaları ve bütün dizi toplam formülleri kaldırılmıştır. Serbest keşifteki dizi gösterimleri ve soruları da tek terim odaklıdır. Kule görünümü geometrik dizilim aracı olarak korunur; yüksekliği hesaplatılmaz.

Uygulama 1 altı aşamadan oluşur: diziyi sınıflandırma, ortak fark, genel terim, gizlenen dördüncü ayrıt, yeni ilk terimle beşinci ayrıt ve farklı ortak farkla dokuzuncu ayrıt. Uygulama 2 altı aşamadan oluşur: üç dizi türünü karşılaştırma, ayrıt dizisinin türü ve oranı, alan oranı, alanların genel terimi, farklı küp seçiminin genel terimi ve üçüncü küpün alanı.

İki uygulamadaki bütün yanıtlar seçeneklerle verilir. Uygulama 1'de üç, Uygulama 2'de dört soru ayrıca gerekçe seçimi ister. Doğru ana yanıt bu sorularda tek başına ilerlemeyi açmaz. Yanlış yanıt ipucu verir. Sorulan ölçü, çizimdeki etiketten, tablodan ve erişilebilir açıklamadan okunamaz. Aritmetik çizimde gizli sütunun yüksekliği gerçek ölçüyü temsil etmez; bu durum panelde belirtilir. Sonraki sorunun alan değeri, önceki sorunun geri bildiriminde açıklanmaz.

Özet ve puan ekranı yoktur. Son görevden Serbest Mod'a geçilir. Girişteki Öğretmen araçları bölümünden ilk yanıtları, gerekçeleri ve sonraki denemeleri içeren yerel JSON kaydı indirilebilir. Öğrenci adı istenmez; yanıtlar sunucuya gönderilmez, sayfa yenilenince sıfırlanır.

Atom Karınca ve küp yüzeyinde nokta seçme araçları korunur. Mobilde başlık ve model sabit, alt içerik kaydırılabilirdir. Matematik ifadeleri yerel MathML ile dik yazılır. Önizleme: index.html?onizleme=1. Doğrudan serbest giriş: index.html?mode=free.

Etkinlik planı ETKINLIK_PLANI.md dosyasındadır. Etkinlik verileri ve n. terim hesapları assets/sequence-activities.js; arayüz assets/app.js; oturum kaydı assets/learning-record.js; karınca yolu assets/ant-surface.js; sayı ve kök gösterimi assets/math-display.js dosyalarındadır.


Bu revizyonda karınca açınımının etiketleri büyütülmüş ve birbirinden ayrılmıştır. A/B noktaları kutulu etiket ve bağlantı çizgisiyle, yüzler numaralı bir açıklama satırıyla gösterilir. Yol uzunlukları kesin köklü değerleriyle yazılır. İrrasyonel değerlerde ayrıca ≈ işaretiyle iki ondalığa yuvarlanmış değer bulunur. Köklü kesirler yerel MathML ile gösterilir. Serbest nokta seçiminde yüzeylere 1 cm aralıklı kafes çizilir. Dokunuş en yakın kafes noktasına oturur. Klavye sürgüleri de yalnız tam santimetre değerleri alır; küp sayısı veya ayrıt değiştiğinde noktalar yeniden kafese oturur. Bu kısıtlama yalnız A/B noktaları içindir; en kısa yol kafes çizgileriyle sınırlanmaz. Uygulama 3 son aşaması aynı seçim aracını kullanır.

En kısa yol çözücüsü korunmuştur. Karşılaştırma için oluşturulan dolambaçlı yollar, açınım ve 3B yüzey üzerinde aynı ayrıt noktalarından geçirilir. Bu alternatiflerin katlanmış ve açılmış uzunlukları eşittir; parçalı yolların kesin uzunluğu gerektiğinde köklü terimlerin toplamı biçimindedir.

Kesit ve tel kafes araçları yalnız karınca modunda kaldırılmıştır. Diğer küp görünümlerinde kullanılabilir. Karınca cismi önceki tel kafes seçimine bakılmadan dolu dış yüzeylerle çizilir. assets/exact-length.js kesin uzunluk gösterimini, assets/ant-net-layout.js açınım etiketlerinin yerleşimini yönetir.

Açınımda turuncu a ve turkuaz b yardımcı dik kenarları, dik açı karesi ve c doğrusu gösterilir. Ölçü etiketleri A/B ve yüz numaralarıyla çakışmadan kutulara yerleştirilir. Yanıttan sonra ölçüler ve Pisagor bağıntısı görünür. Dolambaçlı yol seçildiğinde üçgen yalnız A–B doğrusunu açıklar; parçalı yolun uzunluğu olarak sunulmaz. Yatay veya düşey yolda yapay bir dik üçgen çizilmez.


## 3.2.3 — mobil sahne düzeni

23 Ekim 2026. Mobil model paneli ekran yüksekliğinin %46’sını kullanır; kısa/uzun ekran sınırları vardır. Üstteki iki bilgi etiketi küçültüldü ve modelin dışındaki ayrı satırlara taşındı. Kamera düğmeleri de çizim alanının altında ayrı satırdadır; dokunma hedefleri en az 44 pikseldir. Serbest karınca nokta yönergesi görünüyorsa ayrı satır kullanır. 3B motor ve kamera yeni çizim alanını ölçer; küçük küpler mobilde daha yakından kadrajlanır. Alt çalışma alanının kaydırılması korunur. Masaüstü ve önizleme yerleşimi korunur.

Bu bir görünüm revizyonudur; soru, yanıt, kafes ve en kısa yol hesapları değiştirilmedi. Test kaydı denetim_raporlari/kupler_3_2_3 klasöründedir.
