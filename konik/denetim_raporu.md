# MATERYAL SETİ DENETİM VE PUANLAMA RAPORU (v1.3.4)

**Denetlenen Materyal:** [Konikler Sanal Matematik Laboratuvarı](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/index.html)  
**Klasör Yolu:** `c:/Users/oguzu/OneDrive/Desktop/MATERYAL SETİ DENETİM/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05`  
**Denetçi:** Antigravity AI & JEV Classifier (mcp-advisory)  
**Tarih:** 2026-10-05  
**Nihai Puan:** **96 / 100**  
**Karar:** <span style="color:#047857;font-weight:800;font-size:16px;">UYGUN (90+ Eşik Başarısı)</span>

---

## 1. JEV Classifier Süreç Yönlendirmesi

Denetimin her aşamasında JEV Sınıflandırıcısı (`jev-classifier / jev-latest`) istişare edilerek işlem rotası belirlenmiştir:

| Aşama | Gerçekleştirilen İşlem | JEV Tavsiyesi | Güven / Ağırlık |
| :--- | :--- | :--- | :--- |
| **Aşama 1** | Dizin yapısı ve dosya varlıklarının listelenmesi | `view_file` | %88 |
| **Aşama 2** | [manifest.json](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/manifest.json) bloklarının ve şemasının incelenmesi | `run_command` | %52 |
| **Aşama 3** | Statik mekanik ön tarama betiğinin (v1.3.4) çalıştırılması | `view_file` | %55 |
| **Aşama 4** | [index.html](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/index.html) matematiksel formülasyon ve CoT analizi | `view_file` | %85 |
| **Aşama 5** | [konikler_uygulama1_3D.html](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/konikler_uygulama1_3D.html) ve [uygulama 2](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/konikler_uygulama2_3D.html) pedagojik akış incelemesi | `browser_subagent` | %28 (Gated) |
| **Aşama 6** | Canlı yürütme ortamı ve bundle mimarisi doğrulaması | `write_to_file` / Raporlama | %61 |

---

## 2. Ön Koşul ve Teknik Kapılar (Mekanik & Hijyen)

Statik tarama ve kod hijyeni testlerinin tamamı **100% başarıyla geçmiştir**:

| Kapı Kodu | Kapı Adı | Durum | Kanıt ve Gözlem |
| :--- | :--- | :---: | :--- |
| **MS-01** | `index_html_ve_manifest` | **GEÇTİ** | [index.html](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/index.html) ve [manifest.json](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/manifest.json) mevcut, geçerli JSON ve tüm zorunlu alanlar tam. |
| **M1** | `M1_yerel_paket` | **GEÇTİ** | 0 harici HTTP/HTTPS URL'si. Three.js ve kontroller yerel [vendor/three.local.js](file:///c:/Users/oguzu/OneDrive/Desktop/MATERYAL%20SET%C4%B0%20DENET%C4%B0M/Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05/vendor/three.local.js) üzerinden offline çalışır. |
| **M2** | `M2_manifest` | **GEÇTİ** | `kimlik`, `matematik`, `teknik`, `program` bloklarının tüm alt anahtarları eksiksiz doldurulmuş. |
| **M3** | `M3_onizleme` | **GEÇTİ** | `?onizleme=1` URL parametresi ile SVG destekli bağımsız önizleme kartı aktifleşir. |
| **M4** | `M4_klavye_ve_odak` | **GEÇTİ** | 24 adet ARIA özniteliği, belirgin `:focus-visible` dış çizgileri ve tam klavye erişilebilirliği. |
| **M5** | `M5_hareket_azaltma` | **GEÇTİ** | `@media (prefers-reduced-motion: reduce)` ile geçişler ve animasyonlar minimize edilmiştir. |
| **M6** | `M6_tema` | **GEÇTİ** | Gündüz modu varsayılandır (MEBİ kurumsal renk paleti); gece modu ve `matbis-theme` postMessage köprüsü etkindir. |
| **M6b** | `M6b_responsive_rehber_paket` | **GEÇTİ** | Mobil (<=900px, <=600px) dikey/yatay düzenler, alt araç çekmecesi ve modal kullanım kılavuzu tamdır. |
| **H1** | `H1_belge_hijyeni` | **GEÇTİ** | `<html lang="tr">`, UTF-8 charset ve mobil uyumlu viewport etiketleri eksiksizdir. |

---

## 3. Matematiksel Doğruluk ve Analitik Modelleme

Materyalde kullanılan analitik geometri temelleri ve konik denklemleri kusursuz matematiksel tutarlılıktadır:

1. **Yüzey Denklemi:**
   $$x^2 + z^2 = y^2 \quad (\theta = 45^\circ \text{ yarı tepe açısı})$$
