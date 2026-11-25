"use strict";

const el = id => document.getElementById(id);
const mode = document.body.dataset.mode;
const fmt = new Intl.NumberFormat("tr-TR", {maximumFractionDigits: 3});
const clean = value => String(value).replace(/[&<>"']/g, char => (
  {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]
));
let file = location.pathname.split("/").at(-1);
if (!file) file = "index.html";
for (const link of document.querySelectorAll("nav a")) {
  if (link.getAttribute("href") === file) link.setAttribute("aria-current", "page");
}

if (mode === "portal") {
  el("course").innerHTML = course.map((title, index) => `<li>${index === 5 ? "<strong>" + clean(title) + " · Bu ders</strong>" : clean(title)}</li>`).join("");
}

if (mode === "board") setupBoard();
if (mode === "work" || mode === "homework") setupBook(mode === "homework");

function setupBoard() {
  let example = -1;
  let level = 0;
  let tool = "pen";
  let activeStroke = null;
  let capturedPointer = null;
  const viewed = new Set();
  const drawings = new Map();
  const answers = new Map();
  const drawing = el("drawing");
  const graph = el("plot");
  const probe = el("probe");
  const response = el("response");
  const expand = el("expand-board");
  const exampleNav = el("example-nav");
  const levelNav = el("level-nav");
  const boardKey = () => example * levels.length + level;
  const strokes = () => {
    const key = boardKey();
    if (!drawings.has(key)) drawings.set(key, []);
    return drawings.get(key);
  };

  exampleNav.innerHTML = examples.map((item, index) => `<button data-index="${index}">Örnek ${index + 1} · ${clean(item.title)}</button>`).join("");
  levelNav.innerHTML = levels.map((label, index) => `<button data-index="${index}">${index + 1}. Soru · ${label}</button>`).join("");

  function redraw() {
    const ctx = resizeCanvas(drawing);
    if (!ctx) return;
    const w = drawing.clientWidth, h = drawing.clientHeight;
    for (const ink of strokes()) {
      ctx.globalCompositeOperation = ink.tool === "erase" ? "destination-out" : "source-over";
      ctx.globalAlpha = ink.tool === "highlight" ? .35 : 1;
      ctx.lineWidth = ink.tool === "erase" ? 23 : ink.tool === "highlight" ? ink.width * 3 : ink.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = ink.color;
      const [first, ...remaining] = ink.path;
      ctx.beginPath();
      ctx.moveTo(first.x * w, first.y * h);
      if (!remaining.length) ctx.lineTo(first.x * w + .05, first.y * h);
      for (const p of remaining) ctx.lineTo(p.x * w, p.y * h);
      ctx.stroke();
    }
  }

  function drawPlot() {
    const chart = examples[example].chart;
    const t = Number(probe.value);
    const colors = ["#8adbff", "#92e8bf"];
    const current = chart.segments.filter(part =>
      (part.openFrom ? t > part.from : t >= part.from) &&
      (part.openTo ? t < part.to : t <= part.to)
    );
    const answer = current.map(part => `${chart.names[part.c]}: ${fmt.format(part.a * t + part.b)}`).join(" · ");
    const match = current.length === 2 && Math.abs((current[0].a-current[1].a)*t+current[0].b-current[1].b)<1e-8;
    el("probe-result").textContent = `${chart.x} ${fmt.format(t)} · ${answer}${match ? " · Değerler eşit" : ""}`;
    el("axis-input").textContent = chart.x;
    probe.setAttribute("aria-valuetext",el("probe-result").textContent);
    graph.setAttribute("aria-label",`${chart.x} ve ${chart.y} grafiği. ${el("probe-result").textContent}`);
    el("graph-key-a").textContent=chart.names[0];
    el("graph-key-b").textContent=chart.names[1];
    const ctx=resizeCanvas(graph);
    if (!ctx) return;
    const w=graph.clientWidth,h=graph.clientHeight;
    const left=44,right=w-18,top=27,bottom=h-41;
    const x=v=>left+(right-left)*v/chart.maxX;
    const y=v=>bottom-(bottom-top)*v/chart.maxY;
    const line=(x1,y1,x2,y2,color,size=1)=>{
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=size;ctx.stroke();
    };
    function dot(xValue,yValue,r,color,open=false) {
      ctx.beginPath();ctx.arc(x(xValue),y(yValue),r,0,2*Math.PI);
      ctx.fillStyle=open?"#0e192b":color;ctx.fill();
      if(open){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();}
    }
    ctx.font="12px Segoe UI, sans-serif";ctx.fillStyle="#e1edfb";
    for(let k=0;k<=5;k++){
      const tick=chart.maxX*k/5;
      line(x(tick),top,x(tick),bottom,"#2c4461");
      ctx.textAlign="center";ctx.fillText(fmt.format(tick),x(tick),bottom+17);
    }
    for(let k=0;k<=4;k++){
      const tick=chart.maxY*k/4;
      line(left,y(tick),right,y(tick),"#2c4461");
      ctx.textAlign="right";ctx.fillText(fmt.format(tick),left-7,y(tick)+4);
    }
    line(left,top,left,bottom,"#99b0ce");
    line(left,bottom,right,bottom,"#99b0ce");
    ctx.textAlign="left";ctx.fillText(chart.y,left,15);
    ctx.textAlign="right";ctx.fillText(chart.x,right,h-7);
    const endpoints=new Map();
    for(const part of chart.segments){
      line(x(part.from),y(part.a*part.from+part.b),x(part.to),y(part.a*part.to+part.b),colors[part.c],2.8);
      for(const [at,open] of [[part.from,part.openFrom],[part.to,part.openTo]]){
        const yAt=part.a*at+part.b;
        const key=`${at}/${yAt}`;
        if(!endpoints.has(key)||!open)endpoints.set(key,{at,yAt,open,color:colors[part.c]});
      }
    }
    for(const end of endpoints.values())dot(end.at,end.yAt,4,end.color,end.open);
    ctx.setLineDash([4,4]);line(x(t),top,x(t),bottom,"#ffc979");ctx.setLineDash([]);
    for(const part of current)dot(t,part.a*t+part.b,6,match?"#ffc979":colors[part.c]);
  }

  const syncExamined = () => {
    el("examined").textContent = `${viewed.size} / ${examples.length * levels.length} soru incelendi`;
  };

  function render() {
    const item = examples[example];
    const [question, hint, answer, solution] = item.questions[level];
    for (const [nav, active] of [[exampleNav, example], [levelNav, level]]) {
      nav.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", String(Number(button.dataset.index) === active)));
    }
    el("topic").textContent = item.title;
    el("rule").textContent = item.rule;
    el("context").textContent = item.note;
    el("focus-context").textContent = item.note;
    el("focus-question").textContent = question;
    el("question-title").textContent = question;
    el("difficulty").textContent = `${level + 1}. soru · ${levels[level]}`;
    el("prev").disabled = boardKey() === 0;
    el("next").disabled = boardKey() === examples.length * levels.length - 1;
    const key = boardKey();
    try { response.value = answers.get(key) ?? localStorage.getItem(`fonksiyonlar101-ders06-${key}`) ?? ""; }
    catch { response.value = answers.get(key) ?? ""; }
    el("reveals").innerHTML = [["İpucunu aç",hint],["Cevabı göster",answer],["Çözümü adım adım göster",solution]].map(([label, text], i) =>
      `<details data-reveal="${i}"><summary>${label}</summary><p>${clean(text)}</p></details>`).join("");
    for (const reveal of el("reveals").querySelectorAll("details")) {
      reveal.addEventListener("toggle", () => {
        if (reveal.open && Number(reveal.dataset.reveal) > 0) {
          viewed.add(key);
          syncExamined();
        }
      });
    }
    syncExamined();
    redraw();
    drawPlot();
  }

  function move(direction) {
    const next = boardKey() + direction;
    if (next < 0 || next >= examples.length * levels.length) return;
    setExample(Math.floor(next / levels.length));
    level = next % levels.length;
    render();
    el("question-title").focus();
  }

  function setExample(index) {
    if (index !== example) {
      probe.max = examples[index].chart.maxX;
      probe.value = 0;
    }
    example = index;
  }

  exampleNav.addEventListener("click", e => {
    const button = e.target.closest("button");
    if (!button) return;
    setExample(Number(button.dataset.index)); level = 0; render();
  });
  levelNav.addEventListener("click", e => {
    const button = e.target.closest("button");
    if (!button) return;
    level = Number(button.dataset.index); render();
  });
  el("prev").onclick = () => move(-1);
  el("next").onclick = () => move(1);
  response.addEventListener("input", () => {
    answers.set(boardKey(),response.value);
    try { localStorage.setItem(`fonksiyonlar101-ders06-${boardKey()}`,response.value); }
    catch { /* The draft is still kept for this open page. */ }
  });
  el("zoom").onclick = e => {
    const large = document.body.classList.toggle("large");
    e.currentTarget.setAttribute("aria-pressed",String(large));
  };
  if (document.fullscreenEnabled) {
    el("full").hidden = false;
    el("full").onclick = async () => {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await document.documentElement.requestFullscreen();
      } catch { el("full").textContent = "Tam ekran açılamıyor"; }
    };
    document.addEventListener("fullscreenchange", () => {
      el("full").textContent = document.fullscreenElement ? "Tam ekrandan çık" : "Tam ekran";
    });
  }
  el("lab-nav").addEventListener("click", e => {
    const button = e.target.closest("button");
    if (!button) return;
    const showGraph = button.dataset.panel === "graph";
    el("draw").hidden = showGraph;
    el("graph").hidden = !showGraph;
    el("lab-nav").querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed",String(item === button)));
    updateExpandLabel();
    if (showGraph) drawPlot();
    else redraw();
  });
  function updateExpandLabel() {
    const expanded = expand.getAttribute("aria-pressed") === "true";
    const area = el("graph").hidden ? "Çizim alanını" : "Grafiği";
    expand.textContent = expanded ? "Ders görünümüne dön" : `${area} büyüt`;
  }
  function setExpanded(expanded) {
    el("board-layout").classList.toggle("expanded",expanded);
    expand.setAttribute("aria-pressed",String(expanded));
    el("focus-problem").hidden = !expanded;
    updateExpandLabel();
    if (expanded) el("board-layout").scrollIntoView({block:"start"});
  }
  expand.onclick = () => setExpanded(expand.getAttribute("aria-pressed") !== "true");
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && expand.getAttribute("aria-pressed") === "true" && !document.fullscreenElement) {
      setExpanded(false);
      expand.focus();
    }
  });
  document.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => {
    tool = button.dataset.tool;
    document.querySelectorAll("[data-tool]").forEach(item => item.setAttribute("aria-pressed",String(item === button)));
  }));
  function position(event) {
    const box = drawing.getBoundingClientRect();
    return {x:(event.clientX-box.left)/box.width,y:(event.clientY-box.top)/box.height};
  }
  drawing.addEventListener("pointerdown", event => {
    if (event.button !== 0 || activeStroke) return;
    drawing.setPointerCapture(event.pointerId);
    capturedPointer = event.pointerId;
    activeStroke = {tool, color:el("ink").value, width:Number(el("width").value), path:[position(event)]};
    strokes().push(activeStroke);
    redraw();
  });
  drawing.addEventListener("pointermove", event => {
    if (!activeStroke || event.pointerId !== capturedPointer) return;
    activeStroke.path.push(position(event));
    redraw();
  });
  function finishStroke(event) {
    if (event.pointerId === capturedPointer) {
      activeStroke = null;
      capturedPointer = null;
    }
  }
  for (const event of ["pointerup","pointercancel","lostpointercapture"]) drawing.addEventListener(event,finishStroke);
  el("grid").onclick = event => event.currentTarget.setAttribute("aria-pressed",String(drawing.classList.toggle("grid")));
  el("undo").onclick = () => { strokes().pop(); redraw(); };
  el("clear").onclick = () => { strokes().length = 0; redraw(); };
  probe.addEventListener("input",drawPlot);
  new ResizeObserver(redraw).observe(drawing);
  new ResizeObserver(drawPlot).observe(graph);
  setExample(0);
  render();
}

