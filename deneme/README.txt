Paket: Açık Hava Tiyatrosu - İkizkenar Yamuk Simülasyonu
Standart: SCORM 1.2
Giriş dosyası: index.html
Öğrenme çıktısı: MAT.11.2.5
Revizyon: 1.2

Revizyon kapsamı:
- Tahmin maddelerindeki sonuç ipucu kaldırılmıştır.
- Simetri cevabının tahminden önce metinle açıklanması engellenmiştir.
- Düzgün çokgen köşegenleri için görselleştirme ve tamamlanma adımı eklenmiştir.
- Kısa değerlendirmenin bir girdi-çıktı değişim ilişkisi taşıması zorunlu kılınmıştır.
- Tamamlanmış oturumda yinelenen tamamlanma bildirimi engellenmiştir.
- Tamamlanma sonrasında soru seçenekleri, tasarım girdileri ve kısa değerlendirme alanı kilitlenmiştir.
- Kumaş birim fiyatı etiketi ve kısa değerlendirme yer tutucusu sadeleştirilmiştir.

Tamamlanma davranışı:
- SCO açıldığında LMSInitialize çağrılır.
- Öğrenci anlamlı öğrenme adımlarını, köşegen incelemesi dâhil, tamamladığında cmi.core.lesson_status değeri completed yapılır.
- Durum LMSCommit ile kaydedilir.
- Sayfadan ayrılırken LMSFinish çağrılır.
- Mevcut MEBİ frm3b completion:true bildirimi korunmuştur.

Kurulum:
ZIP dosyasını açmadan LMS'nin SCORM paket içe aktarma alanına yükleyin.
imsmanifest.xml ZIP kök dizinindedir.
