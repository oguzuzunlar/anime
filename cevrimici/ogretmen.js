"use strict";

const api = window.F101Api;
const get = id => document.getElementById(id);
const make = (tag, text, style) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (style) node.className = style;
  return node;
};
const sessionKey = "f101-ogretmen-oturumu";
const total = lessons.reduce((sum,lesson)=>sum+lesson.rounds.reduce((count,part)=>count+part.questions.length,0),0);
let session = null;
let roster = [];
let selected = "";
let generation = 0;
let refreshingSession = null;

function status(message) { get("teacher-status").textContent = message; }

function storeSession(result) {
  session = result ? {
    access_token:result.access_token, refresh_token:result.refresh_token,
    expires_at:result.expires_at || Math.floor(Date.now()/1000) + (result.expires_in || 3600)
  } : null;
  try {
    if (session) sessionStorage.setItem(sessionKey,JSON.stringify(session));
    else sessionStorage.removeItem(sessionKey);
  } catch {}
}

async function token() {
  if (!session) throw new Error("Oturum yok.");
  if (session.expires_at > Date.now()/1000 + 30) return session.access_token;
  if (!refreshingSession) {
    const epoch = generation;
    refreshingSession = api.refresh(session.refresh_token).then(result=>{
      if (generation !== epoch) throw new Error("Oturum değişti.");
      storeSession(result);
      return session.access_token;
    }).finally(()=>{refreshingSession=null;});
  }
  return refreshingSession;
}

async function call(name, data) {
  const epoch = generation;
  const result = await api.rpc(name,data,await token());
  if (epoch !== generation) throw new Error("Oturum değişti.");
  return result;
}

function showLogin(message) {
  generation++;
  storeSession(null);
  selected="";
  roster=[];
  get("teacher-dashboard").hidden=true;
  get("teacher-login").hidden=false;
  get("share-box").hidden=true;
  get("share-url").value="";
  get("roster").replaceChildren();
  get("student-detail").replaceChildren(make("p","Detayını görmek için bir öğrenci seç."));
  status(message);
}

function showError(error, message) {
  if (!session) return;
  if (error.status===401 || error.status===403) showLogin("Oturum veya öğretmen yetkisi doğrulanamadı. Yeniden giriş yap.");
  else status(message);
}

function displayDate(value) {
  return value ? new Date(value).toLocaleString("tr-TR",{dateStyle:"short",timeStyle:"short"}) : "Henüz yanıt yok";
}

function drawRoster() {
  const filter = get("class-filter");
  const current = filter.value;
  const classes = [...new Set(roster.map(item=>item.class_label).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"tr"));
  filter.replaceChildren(new Option("Tümü",""),...classes.map(value=>new Option(value,value)));
  filter.value = classes.includes(current) ? current : "";
  const students = roster.filter(item=>!filter.value || item.class_label===filter.value);
  const list = get("roster");
  list.replaceChildren();
  if (!students.length) list.append(make("p","Henüz öğrenci bağlantısı oluşturulmadı."));
  for (const item of students) {
    const button = make("button",null,"student-row");
    button.type="button";
    button.setAttribute("aria-pressed",String(item.id===selected));
    button.append(make("strong",`${item.label}${item.class_label ? ` · ${item.class_label}` : ""}`),
      make("span",`${item.answered} / ${total} soru · ${item.correct} doğru · ${item.attempts} deneme`),
      make("span",displayDate(item.last_seen)));
    button.onclick=()=>void openStudent(item.id);
    list.append(button);
  }
}

function showShare(code, label) {
  const url=new URL("index.html", location.href);
  url.hash=`katilim=${code}`;
  get("share-url").value=url.href;
  get("share-label").textContent=`${label} için öğrenci bağlantısı`;
  get("share-box").hidden=false;
}

async function openStudent(id) {
  selected=id;
  get("share-box").hidden=true;
  get("share-url").value="";
  drawRoster();
  get("student-detail").replaceChildren(make("p","Öğrenci ilerlemesi yükleniyor…"));
  try {
    const item = await call("f101_teacher_detail",{p_student:id});
    if (selected!==id) return;
    if (!item) {
      get("student-detail").replaceChildren(make("p","Öğrenci bulunamadı."));
      return;
    }
    drawDetail(item);
  } catch (error) {
    showError(error,"Öğrenci detayları alınamadı. Sonuçları yenile.");
  }
}

