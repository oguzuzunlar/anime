# Katı Silindirin Hacmi Materyali — ilk sürüm, 1.3.12

23 Ekim 2026. Giriş: `index.html`. Vitrin: `index.html?onizleme=1`.

Paket içindeki `lib/` ve `assets/` klasörlerini giriş dosyasıyla birlikte tutunuz. Harici CDN veya çalışma verisi gerekmez. MathJax 3.2.2, yerel WOFF yazı tipleri ve Three.js paket içindedir. Sunucuda klasörü bütün olarak yayımlayınız; bu revizyon kendi başına yayına gönderilmemiştir.

Fiziksel kaynak: MEB Ortaöğretim Genel Müdürlüğü, *Lise Matematik Materyal Seti*, Ankara 2022, Katı Silindir, s. 221–228. Kaynak kılavuz paket içindeki `silindir materyali.pdf` dosyasıdır. Kılavuzun fiziksel materyal fikri dijital ortama uyarlanmıştır; kılavuzun kendisinin TYMM uyarlı olduğu ileri sürülmez.

## Öğretmen için kullanım

Tanıtımda renkleri ve bütün içindeki dilim paylarını karşılaştırınız. Uygulama 1’de dilim paylarını, ortak oranı ve kısmi toplamları karşılaştırınız. Uygulama 2'de taşıma öncesi/sonrası üst yüzeylerin toplam alanını karşılaştırınız. Dilim sayısını artırmak dairenin gerçek alanını değiştirmez. Sonlu düzenin üst yüzeyi tam bir dikdörtgen değildir; limitte kenarları πR ve R olan dikdörtgene yaklaşır. Buradaki R yarıçaptır; silindir yüksekliği h ayrıdır.

Sorular kısa kavram kontrolüdür. Kontrol Et veya İleri ile gönderilen yanıt, doğru/yanlış açıklaması ve bölüm sonucu aynı seçime bağlı kalır. Kontrol sonrası seçenekler kilitlenir; Geri ile açıklamalar incelenebilir. Yeni sayfa oturumu soruları sıfırlar. Öğrenci ilerlemesi için kalıcı kayıt vaat edilmez. Serbest modda parça ekleme/çıkarma, ayırma/birleştirme, yarıçap/yükseklik değişimi ve hacim ölçümleri kullanılabilir.

## Program eşleştirmesinin kapsamı

Resmî TYMM web metinleri 21 Ekim 2026 tarihinde yeniden incelendi. Eşleştirme 12. sınıf içindir ve **kısmi destektir**; bir öğrenme çıktısının bütün süreçlerinin bu tek materyalle karşılandığı söylenmez.

| Süreç | Materyaldeki öğrenci eylemi |
|---|---|
| MAT.12.1.1.a–c | Ardışık dilim paylarını karşılaştırma, ortak çarpanı bulma, altıncı terimi hesaplama |
| MAT.12.3.3.a–c | Serbest modda yarıçap ve yüksekliği değiştirme; doluluk, merkez açı ve hacmi birlikte yorumlama; üst yüzeyin alanını temsil etme |

Geometrik diziye ilişkin aritmetik dizi karşılaştırması, bütün ispat süreçleri ve geometrik cisimlerin genel problem çözme döngüsü bu materyalin kapsamı değildir. Sonsuz seri/limit, görsel zenginleştirme olarak tutulur.

