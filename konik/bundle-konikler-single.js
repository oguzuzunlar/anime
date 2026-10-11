const fs = require('fs');
const path = require('path');

const workspace = process.cwd();
const sourceDir = path.join(workspace, 'Konikler_3B_Materyali_90_Plus_YEDEK_2026-10-05');
const outputFile = path.join(workspace, 'Konikler_3B_Materyali_90_Plus', 'index.html');

function read(name) {
  return fs.readFileSync(path.join(sourceDir, name), 'utf8');
}

function replaceRequired(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Beklenen parça bulunamadı (${label}): ${search}`);
  }
  return source.split(search).join(replacement);
}

function preparePage(source) {
  return replaceRequired(
    source,
    '<script src="vendor/three.local.js"></script>',
    '<script>window.THREE = parent.__KONIK_THREE__; window.OrbitControlsModule = parent.__KONIK_ORBIT_CONTROLS__; window.TransformControlsModule = parent.__KONIK_TRANSFORM_CONTROLS__; window.CSS2DModule = parent.__KONIK_CSS2D__;</script>',
    'yerel Three.js bağlantısı',
  );
}

let home = preparePage(read('index.html'));
let app1 = preparePage(read('konikler_uygulama1_3D.html'));
let app2 = preparePage(read('konikler_uygulama2_3D.html'));
const three = read(path.join('vendor', 'three.local.js'));

home = replaceRequired(
  home,
  "if(new URLSearchParams(location.search).get('mode')==='free'||location.hash==='#serbest'){",
  "if(parent.KonikRouter.entryMode==='free'||location.hash==='#serbest'){",
  'serbest mod giriş denetimi',
);
home = replaceRequired(home, "onclick=\"location.href='konikler_uygulama1_3D.html'\"", "onclick=\"parent.KonikRouter.go('app1')\"", 'ana sayfa uygulama 1 düğmesi');
home = replaceRequired(home, "onclick=\"location.href='konikler_uygulama2_3D.html'\"", "onclick=\"parent.KonikRouter.go('app2')\"", 'ana sayfa uygulama 2 düğmesi');
home = replaceRequired(home, 'href="konikler_uygulama1_3D.html"', 'href="#" onclick="parent.KonikRouter.go(\'app1\'); return false;"', 'ana sayfa uygulama 1 bağlantısı');
home = replaceRequired(home, 'href="konikler_uygulama2_3D.html"', 'href="#" onclick="parent.KonikRouter.go(\'app2\'); return false;"', 'ana sayfa uygulama 2 bağlantısı');

app1 = replaceRequired(app1, "location.href='konikler_uygulama2_3D.html'", "parent.KonikRouter.go('app2')", 'uygulama 1 uygulama 2 yönlendirmesi');
app1 = replaceRequired(app1, "location.href='konikler_materyali_3D.html?mode=free'", "parent.KonikRouter.go('home', '?mode=free')", 'uygulama 1 serbest mod yönlendirmesi');
app1 = replaceRequired(app1, "location.href='konikler_materyali_3D.html'", "parent.KonikRouter.go('home')", 'uygulama 1 ana sayfa yönlendirmesi');

app2 = replaceRequired(app2, "location.href='konikler_uygulama1_3D.html'", "parent.KonikRouter.go('app1')", 'uygulama 2 uygulama 1 yönlendirmesi');
app2 = replaceRequired(app2, "location.href='index.html?mode=free'", "parent.KonikRouter.go('home', '?mode=free')", 'uygulama 2 sonuç serbest mod yönlendirmesi');
app2 = replaceRequired(app2, "location.href='konikler_materyali_3D.html?mode=free'", "parent.KonikRouter.go('home', '?mode=free')", 'uygulama 2 serbest mod yönlendirmesi');
app2 = replaceRequired(app2, "location.href='konikler_materyali_3D.html'", "parent.KonikRouter.go('home')", 'uygulama 2 ana sayfa yönlendirmesi');

for (const [name, page] of Object.entries({ home, app1, app2 })) {
  if (/vendor\/three\.local\.js|konikler_uygulama[12]_3D\.html|konikler_materyali_3D\.html|location\.href='index\.html/.test(page)) {
    throw new Error(`${name} içinde çözülmemiş dış dosya bağlantısı kaldı.`);
  }
}

const encode = (value) => Buffer.from(value, 'utf8').toString('base64');
const pages = {
  home: encode(home),
  app1: encode(app1),
  app2: encode(app2),
};

const output = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Konikler için çevrimdışı çalışan tek dosyalı 3B etkileşimli matematik materyali">
<title>Konikler Sanal Matematik Laboratuvarı</title>
<style>
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#eef3fb}
#konikler-app{display:block;width:100%;height:100%;border:0;background:#eef3fb}
#bundle-error{display:none;position:fixed;inset:0;place-items:center;padding:24px;font:600 18px/1.5 "Segoe UI",sans-serif;color:#10213d;background:#eef3fb;text-align:center}
#bundle-error.on{display:grid}
</style>
<script>
${three}
</script>
</head>
<body>
<iframe id="konikler-app" title="Konikler Sanal Matematik Laboratuvarı"></iframe>
<div id="bundle-error" role="alert"></div>
<script>
window.__KONIK_THREE__ = THREE;
window.__KONIK_ORBIT_CONTROLS__ = OrbitControlsModule;
window.__KONIK_TRANSFORM_CONTROLS__ = TransformControlsModule;
window.__KONIK_CSS2D__ = CSS2DModule;
(function(){
  const encodedPages = Object.freeze(${JSON.stringify(pages)});
  const titles = Object.freeze({
    home: 'Konikler Sanal Matematik Laboratuvarı',
    app1: 'Uygulama 1 – Çember ve Elips',
    app2: 'Uygulama 2 – Parabol ve Hiperbol'
  });
  const frame = document.getElementById('konikler-app');
  const errorBox = document.getElementById('bundle-error');

  function decodeUtf8(base64){
    const bytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  }

  window.KonikRouter = {
    entryMode: '',
    current: 'home',
    go(page, query){
      if(!encodedPages[page]) return;
      this.entryMode = page === 'home' && String(query || '').includes('mode=free') ? 'free' : '';
      this.current = page;
      document.title = titles[page];
      errorBox.classList.remove('on');
      try {
        frame.srcdoc = decodeUtf8(encodedPages[page]);
      } catch (error) {
        errorBox.textContent = 'Materyal bölümü açılamadı: ' + error.message;
        errorBox.classList.add('on');
      }
    }
  };

  window.KonikRouter.go('home');
})();
</script>
</body>
</html>`;

fs.writeFileSync(outputFile, output, 'utf8');
console.log(outputFile);
console.log(`${fs.statSync(outputFile).size} bayt`);