function drawDetail(student) {
  const container=get("student-detail");
  const title=make("h2",`${student.label}${student.class_label ? ` · ${student.class_label}` : ""}`);
  const controls=make("div",null,"teacher-actions");
  const link=make("button","Katılım bağlantısını göster","secondary");
  const renew=make("button","Bağlantıyı yenile","secondary");
  link.onclick=()=>showShare(student.code,student.label);
  renew.onclick=async()=>{
    if (!confirm("Bu öğrencinin eski katılım bağlantısı kapanacak. Yeni bağlantı oluşturulsun mu?")) return;
    renew.disabled=true;
    try {
      const code=await call("f101_teacher_renew",{p_student:student.id});
      if (code && selected===student.id) {
        student.code=code;
        showShare(code,student.label);
        status("Yeni öğrenci bağlantısı hazır.");
      }
    } catch (error) {
      showError(error,"Öğrenci bağlantısı yenilenemedi.");
    } finally { renew.disabled=false; }
  };
  controls.append(link,renew);
  container.replaceChildren(title,controls);

  for (const lesson of lessons) {
    const items=lesson.rounds.flatMap(part=>part.questions.map(q=>({...q,title:part.title})));
    const progress=student.questions.filter(q=>q.lesson===lesson.id);
    const correct=progress.filter(q=>q.choice===0).length;
    const attempts=progress.reduce((count,q)=>count+q.times,0);
    const details=make("details",null,"lesson-progress");
    details.append(make("summary",`Ders ${lesson.id} · ${progress.length}/${items.length} yanıt · ${correct} doğru · ${attempts} deneme`));
    details.append(make("p",lesson.title,"teacher-detail-note"));
    if (!progress.length) details.append(make("p","Bu derste henüz yanıt yok.","teacher-detail-note"));
    const list=make("ol",null,"attempt-list");
    for (const row of progress) {
      const item=items[row.question];
      if (!item) continue;
      const entry=make("li");
      entry.append(
        make("strong",`${item.title} · Soru ${row.question+1}`),
        make("p",item.prompt),
        make("p",`Son yanıt ${row.choice===0 ? "doğru" : "yanlış"} · ${item.choices[row.choice]}`),
        make("p",`${row.times} deneme · ${row.wrong} yanlış · ${displayDate(row.last_seen)}`,"teacher-detail-note")
      );
      list.append(entry);
    }
    details.append(list);
    container.append(details);
  }
}

async function refreshRoster() {
  roster = await call("f101_teacher_students");
  drawRoster();
  if (selected) await openStudent(selected);
  status(`Son güncelleme ${displayDate(new Date().toISOString())}`);
}

get("teacher-login").onsubmit=async event=>{
  event.preventDefault();
  const submit=event.submitter;
  submit.disabled=true;
  try {
    storeSession(await api.login(get("teacher-email").value.trim(),get("teacher-password").value));
    get("teacher-password").value="";
    await refreshRoster();
    get("teacher-login").hidden=true;
    get("teacher-dashboard").hidden=false;
  } catch(error) {
    showLogin(error.status===403 ? "Bu hesap öğretmen listesinde bulunmuyor." : "Giriş yapılamadı. E-posta, şifre ve bağlantını kontrol et.");
  } finally { submit.disabled=false; }
};

get("teacher-refresh").onclick=async event=>{
  const button=event.currentTarget;
  button.disabled=true;
  try { await refreshRoster(); }
  catch(error) { showError(error,"Sonuçlar alınamadı. Yeniden dene."); }
  finally { button.disabled=false; }
};
get("teacher-logout").onclick=()=>{
  const current=session?.access_token;
  showLogin("Oturum kapatıldı.");
  if (current) void api.logout(current).catch(()=>{});
};
get("class-filter").onchange=drawRoster;

get("add-student").onsubmit=async event=>{
  event.preventDefault();
  const submit=event.submitter;
  submit.disabled=true;
  try {
    const item=await call("f101_teacher_create",{
      p_label:get("student-label").value.trim(),p_class:get("student-class").value.trim()
    });
    event.target.reset();
    await refreshRoster();
    await openStudent(item.id);
    showShare(item.code,item.label);
    status("Öğrenci bağlantısı hazır.");
  } catch(error) {
    showError(error,"Öğrenci bağlantısı oluşturulamadı.");
  } finally { submit.disabled=false; }
};

get("copy-link").onclick=async()=>{
  const input=get("share-url");
  try {
    await navigator.clipboard.writeText(input.value);
    status("Katılım bağlantısı kopyalandı.");
  } catch {
    input.focus(); input.select();
    status("Bağlantı seçildi. Kopyalayıp öğrenciye gönderebilirsin.");
  }
};

async function restore() {
  if (!api.enabled) {
    get("setup").hidden=false;
    return;
  }
  try { session=JSON.parse(sessionStorage.getItem(sessionKey)); } catch {}
  if (!session) { get("teacher-login").hidden=false; return; }
  try {
    await refreshRoster();
    get("teacher-dashboard").hidden=false;
  } catch {
    showLogin("Öğretmen hesabınla yeniden giriş yap.");
  }
}
void restore();
