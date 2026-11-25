"use strict";

const get = id => document.getElementById(id);
const make = (tag,text,className) => {
  const node=document.createElement(tag);
  if (text) node.textContent=text;
  if (className) node.className=className;
  return node;
};
const lessonPath = lesson => `fonksiyonlar101-ders-${lesson.folder}`;
const questionCount = lesson => lesson.rounds.reduce((sum,part)=>sum+part.questions.length,0);
const twoDigits = value => String(value).padStart(2,"0");

const tracking = window.F101Tracking;
tracking.ready.then(student=>{
  if (document.body.dataset.page==="hub") showHub();
  else showPractice(student);
});

function showHub() {
  const total=lessons.reduce((sum,lesson)=>sum+questionCount(lesson),0);
  get("course-count").textContent=`${lessons.length} ders · Mobil uygulamalarda ${total} soru`;
  for(const lesson of lessons){
    const row=make("li",null,"lesson-entry");
    const number=make("span",twoDigits(lesson.id),"number-badge");
    number.setAttribute("aria-hidden","true");
    const details=make("div");
    const heading=make("h3",lesson.title);
    details.append(heading,make("p",lesson.description));
    const links=make("div",null,"lesson-links");
    const base=lessonPath(lesson);
    for(const [label,path,style] of [
      ["Akıllı Tahta",`${base}/navigasyon_konu_anlatim.html`,"secondary"],
      ["Çalışma Defteri",`${base}/navigasyon_defter.html`,"secondary"],
      ["Ödev Defteri",`${base}/navigasyon_odev_defteri.html`,"secondary"],
      ["Mobil Pekiştirme",`fonksiyonlar101-mobil/index.html?ders=${lesson.id}${tracking.linkFragment()}`,"primary"]
    ]){
      const link=make("a",label,style);
      link.href=path;
      link.setAttribute("aria-label",`${lesson.title} · ${label}`);
      links.append(link);
    }
    row.append(number,details,links);
    get("lesson-list").append(row);
  }
  const art=get("hero-graph");
  const model=positiveGraph([
    line(0,2,0,2),line(1,0,2,6,{c:1}),line(-1,12,6,9,{c:0})
  ],10,8,"","Üç parçadan oluşan yükselen, yatay ve azalan bir ilişki.");
  model.showEnds=true;
  new ResizeObserver(()=>drawChart(art,model,true)).observe(art);
  drawChart(art,model,true);
}