Kaynaklar: [Diziler — MAT.12.1.1](https://tymm.meb.gov.tr/matematik-dersi/unite/305), [Geometrik cisimler — MAT.12.3.3](https://tymm.meb.gov.tr/matematik-dersi/unite/329). Alan becerileri MAB1, MAB3 ve MAB5 ile sınırlanmıştır. Önceki manifestteki hatalı 10.4.1, 11.3.1 ve 12.3.2 eşleştirmeleri düzeltilmiştir.

## Bu revizyondaki değişiklikler

Küçük önizlemelerde taşma; model kadrajı; dar ekranda yinelenen kamera yönergesinin etiketle örtüşmesi; koyu tema başlık kontrastı; matematikli şık ve sürgü adları; küçük dokunma hedefleri; kontrolden sonra değişebilen cevap/puan tutarsızlığı düzeltildi. Beşinci sorunun kalan payı 1/k ile açıkça yazıldı. Formül aralıkları, MathJax kesirleri, tek parça soru zemini, iki uygulama ve serbest mod korundu. Yeni uygulama veya yeni puanlama sistemi eklenmedi.

Gizli sayfa/çizim alanında çizim döngüsü durur. Bölümden çıkınca taşıma durur. Hareket azaltma tercihi etkinleştiğinde otomatik hareket durdurulur; açılışta kendiliğinden hareket yoktur. Öğrenci isterse hareketi kendisi başlatabilir. Sahne yenilenirken eski çizim kaynakları serbest bırakılır.

Bağımsız tema tercihi depolama kullanılamadığında da çalışır. Site iframe temasında yalnız aynı HTTP(S) origin ve üst pencereden gelen geçerli `matbis-theme` mesajları kabul edilir; `file://` kaynaklı belirsiz origin güvenilir sayılmaz. Hazır mesajı sahne kurulduktan sonra gönderilir.

Kural paketi 2026.10.07-r1 sayısal ağırlıklandırma tanımlamaz. Bu dosya 90 üzeri puan veya kurumsal kabul belgesi değildir; yeniden test kayıtları uygulamanın dışındaki `denetim_raporlari/silindir_ilk_surum_iyilestirme_2026-10-17/` klasöründedir.

1.3.1: Kalan boşluğa sığmayan dilim için tarayıcı alert penceresi yerine sayfa içi, açık/koyu temaya uyumlu uyarı iletişim kutusu gösterilir. Tamam veya Escape ile kapanır; ekleme düğmesine odak geri döner. Uygun olmayan parça modele eklenmez.

1.3.2: Kullanıcı ekran görüntülerindeki işaretlere göre tanıtım penceresindeki kaynak paragrafı, “Dizi ile seriyi birbirine karıştırmayın.” cümlesi, “İlişkiyi açıklayın” alanı ve “Alanı karşılaştırın” alanı kaldırıldı. Kaynak bilgisi bu dosya ve manifestte korundu. Düğmenin başlangıç ve yeniden başlatma adı “Parçaları otomatik taşı” oldu; çalışırken “Duraklat” gösterilir. Program kapsamı artık kaldırılan ek istemlere dayanan öğrenci eylemlerini iddia etmez.

1.3.3: MathJax değişkenleri, alt/üst indisleri ve dinamik açıklamalar dahil tüm matematiksel karakterler dik dizilir. CSS font-style zorlamasının yanında MathJax çiziminden önce normal/bold matematik varyantı uygulanır.

1.3.4: Beş dizi sorusu silindir dilimlerinin tam silindire göre hacim payları ve yarım silindiri tamamlama bağlamında; dört alan sorusu taşınan silindir parçalarının üst yüzeyleri bağlamında yeniden yazıldı. Cevap açıklamaları ve ekran okuyucu soru adları aynı bağlamla eşleştirildi. Son alan sorusu alan korunumu tekrarından çıkarılıp sonlu parçaların üst yüzeyinin tam dikdörtgen olup olmadığını sorar; doğru cevabı Hayır’dır. Soru sayısı 5+4 olarak kalır. Dik MathJax dizgisi korunur.

1.3.5: Bölüm seçicileri ayrı kenarlıklı ve belirgin düğmeler oldu; dar ekranda iki sütun kullanır. Adım başlıkları doğal satır akışına alındı. Açı ve hacim payı eşitlikleri ayrı satırlara, uzun eşitliklerin sonuç/limit parçaları gerektiğinde alt satıra geçecek biçimde düzenlendi. Mobilde ileri–geri düğmeleri tam genişlikte alt alta yerleşir. Dik MathJax dizgisi ve silindir bağlamındaki dokuz soru korunur.

1.3.6: Atlanan 1/16 kırmızı dilim adımı eklendi. Sıra 1/4 → 1/8 → 1/16 → 1/32 → dizi/seri karşılaştırması → sorular biçimindedir. Her karşılaştırmada bir önceki dilimin iki yeni dilime eşitliği açı ve hacim payıyla gösterilir. Üç ana renk kullanılır: mavi #004DFF, sarı #FFFF00, kırmızı #FF0000. 1/32 küçük dilimler yeniden mavi, 1/64 dilimler sarıdır; renk tek başına payın kimliği değildir. Serbest mod düğmeleri, tanıtım ve soru metinleri yeni renklerle eşleşir. Sarı düğmede koyu metin kullanılır.

1.3.7: Renk tekrarları kaldırıldı. 1/4 mavi, 1/8 sarı, 1/16 kırmızı, 1/32 turkuaz ve 1/64 mor renktedir. Uygulama 1 aynı tam silindir çerçevesinde büyüyen bir birleşim gösterir. Her aşamada bir yeni dilim önceki parçaların yanına eklenir; payı ve merkez açısı öncekinin yarısıdır. Önceki dilimler yerlerini korur. İleri düğmesinde yeni parça kısa bir hareketle yerleşir; hareket azaltma tercihinde doğrudan yerinde görünür. Soru bölümünde beş dilim bir arada kalır ve ilgili parçalar çizgileriyle vurgulanır. Bu örüntünün toplamı yarım silindire yaklaşır; model tam silindiri doldurmuş gibi sunulmaz.

1.3.8: Serbest Mod → Uygulama 2 → Serbest Mod dönüşünde kurulan modelin sıfırlanması giderildi. Parça sırası, yarıçap, yükseklik, ayırma, rehber/zemin görünürlüğü ve ölçüm tercihi oturum içinde korunur. Uygulama 1 adımı ve Uygulama 2 taşıma ilerlemesi de bölüm dönüşünde korunur. Sıfırlama yalnız Temizle düğmesi veya yeni sayfa oturumuyla yapılır. Yönergelerde resmî çoğul emir biçimleri kullanılır. Son sürüm puansız yeniden denetlenir; yapılmayan gerçek cihaz/Safari ve hedef portal testleri geçmiş gösterilmez.


## Son teslim 1.3.8

- Tam çalışma: `index.html`
- Canlı önizleme: `index.html?onizleme=1`
- Kare kapak: `assets/kapak-kare.png`, 720×720 piksel
- Yatay kapak: `assets/kapak-yatay.png`, 960×600 piksel
- Yerel bağımlılık lisansları: `lib/LISANSLAR.md`, `lib/three-LICENSE.txt`, `lib/mathjax-LICENSE.txt`
- Test ve puansız denetim kayıtları uygulama klasörü dışındaki `denetim_raporlari/silindir_1_3_8/` içindedir.

Kapaklar gerçek çalışan önizlemeden, aynı geometri kullanılarak alınmıştır. Portal ekibi son kart oranına göre kare veya 8:5 seçeneğini doğrular. Paket bağımsız çalışma girişiyle teslim edilir; yayımlanmış web adresi üretici tesliminin önkoşulu değildir. Dosyaya çift tıklama ile çalışacağına ilişkin ayrı bir test/garanti verilmemektedir.

Bu etkinlikte sorular, model ve açıklamalarla kavram pekiştirme amacı taşır. Bağımsız sınav veya bütün öğrenme çıktılarının ölçümü olarak sunulmaz. Program ilişkilendirmesi kısmi kapsam içindir; son alan editörü onayının yerine geçmez. Sonsuz seri ve limit görsel zenginleştirmedir.

Fiziksel kılavuzda üç parça boyutu bulunur. Dijital uyarlamada 1/32 turkuaz dilim de kullanılabildiğinden serbest moddaki dört rengin tamamını içeren tam silindirin en az 7, en çok 21 parçalı inşası matematiksel olarak yeniden hesaplanmıştır; kılavuzdaki üç renkli 6 ve 12 parçalı durumla aynı görev değildir. Uygulama 1'deki 1/64 mor dilim, örüntüyü genişletmek içindir.

Pi içeren ondalık hacimler ≈ işaretiyle gösterilir. Açık/koyu temada zemin ızgarası ortak palete göre güncellenir. Öğrenci verisi sunucuya gönderilmez. Sayfa yeniden yüklendiğinde yeni oturum başlar; bölüm değiştirmek modeli veya yanıtları silmez.


## 1.3.9 — 23 Ekim 2026 ekran görüntüsü geri bildirimleri

Üst yüzey sorusunun geri bildirimindeki “R, silindirin yüksekliği değildir.” cümlesi kaldırıldı. Beşinci hacim payı sorusunun üstündeki “Bu soruda birleştirilmiş beş dilimi dikkate alınız.” notu kaldırıldı; boş not paneli de gizlenir. Diğer sorulara dönüldüğünde gerekli notlar yeniden görünür.

Uygulama 2'nin başlangıç başlığı ve yönergesi, alanın korunduğunu ve dikdörtgene yaklaşmayı önceden söylemek yerine dilim taşıma ve farklı dilim sayılarındaki şekilleri karşılaştırma görevi verir. Aynı yaklaşım açılış yardımındaki Uygulama 2 tanımına uygulanmıştır. Sonucu açıklayan soru geri bildirimleri yanıt kontrolünden sonra gösterilmeye devam eder.

Bu revizyon önceki denetimin insan onayı veya gerçek cihaz/yayın testleri yerine geçmez. Bu değişikliklere ait kontroller `denetim_raporlari/silindir_1_3_9/` klasöründedir. Tam giriş `index.html`, önizleme `index.html?onizleme=1`.


## 1.3.10 — formülden önce yönlendirmeli keşif

Birinci kavrama sorusunun üstündeki mavi, sarı ve kırmızı dilim yönergesi kaldırıldı; boş panel gizlenir.

Uygulama 1'in beşinci adımındaki hazır iki formül ve sonucu önceden açıklayan paragraf kaldırıldı. Öğrenci aynı silindirde bir ile beş dilim arasındaki birleşimleri sürgüyle karşılaştırır. Tabloda gözlenen dilimin payı ve birleşen dilimlerin toplam payı gösterilir. Dört çoktan seçmeli tahmin sırasıyla altıncı dilimi, n. dilime kadar kaç kez yarıya inildiğini, toplamın yaklaştığı payı ve yarım silindirde kalan boşluğun son dilimle ilişkisini araştırır. Son aşamada boşluk payı tabloya eklenir.

Yanlış tahminde kural açıklanmaz; model/sayısal örnek için yönlendirme ve yeniden deneme verilir. Doğru yanıttan sonra ilgili kural sembolleştirilir. Bütün keşiflerden sonra genel terim ve bu örüntünün toplam kuralı birlikte gösterilir. Rastgele ortak çarpan için hazır genel seri formülü kaldırıldı. Dört keşif tamamlanınca mevcut beş kavrama sorusuna geçilir. Bu, yönlendirmeli keşiftir; bağımsız ispat ya da açık uçlu kural üretimi olarak sunulmaz. Toplam payın yarım silindire yaklaşması, tek dilimin payının sıfıra yaklaşmasından ayrılır.

Keşif aşaması, doğrulanan tahminler ve sürgüdeki dilim sayısı açık oturumda bölüm dönüşlerinde korunur. Yanlış tahminler düzeltilebilir; doğrulanan yanıt yeniden değişmez. Yeni sayfa oturumu bütün etkinliği sıfırlar. Test kayıtları `denetim_raporlari/silindir_1_3_10/` içindedir. Önceki denetimde açık kalan gerçek cihaz, ağ, son yayın ortamı ve insan onayı bu revizyonla tamamlanmış sayılmaz.


## 1.3.11 — kontrol paneli göster/gizle düğmesi kaldırıldı

23 Ekim 2026. Panelin kenarındaki ok düğmesi, paneli daraltma işlevi ve bunların kullanılmayan stilleri kaldırıldı. Tam çalışma görünümünde kontrol paneli sürekli görünürdür. Mobil sıralama ve kaydırma ile sade önizlemede panelin gizlenmesi korunur. Önceki yönlendirmeli keşif etkinliği değişmedi. Test kaydı `denetim_raporlari/silindir_1_3_11/` içindedir.


## 1.3.12 — mobil tanıtım paneli başlıktan açılır

23 Ekim 2026. Açılış odağının en alttaki İncelemeye Başla düğmesini görünür kılmak için paneli aşağı kaydırması giderildi. Panel her açılışta en üste döner; ilk odak kaydırma yapmadan İncelemeye Başlarken başlığına verilir. Başlık ikinci düzey başlık olarak tanımlandı; Tab/Shift+Tab döngüsü ve Escape ile kapatma korunur. Mobil panel yüksekliği değişken tarayıcı yüksekliğine de uyarlanır. Metnin devamı ve başlangıç düğmesi panel içinde kaydırılarak erişilebilir. Kontroller `denetim_raporlari/silindir_1_3_12/` içindedir.
