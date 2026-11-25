# Fonksiyonlar 101 · GitHub Pages ve öğrenci takibi

Bu paket yedi dersi, mobil pekiştirme uygulamalarını, A4 PDF’leri ve öğretmen panelini içerir. GitHub Pages sayfaları yayımlar. Paylaşılan öğrenci sonuçları Supabase’de saklanır.

## 1. Supabase’i bağla

1. Supabase’de bir proje oluştur. SQL Editor’da `cevrimici/kurulum.sql` dosyasının tamamını çalıştır.
2. Authentication → Users bölümünde öğretmen hesabını e-posta ve şifreyle oluştur. Hesabın onaylandığını kontrol et.
3. Authentication → Users bölümünden öğretmen hesabının kullanıcı kimliğini (UUID) kopyala. Aşağıdaki örnekte `OGRETMEN-UUID` metnini bu kimlikle değiştirip SQL Editor’da çalıştır.

   ```sql
   insert into f101_private.teachers (user_id)
   values ('OGRETMEN-UUID'::uuid)
   on conflict do nothing;
   ```

4. Projenin Project URL ve **Publishable key** değerlerini `cevrimici/ayarlar.js` dosyasına yaz.

   ```js
   window.F101_CONFIG = {
     supabaseUrl: "https://PROJE-KIMLIGI.supabase.co",
     publishableKey: "sb_publishable_..."
   };
   ```

   Yayımlanan dosyalarda yalnızca **Publishable key** kullan. Öğretmen şifresi, secret key ve `service_role` anahtarı GitHub’a yüklenmemeli.

## 2. GitHub Pages’ı yayımla

1. ZIP’i çıkar. `index.html`, `.nojekyll` ve gördüğün klasörler dahil paketin **içeriğini** GitHub deponun köküne yükle.
2. Depoda **Settings → Pages → Build and deployment** bölümünü aç. **Deploy from a branch**, yüklediğin dal (örneğin `main`) ve **/ (root)** seçeneklerini seç.
3. GitHub’ın gösterdiği site adresini aç. Bir proje deposunda adres genellikle `https://KULLANICI.github.io/DEPO/` biçimindedir. Paket alt dizin altında da çalışır.

[GitHub Pages yayımlama ayarları](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Supabase Publishable key açıklaması](https://supabase.com/docs/guides/getting-started/api-keys)

## 3. Öğrenci bağlantısı gönder ve sonuçları gör

1. Yayımlanan ana sayfada **Öğretmen paneli** bölümüne gir. Oluşturduğun öğretmen hesabıyla oturum aç.
2. Bir öğrenci etiketi (örneğin Ö-12) ve istersen sınıf yaz. **Bağlantı oluştur** düğmesine bas. Bağlantıyı sadece ilgili öğrenciye gönder. Bağlantıya sahip kişi o öğrenci adına yanıt verebilir. Gerekirse panelden bağlantıyı yenile.
3. Öğrenci bağlantıyı açar ve herhangi bir dersin **Mobil Pekiştirme** bölümüne girer. Soruları dokunarak yanıtlar. Öğrenci için e-posta ya da şifre gerekmez.
4. Panelde **Sonuçları yenile** düğmesine bas. Öğrencinin toplam yanıt sayısı, son yanıtlarının doğru sayısı ve toplam denemesi görünür. Öğrenciyi seçerek ders bazında ve soru bazında ayrıntıyı aç.

Öğrenci bağlantısı aynı tarayıcıda hatırlanır. Bağlantı doğrulandıktan sonra internet kesilirse yanıtlar tarayıcıda sıraya alınır ve bağlantı yeniden geldiğinde gönderilir. **Öğrenciyi değiştir** düğmesi ortak cihazlarda oturumu ayırır. Misafir olarak veya çevrimiçi ayarlar boşken yapılan çalışmalar yalnızca tarayıcıda kalır. Panel sadece kimliği doğrulanmış mobil pekiştirme yanıtlarını gösterir.

Yayımladıktan sonra bir deneme öğrencisi bağlantısı oluştur. Bir soruyu yanıtla ve panelde öğrencinin ders ve soru ayrıntısında göründüğünü kontrol et.
