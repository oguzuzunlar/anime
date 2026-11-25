"use strict";

(() => {
  const api = window.F101Api;
  const sessionKey = "f101-ogrenci-baglantisi";
  const box = document.getElementById("student-tracking");
  const status = document.getElementById("tracking-status");
  const retry = document.getElementById("tracking-retry");
  const exit = document.getElementById("tracking-exit");
  const invite = new URLSearchParams(location.hash.slice(1)).get("katilim");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const temporary = new Map();
  let student = null;
  let serverAnswers = [];
  let running = false;
  let storedOnDevice = false;

  const take = key => {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  };
  const put = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  const remove = key => {
    try { localStorage.removeItem(key); } catch {}
    temporary.delete(key);
  };
  const prefix = () => `f101-kuyruk-${student.id}-`;

  function pending() {
    const prefixForStudent = prefix();
    const items = new Map([...temporary].filter(([key]) => key.startsWith(prefixForStudent)));
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(prefixForStudent)) {
          const item = take(key);
          if (item && uuidPattern.test(item.id)) items.set(key, item);
        }
      }
    } catch {}
    return [...items].sort((a,b)=>Date.parse(a[1].answered_at)-Date.parse(b[1].answered_at));
  }

  function report(message, canRetry = false) {
    status.textContent = message;
    retry.hidden = !canRetry;
    exit.hidden = !student;
  }

  async function connect() {
    if (!api.enabled) return null;
    box.hidden = false;
    const stored = take(sessionKey);
    const code = invite || stored?.code;
    if (!code || !uuidPattern.test(code)) {
      report(invite ? "Bağlantı geçersiz. Öğretmeninden yeni bir katılım bağlantısı iste."
        : "Misafir modu. Takip için öğretmeninin gönderdiği katılım bağlantısını aç.");
      return null;
    }
    const normalized = code.toLowerCase();
    report("Öğrenci bağlantısı doğrulanıyor…");
    try {
      const result = await api.rpc("f101_student_state", {p_code:normalized});
      if (!result || !uuidPattern.test(result.id)) {
        if (stored?.code === normalized) remove(sessionKey);
        report("Bu katılım bağlantısı geçersiz. Öğretmeninden yeni bir bağlantı iste.");
        return null;
      }
      student = {id:result.id,label:result.label,code:normalized};
      serverAnswers = Array.isArray(result.answers) ? result.answers : [];
      storedOnDevice = put(sessionKey,student);
      if (invite && storedOnDevice) history.replaceState(null,"",location.pathname + location.search);
      report(`${student.label} · Çevrimiçi takip açık.`);
      void flush();
      return student;
    } catch {
      if (stored?.code === normalized && uuidPattern.test(stored.id)) {
        student = stored;
        storedOnDevice = true;
        report(`${student.label} · Bağlantı yok. Yanıtlar bu tarayıcıda sıraya alınır.`,true);
        return student;
      }
      report("Katılım bağlantısı doğrulanamadı. İnternet bağlantını kontrol edip yeniden dene.",true);
      return null;
    }
  }

  async function flush() {
    if (!student || running) return;
    if (!navigator.onLine) {
      report(`${student.label} · Bağlantı yok. Yanıtlar bu tarayıcıda sıraya alınır.`,true);
      return;
    }
    running = true;
    try {
      let batch = pending().slice(0,24);
      while (batch.length) {
        report(`${student.label} · Yanıtlar gönderiliyor…`);
        await api.rpc("f101_student_submit", {p_code:student.code,p_events:batch.map(([,event])=>event)});
        for (const [key] of batch) remove(key);
        batch = pending().slice(0,24);
      }
      report(`${student.label} · Yanıtlar öğretmen paneliyle eşitlendi.`);
    } catch (error) {
      const message = error.status === 403 || error.status === 401
        ? "Katılım bağlantısı artık geçerli olmayabilir. Öğretmeninden yeni bağlantı iste."
        : "Yanıtlar sırada. Bağlantı geldiğinde yeniden gönderilecek.";
      report(`${student.label} · ${message}`,true);
    } finally {
      running = false;
    }
  }

  retry.addEventListener("click",()=>{
    if (student) void flush();
    else location.reload();
  });
  exit.addEventListener("click",()=>{
    remove(sessionKey);
    location.replace(location.pathname + location.search);
  });
  window.addEventListener("online",()=>void flush());
  document.addEventListener("visibilitychange",()=>{
    if (document.visibilityState === "visible" && student && pending().length) void flush();
  });

  window.F101Tracking = Object.freeze({
    ready: connect(),
    needsInvitation: () => api.enabled && invite !== null && !student,
    linkFragment() {
      if (student) return storedOnDevice ? "" : `#katilim=${student.code}`;
      return invite ? `#katilim=${encodeURIComponent(invite.slice(0,128))}` : "";
    },
    answers(lesson) {
      if (!student) return [];
      return [...serverAnswers,...pending().map(([,event])=>event)]
        .filter(answer=>answer.lesson===lesson)
        .sort((a,b)=>Date.parse(a.answered_at)-Date.parse(b.answered_at));
    },
    record(lesson, question, choice, answeredAt) {
      if (!student) return;
      const id=crypto.randomUUID();
      const key=prefix()+id;
      const event={id,lesson,question,choice,answered_at:answeredAt};
      if (!put(key,event)) temporary.set(key,event);
      if (!navigator.onLine && temporary.has(key)) {
        report(`${student.label} · Tarayıcı depolaması kapalı. Yanıt bekliyor, sekmeyi açık tut.`,true);
        return;
      }
      void flush();
    }
  });
})();