function showPractice(student){
  const chosen=Number(new URLSearchParams(location.search).get("ders"));
  const lesson=lessons.find(item=>item.id===chosen)||lessons[0];
  const storageKey=`fonksiyonlar101-pekistirme-2026-ders-${lesson.id}${student ? `-${student.id}` : ""}`;
  const questions=lesson.rounds.flatMap((part,partIndex)=>
    part.questions.map((entry,index)=>({...entry,id:`${partIndex}-${index}`,part:partIndex}))
  );
  const saved={};
  const times={};
  try {
    const previous=JSON.parse(localStorage.getItem(storageKey)||"{}");
    for (const item of questions) {
      const record=previous?.[item.id];
      if (student && typeof record?.correct==="boolean" && typeof record.answered_at==="string") {
        saved[item.id]=record.correct; times[item.id]=record.answered_at;
      } else if (!student && typeof record==="boolean") saved[item.id]=record;
    }
  } catch {}
  for (const answer of tracking.answers(lesson.id)) {
    const item=questions[answer.question];
    if (item && (!times[item.id] || Date.parse(times[item.id])<=Date.parse(answer.answered_at))) {
      saved[item.id]=answer.choice===0;
      times[item.id]=answer.answered_at;
    }
  }
  function saveProgress(){
    const values=student
      ? Object.fromEntries(Object.entries(saved).map(([id,correct])=>[id,{correct,answered_at:times[id]}]))
      : saved;
    try { localStorage.setItem(storageKey,JSON.stringify(values)); } catch {}
  }
  if (student) saveProgress();
  let queue=[], position=0, clicked=null, outcomes=[], roundTitle="";
  const canvas=get("quiz-graph");
  const view=(name)=>{
    for(const item of ["rounds","quiz","result"])get(`${item}-view`).hidden=item!==name;
  };

  document.title=`Ders ${twoDigits(lesson.id)} · Mobil Pekiştirme · Fonksiyonlar 101`;
  get("lesson-link").href=`../${lessonPath(lesson)}/index.html`;
  get("lesson-number").textContent=`DERS ${twoDigits(lesson.id)} · MOBİL PEKİŞTİRME`;
  get("lesson-title").textContent=lesson.title;
  get("lesson-description").textContent=lesson.description;
  get("overall-progress").max=questions.length;
  if (tracking.needsInvitation()) {
    get("overall-status").textContent="Sorular katılım bağlantısı doğrulandığında açılacak.";
    return;
  }

  function showRounds(){
    view("rounds");
    const attempted=questions.filter(q=>typeof saved[q.id]==="boolean");
    const right=attempted.filter(q=>saved[q.id]).length;
    get("overall-status").textContent=`${attempted.length} / ${questions.length} yanıtlandı · ${right} doğru`;
    get("overall-progress").value=attempted.length;
    get("retry-all").hidden=!attempted.some(q=>saved[q.id]===false);
    const list=get("round-list");
    list.replaceChildren();
    lesson.rounds.forEach((part,index)=>{
      const subset=questions.filter(q=>q.part===index);
      const used=subset.filter(q=>typeof saved[q.id]==="boolean").length;
      const pending=subset.filter(q=>typeof saved[q.id]!=="boolean");
      const card=make("div",null,"round");
      const outline=make("div");
      outline.append(make("h2",part.title),make("p",`${used} / ${subset.length} yanıtlandı`));
      const start=make("button",used===0?"Başla":pending.length?"Devam et":"Tekrar çöz","secondary");
      start.type="button";
      start.setAttribute("aria-label",`${part.title} · ${start.textContent}`);
      start.onclick=()=>begin(pending.length?pending:subset,part.title);
      card.append(outline,start);
      list.append(card);
    });
    window.scrollTo(0,0);
  }

  function begin(set,title){
    if(!set.length) return;
    queue=set;position=0;outcomes=[];roundTitle=title;
    view("quiz");presentQuestion();
  }

  function presentQuestion(){
    const item=queue[position];
    clicked=null;
    get("step-label").textContent=`Soru ${position+1} / ${queue.length}`;
    const bar=get("quiz-progress");
    bar.max=queue.length;bar.value=position;
    get("round-name").textContent=roundTitle;
    get("question").textContent=item.prompt;
    get("visual").hidden=!item.visual;
    if(item.visual){
      get("visual-note").textContent=item.visual.caption;
      canvas.setAttribute("aria-label",item.visual.alt||item.visual.caption);
      drawChart(canvas,item.visual);
    }
    get("feedback").hidden=true;
    const next=get("continue");
    next.hidden=true;
    next.textContent=position===queue.length-1?"Sonucu gör":"Sonraki soru";
    const buttons=get("choices");
    buttons.replaceChildren();
    const index=questions.indexOf(item);
    const correctPosition=(index*7+lesson.id+Math.floor(index/4))%item.choices.length;
    const order=[1,2,3].filter(option=>option<item.choices.length);
    if(index%2)order.reverse();
    order.splice(correctPosition,0,0);
    order.forEach((option,i)=>{
      const choice=make("button",null,"choice");
      choice.type="button";
      choice.dataset.option=option;
      choice.append(make("b","ABCD"[i]),make("span",item.choices[option]));
      choice.onclick=()=>answer(item,option);
      buttons.append(choice);
    });
    get("question").focus({preventScroll:true});
    window.scrollTo(0,0);
  }

  function answer(item,option){
    if(clicked!==null) return;
    clicked=option;
    const correct=option===0;
    saved[item.id]=correct;
    const answeredAt=new Date().toISOString();
    times[item.id]=answeredAt;
    outcomes.push({item,correct});
    saveProgress();
    tracking.record(lesson.id,questions.indexOf(item),option,answeredAt);
    for(const button of get("choices").querySelectorAll("button")){
      const id=Number(button.dataset.option);
      button.setAttribute("aria-disabled","true");
      if(id===0 || id===option){
        const right=id===0;
        button.classList.add(right?"correct":"wrong");
        const mark=make("span",right?"✓":"×","mark");
        mark.setAttribute("aria-label",right?"Doğru yanıt":"Seçilen yanlış yanıt");
        button.append(mark);
      }
    }
    const feedback=get("feedback");
    feedback.dataset.correct=String(correct);
    get("feedback-title").textContent=correct?"Doğru":`Doğru yanıt: ${item.choices[0]}`;
    get("feedback-text").textContent=item.why;
    feedback.hidden=false;
    get("continue").hidden=false;
    get("quiz-progress").value=position+1;
  }

  get("continue").onclick=()=>{
    if(clicked===null) return;
    position++;
    if(position<queue.length){presentQuestion();return;}
    view("result");
    const missed=outcomes.filter(entry=>!entry.correct).map(entry=>entry.item);
    get("result-score").textContent=`${outcomes.length-missed.length} / ${outcomes.length} doğru`;
    get("result-text").textContent=missed.length
      ? `${missed.length} soruyu açıklamalarla birlikte yeniden çözebilirsin.`
      : "Bu turdaki bütün soruları doğru yanıtladın.";
    get("retry-round").hidden=!missed.length;
    get("retry-round").onclick=()=>begin(missed,"Yanlışları yeniden çöz");
    get("result-title").focus({preventScroll:true});
    window.scrollTo(0,0);
  };
  get("retry-all").onclick=()=>begin(questions.filter(q=>saved[q.id]===false),"Yanlışları yeniden çöz");
  get("exit-quiz").onclick=showRounds;
  get("result-back").onclick=showRounds;
  new ResizeObserver(()=>{
    const item=queue[position];
    if(item?.visual && !get("quiz-view").hidden)drawChart(canvas,item.visual);
  }).observe(canvas);
  showRounds();
}