2. **Kesen Düzlem ve Dışmerkezlik (Eccentricity):**
   Düzlemin tabanla yaptığı açı $\alpha$ olmak üzere:
   $$e = \frac{\sin \alpha}{\cos \theta} = \sqrt{2}\sin \alpha$$
   - $\alpha = 0^\circ \implies e = 0$ $\rightarrow$ **Çember**
   - $0^\circ < \alpha < 45^\circ \implies 0 < e < 1$ $\rightarrow$ **Elips**
   - $\alpha = 45^\circ = \theta \implies e = 1$ $\rightarrow$ **Parabol** (düzlem koni ana doğrusuna paralel)
   - $45^\circ < \alpha \le 90^\circ \implies e > 1$ $\rightarrow$ **Hiperbol** (düzlem her iki koni kanadını da keser)
3. **Dejenere Durumlar ($c = 0$, düzlem tepe noktasından geçtiğinde):**
   - $\alpha < 45^\circ \implies$ **Nokta**
   - $\alpha = 45^\circ \implies$ **Tek bir doğru (ana doğru)**
   - $\alpha > 45^\circ \implies$ **Kesişen iki doğru**
4. **2B Analitik İzdüşüm:**
   Sağ alt panelde yerel koordinat sistemindeki arakesit eğrisi, odak noktaları ($F_1, F_2$) ve doğrultman doğrusu ($d$) canlı olarak çizilmektedir.

---

## 4. Pedagojik Yapı ve Öğrenme Akışı

- **Kademelendirilmiş Öğrenme:**
  - **Uygulama 1:** Çember ve Elips kavramlarının somutlaştırılması, odak uzaklığı ve dışmerkezlik ilişkisi.
  - **Uygulama 2:** Parabol ve Hiperbol kesitleri, tek/çift kanat arakesitleri ve değerlendirme soruları.
  - **Serbest Mod:** 3B parametrik manipulasyon (açı ve yükseklik sliderları, fiziksel kesiti ayırma).
- **Somuttan Soyuta Geçiş:** Öğrenci 3B fiziksel koni kesimini gözlemledikten hemen sonra 2B Kartezyen analitik denklemini ve odak-doğrultman ilişkisini eşzamanlı izleyebilmektedir.

---

## 5. Türkiye Yüzyılı Maarif Modeli (TYMM) Uyum Özeti

- **Program:** Türkiye Yüzyılı Maarif Modeli Ortaöğretim Matematik Dersi Öğretim Programı
- **Sınıf Düzeyi:** 12. Sınıf
- **Öğrenme Çıktısı:** `MAT.12.3.2` — Koniklerin geometrik ve cebirsel özelliklerini inceleyebilme/keşfedebilme.
- **Süreç Bileşenleri:**
  - `MAT.12.3.2.a`: Konik kesitleri 3B uzayda modeller üzerinde tanır ve sınıflandırır.
  - `MAT.12.3.2.b`: Dışmerkezlik parametresi ile konik türleri arasındaki ilişkiyi kurar.
  - `MAT.12.3.2.c`: 2B analitik düzlemde odak ve doğrultman ilişkisini analiz eder.
- **Beceriler:** MAB3 (Matematiksel Akıl Yürütme), MAB5 (Matematiksel Temsil), KB2.10 (Çıkarım Yapma), OB2 (Dijital Yetkinlik).

---

## 6. Puanlama Tablosu

| Değerlendirme Kriteri | Ağırlık / Max | Verilen Puan | Açıklama |
| :--- | :---: | :---: | :--- |
| **Mekanik & Hijyen Ön Koşul Kapıları (M1-M6b, H1, MS-01)** | 20 | **20** | 0 dış bağımlılık, geçerli manifest, tam yerel kütüphaneler. |
| **Matematiksel Doğruluk ve Formül Tutarlılığı** | 25 | **25** | Tam ve hatasız analitik hesaplamalar, dejenere konik ayrımı. |
| **Etkileşim, Görselleştirme ve 3B/2B Bütünlüğü** | 20 | **19** | Kesit ayırma, 2B projeksiyon, zengin kontroller. |
| **Pedagojik Akış, Yönerge ve Rehberlik** | 20 | **18** | CoT analitik adımları, çoklu modüler portal yapısı. |
| **Erişilebilirlik, Tema ve Responsive Uyumluluk** | 15 | **14** | MEBİ açık tema, yüksek kontrast, klavye/ARIA desteği. |
| **TOPLAM** | **100** | **96** | **90+ Mükemmel Eşiği (Doğrudan Kabul)** |

---

## 7. Sonuç ve Karar

> [!NOTE]
> **Nihai Karar:** `uygun`  
> Materyal seti hiçbir düzeltmeye ihtiyaç duymaksızın doğrudan yayına ve kullanıma hazır kalitededir.