function resizeCanvas(canvas) {
  if (!canvas.clientWidth || !canvas.clientHeight) return null;
  const scale = window.devicePixelRatio || 1;
  const w = Math.round(canvas.clientWidth * scale), h = Math.round(canvas.clientHeight * scale);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);
  return ctx;
}

function setupBook(isHomework) {
  const items = isHomework ? assignments : examples;
  const title = isHomework ? "Ödev Defteri" : "Çalışma Defteri";
  function renderBook() {
    const selected = el("scope").value;
    const chosen = items.map((item,index) => ({...item,index})).filter(item => selected === "all" || item.index === Number(selected));
    const filter = el("level-filter").value;
    const indices = filter === "basic" ? [0,1,2] : filter === "advanced" ? [3] : [0,1,2,3];
    const pageGroups = indices.length > 2 ? [indices.slice(0,2), indices.slice(2)] : [indices];
    const pattern = el("pattern").value;
    const withScores = isHomework && el("scores").checked;
    const withKey = el("key").checked;
    const frame = !isHomework && el("frame").checked ? " framed" : "";
    const max = chosen.length * indices.reduce((sum,index) => sum + points[index],0);
    const head = subtitle => `<header><p class="kicker">FONKSİYONLAR 101 · DERS 06 · PARÇALI MODEL KUR</p><h2>${subtitle}</h2></header>`;
    const label = (item, index) => `${item.index + 1}.${index + 1} · ${levels[index]}`;
    const pages = pageGroups.map((group, number) => `<section class="paper${frame}" aria-label="${title}, sayfa ${number + 1}">${head(title)}
      <p class="sheet-number">Öğrenci sayfası ${number + 1} / ${pageGroups.length}</p>
      <p class="meta"><span>Ad soyad __________________</span><span>Sınıf _______</span><span>Tarih _______</span></p>
      <div class="columns">${chosen.map(item => `<article><h3>Örnek ${item.index+1} · ${clean(item.title)}</h3>
      ${number === 0 ? `<p>${clean(item.note)}</p>${!isHomework ? `<p class="rule">${clean(item.rule)}</p>` : ""}` : ""}
      ${group.map(i => `<div class="exercise"><p class="label"><span>${label(item,i)}</span>${withScores ? `<span class="pts">___ / ${points[i]}</span>` : ""}</p><p>${clean(item.questions[i][0])}</p>
      <div class="answer-space ${pattern} ${i === 2 ? "graph-space" : ""}" aria-label="Çözüm alanı"></div></div>`).join("")}</article>`).join("")}</div>
      ${isHomework && number === pageGroups.length - 1 ? `<p class="paper-foot">${withScores ? `Toplam: _____ / ${max} puan · ` : ""}Öğretmen imzası __________________ · Öğrenci imzası __________________</p>` : ""}</section>`).join("");
    const key = withKey ? `<section class="paper${frame}" aria-label="Cevap anahtarı sayfası">${head(isHomework ? "Cevap Anahtarı ve Puanlama Baremi" : "Cevap Anahtarı")}
      <div class="columns">${chosen.map(item => `<article><h3>Örnek ${item.index + 1} · ${clean(item.title)}</h3>
      ${indices.map(i => `<div class="key-item"><strong>${label(item,i)}${isHomework ? ` · ${points[i]} puan` : ""}</strong><p>${clean(item.questions[i][2])}<span class="rubric">${clean(item.questions[i][3])}</span></p></div>`).join("")}</article>`).join("")}</div>
      ${isHomework ? `<p class="paper-foot">Seçili soruların toplamı: ${max} puan.</p>` : ""}</section>` : "";
    el("pages").innerHTML = pages + key;
    el("preview-status").textContent = `${pageGroups.length} A4 öğrenci sayfası${withKey ? " + 1 cevap anahtarı" : ""} · ${chosen.length * indices.length} açık uçlu soru${withScores ? ` · ${max} puan` : ""}`;
  }
  document.querySelector(".book-controls").addEventListener("change",renderBook);
  el("print").onclick = () => window.print();
  renderBook();
}