function drawChart(canvas,model,dark=false){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(!w||!h) return;
  const scale=window.devicePixelRatio||1;
  canvas.width=Math.round(w*scale); canvas.height=Math.round(h*scale);
  const ctx=canvas.getContext("2d");
  ctx.scale(scale,scale);
  const left=31,right=w-15,top=14,bottom=h-25;
  const x=v=>left+(right-left)*(v-model.minX)/(model.maxX-model.minX);
  const y=v=>bottom-(bottom-top)*(v-model.minY)/(model.maxY-model.minY);
  const gridColor=dark?"#3b5673":"#d1dfef",axisColor=dark?"#90a9c7":"#697e99";
  const colors=dark?["#8adbff","#92e8bf"]:["#185a9a","#177451"];
  const stroke=(x1,y1,x2,y2,color,width=1)=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  };
  const xAxis=y(Math.min(model.maxY,Math.max(0,model.minY)));
  const yAxis=x(Math.min(model.maxX,Math.max(0,model.minX)));
  ctx.font="11px Segoe UI, sans-serif";
  ctx.fillStyle=dark?"#cbdbef":"#3b5474";
  for(let i=0;i<=4;i++){
    const vx=model.minX+(model.maxX-model.minX)*i/4;
    const vy=model.minY+(model.maxY-model.minY)*i/4;
    stroke(x(vx),top,x(vx),bottom,gridColor);
    stroke(left,y(vy),right,y(vy),gridColor);
    ctx.textAlign="center";ctx.fillText(n(vx),x(vx),bottom+16);
    ctx.textAlign="right";ctx.fillText(n(vy),left-5,y(vy)+4);
  }
  stroke(left,xAxis,right,xAxis,axisColor,1.35);
  stroke(yAxis,top,yAxis,bottom,axisColor,1.35);
  ctx.save();
  ctx.beginPath();ctx.rect(left-5,top-5,right-left+10,bottom-top+10);ctx.clip();
  const endpoints=new Map();
  const showEnds=model.showEnds || model.lines.some(item=>item.openFrom||item.openTo);
  for(const item of model.lines){
    const color=colors[item.c||0];
    stroke(x(item.from),y(item.a*item.from+item.b),x(item.to),y(item.a*item.to+item.b),color,2.8);
    if(!showEnds)continue;
    for(const [t,open] of [[item.from,item.openFrom],[item.to,item.openTo]]){
      const z=item.a*t+item.b;
      const key=`${t}/${z}`;
      if(!endpoints.has(key)||!open)endpoints.set(key,{t,z,open,color});
    }
  }
  for(const end of endpoints.values()){
    ctx.beginPath();ctx.arc(x(end.t),y(end.z),4.2,0,2*Math.PI);
    ctx.fillStyle=end.open?(dark?"#132b46":"#eef5fc"):end.color;ctx.fill();
    if(end.open){ctx.strokeStyle=end.color;ctx.lineWidth=2;ctx.stroke();}
  }
  ctx.restore();
}
