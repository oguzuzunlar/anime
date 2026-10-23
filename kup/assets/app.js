



/* ═══════════════════════════════════════════════════════════════════════════
   1. GÜVENLİ TEMA SİSTEMİ (Bölüm 5: matbis-theme protokolü + durum koruma)
═══════════════════════════════════════════════════════════════════════════ */
const STORAGE_KEY = 'matbis_ic_ice_kupler_theme';
let currentTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
let siteManagedTheme = false;
const isDarkTheme = () => currentTheme === 'dark';
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ═══════════════════════════════════════════════════════════════════════════
   2. THREE.JS SAHNE, KAMERA, RENDERER VE KESİT DÜZLEMİ (CLIPPING)
═══════════════════════════════════════════════════════════════════════════ */
const canvas = document.getElementById('three-canvas');
const wrap = document.getElementById('canvas-wrap');
const sceneStage = document.getElementById('scene-stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
// 7 Ekim 2026 paleti Materyal Çizim Zemini: Açık #F4F6F9, Koyu #151C28
const initialSceneHex = isDarkTheme() ? 0x151C28 : 0xF4F6F9;
scene.background = new THREE.Color(initialSceneHex);
scene.fog = new THREE.Fog(initialSceneHex, 110, 240);

const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 500);
camera.position.set(42, 32, 58);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = false;
controls.dampingFactor = 0.08;
controls.minDistance = 16;
controls.maxDistance = 175;
controls.target.set(0, 7, 0);

// Işıklandırma
scene.add(new THREE.AmbientLight(0xffffff, 1.35));

const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.85);
dirLight.position.set(45, 75, 50);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
fillLight.position.set(-45, 25, -40);
scene.add(fillLight);

// Zemin ve Izgara
let gridHelper = null;
function rebuildGridForTheme() {
  if (gridHelper) {
    scene.remove(gridHelper);
    gridHelper.geometry.dispose();
  }
  gridHelper = new THREE.GridHelper(
    140,
    28,
    isDarkTheme() ? 0x7183A6 : 0x7182A4,
    isDarkTheme() ? 0x2C3D61 : 0xDCE4F4
  );
  gridHelper.position.y = -0.05;
  scene.add(gridHelper);
}
rebuildGridForTheme();

// İç Kesit Düzlemi (İç içe geçen açık küplerin iç tabanlarını ve duvarlarını görmek için z=0 kesiti)
const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
let clippingActive = false;
let wireframeOn = false;

/* ═══════════════════════════════════════════════════════════════════════════
   3. PROSEDÜREL DOKU VE ÜSTÜ AÇIK İÇ İÇE KÜP GEOMETRİSİ (Kılavuz Sayfa 1-2)
═══════════════════════════════════════════════════════════════════════════ */
function makeCompositeWoodTexture(w = 256, h = 256, seed = 1) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#d8dee9';
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 3) {
    const alpha = 0.03 + ((y * seed) % 7) * 0.008;
    ctx.fillStyle = `rgba(30, 41, 59, ${alpha})`;
    ctx.fillRect(0, y, w, 1.5);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
const surfaceTexture = makeCompositeWoodTexture(256, 256, 2);

// 10 Küp İçin Anlamlı Matematiksel Renk Dizisi (Tema değişiminde anlamını korur)
const CUBE_PALETTE = [
  0x2563eb, // #1 Mavi
  0x0d9488, // #2 Turkuaz
  0xd97706, // #3 Kehribar
  0x7c3aed, // #4 Mor
  0xdc2626, // #5 Kırmızı
  0x059669, // #6 Zümrüt
  0x4f46e5, // #7 İndigo
  0xea580c, // #8 Turuncu
  0x0284c7, // #9 Gök Mavisi
  0x9333ea  // #10 Eflatun
];

const stageGroup = new THREE.Group();
scene.add(stageGroup);
let allStageMeshes = [];

/**
 * Kılavuz Sayfa 1 ve 2'deki gibi üst yüzü açık, iç tabanında küçük merkez çıkıntısı olan
 * 5 yüzlü içi boş küp (open-top hollow cube) üretir.
 */
function createOpenHollowCube(edgeCm, colorHex, isUpsideDown = false) {
  const group = new THREE.Group();
  const s = Math.max(1.2, edgeCm);
  const wall = Math.max(0.24, Math.min(0.55, s * 0.055));

  const mat = new THREE.MeshStandardMaterial({
    map: null,
    color: colorHex,
    roughness: 0.48,
    metalness: 0.08,
    wireframe: wireframeOn,
    clippingPlanes: clippingActive ? [clipPlane] : [],
    clipShadows: true,
    side: THREE.DoubleSide
  });

  const edgeLineMat = new THREE.LineBasicMaterial({
    color: isDarkTheme() ? 0xEDF3FF : 0x142448,
    transparent: true,
    opacity: 0.42
  });

  function addBoxWall(w, h, d, x, y, z) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    allStageMeshes.push(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, edgeLineMat);
    line.position.set(x, y, z);
    group.add(line);
  }

  const half = s / 2;
  // Taban
  addBoxWall(s, wall, s, 0, wall / 2, 0);
  // Ön ve Arka duvarlar
  addBoxWall(s, s - wall, wall, 0, (s + wall) / 2, half - wall / 2);
  addBoxWall(s, s - wall, wall, 0, (s + wall) / 2, -half + wall / 2);
  // Sol ve Sağ duvarlar
  addBoxWall(wall, s - wall, s - 2 * wall, -half + wall / 2, (s + wall) / 2, 0);
  addBoxWall(wall, s - wall, s - 2 * wall, half - wall / 2, (s + wall) / 2, 0);

  // Kılavuz görselindeki iç merkez çıkıntı (tutamaç küpçüğü)
  const nub = Math.max(0.45, s * 0.12);
  addBoxWall(nub, nub * 0.75, nub, 0, wall + nub * 0.375, 0);

  if (isUpsideDown) {
    group.rotation.x = Math.PI;
  }
  return group;
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. UYGULAMA VE SERBEST LABORATUVAR DURUMU (STATE)
═══════════════════════════════════════════════════════════════════════════ */
const labState = {
  viewMode: 'portal',   // 'portal' | 'u1' | 'u2' | 'u3' | 'free'
  freeSubMode: 'side',  // 'side' | 'tower' | 'nested' | 'geo' | 'build8' | 'antRow'
  d: 4,                 // Aritmetik ortak fark (cm)
  a1: 2,                // İlk küp ayrıtı (cm)
  nCount: 5,            // Seçili küp sayısı (2..10)
  geoStep: 4,           // Geometrik dizi adımı (1..4)
  antCount: 1, antEdge: 6, antStart: 0, antEnd: 7,
  antPoints: [null,null], antRouteIndex: 0,
  antProgress: 0,      // Atom karınca yürüyüş yüzdesi (0..100)
  previewStep: 0
};

/* ═══════════════════════════════════════════════════════════════════════════
   5. 3B SAHNE İNŞA VE 2B ANALİTİK İZDÜŞÜM ÇİZİCİ
═══════════════════════════════════════════════════════════════════════════ */
function clearStageGroup() {
  antDrawing=null;
  while (stageGroup.children.length > 0) {
    const ch = stageGroup.children[0];
    stageGroup.remove(ch);
    const disposed = new Set();
    ch.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      for (const mat of (Array.isArray(obj.material)?obj.material:[obj.material])) if(mat && !disposed.has(mat)){disposed.add(mat);if(mat.map && mat.map!==surfaceTexture)mat.map.dispose();mat.dispose();}
    });
  }
  allStageMeshes = [];
}

function getArithmeticTerms(a1, d, n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(a1 + (i - 1) * d);
  }
  return arr;
}

let antDrawing=null;
let antWalking=false;
let lastAntTime=0;
const antNumber=value=>MaterialMath.decimal(value);
const antVector=p=>new THREE.Vector3(p[0],p[1],-p[2]);
function worldAntPoint(p) {
  return new THREE.Vector3(p[0]-labState.antCount*labState.antEdge/2,p[1],labState.antEdge/2-p[2]);
}
function makeAntModel(edge) {
  const group=new THREE.Group(), legs=[];
  const shell=new THREE.MeshStandardMaterial({color:isDarkTheme()?0xe2a56b:0x382016,roughness:0.6});
  const dark=new THREE.MeshStandardMaterial({color:0x140f0c,roughness:0.7});
  function ellipsoid(x,y,sx,sy,sz,mat=shell) {
    const part=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat);
    part.position.set(x,y,0);part.scale.set(sx,sy,sz);group.add(part);return part;
  }
  ellipsoid(-0.5,0.29,0.29,0.23,0.23); // abdomen
  ellipsoid(0,0.29,0.16,0.17,0.15); // thorax
  ellipsoid(0.34,0.33,0.18,0.19,0.18); // head
  ellipsoid(-0.23,0.28,0.1,0.07,0.07,dark); // narrow waist
  for(const side of [-1,1]) {
    const eye=new THREE.Mesh(new THREE.SphereGeometry(0.055,10,8),dark);
    eye.position.set(0.4,0.4,side*0.145);group.add(eye);
    for(let i=0;i<3;i++) {
      const pivot=new THREE.Group();pivot.position.set((i-1)*0.15,0.23,side*0.09);
      const x=(i-1)*0.27;
      const geometry=new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0,0,0),new THREE.Vector3(x,-0.04,side*0.29),new THREE.Vector3(x+0.07,-0.22,side*0.54)]);
      pivot.add(new THREE.Line(geometry,new THREE.LineBasicMaterial({color:isDarkTheme()?0xffcf9e:0x24130c})));
      group.add(pivot);legs.push({pivot,side,index:i});
    }
    const antenna=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.43,0.43,side*0.08),new THREE.Vector3(0.66,0.59,side*0.16),new THREE.Vector3(0.8,0.52,side*0.28)]);
    group.add(new THREE.Line(antenna,new THREE.LineBasicMaterial({color:isDarkTheme()?0xffcf9e:0x24130c})));
  }
  group.scale.setScalar(edge*0.15);
  return {group,legs};
}
function updateAntPose() {
  if(!antDrawing)return;
  const {solution,model}=antDrawing;
  const best=antDrawing.active||solution.best, points=best.points.map(worldAntPoint);
  let remaining=best.length*labState.antProgress/100, segment=0;
  while(segment<points.length-2 && remaining>points[segment].distanceTo(points[segment+1])) {
    remaining-=points[segment].distanceTo(points[segment+1]);segment++;
  }
  const from=points[segment],to=points[segment+1],length=from.distanceTo(to);
  const tangent=to.clone().sub(from).normalize();
  const up=antVector(best.normals[Math.min(segment,best.normals.length-1)]);
  if(length<1e-9)tangent.set(Math.abs(up.x)<.9?1:0,0,Math.abs(up.x)<.9?0:1);
  const side=new THREE.Vector3().crossVectors(tangent,up).normalize();
  model.group.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tangent,up,side));
  model.group.position.copy(from).lerp(to,length?Math.min(1,remaining/length):0).addScaledVector(up,solution.edge*0.004);
  for(const leg of model.legs)leg.pivot.rotation.y=Math.sin(labState.antProgress*0.45+leg.index*Math.PI+leg.side)*0.32;
  document.getElementById('ant-walk-progress').value=labState.antProgress;
  document.getElementById('ant-walk-value').textContent=`%${Math.round(labState.antProgress)}`;
  if(best.net)drawAntPointNet(solution,best);else drawAntNet(solution);
}
function antNetData(solution,route){
 if(route.net)return {faces:route.net.faces.map(face=>({polygon:face.polygon,name:AntSurface.faceNames[face.face]})),path:route.net.path||[route.net.a,route.net.b]};
 const u=Math.max(route.u,solution.edge),v=Math.max(route.v,solution.edge*.42),cuts=route.fold===null?[0,u]:[0,route.fold,u],names=route.label.split(' · ')[0].split(' → ');
 return {faces:cuts.slice(1).map((right,i)=>({name:names[i]||'Yüz',polygon:[[cuts[i],0],[right,0],[right,v],[cuts[i],v]]})),path:[[0,0],[route.u,route.v]]};
}
function drawAntUnfolding(solution,route){
 const ctx=pCtx,W=projCanvas.width,dark=isDarkTheme(),net=antNetData(solution,route),H=AntNetLayout.heightFor(net.faces,W);
 if(projCanvas.height!==H)projCanvas.height=H;
 const measurements={horizontal:resultsAreVisible()?`a = ${antNumber(route.u)} cm`:'a',vertical:resultsAreVisible()?`b = ${antNumber(route.v)} cm`:'b',hypotenuse:'c'};
 const layout=AntNetLayout.plan(net.faces,net.path,W,H,measurements),ink=dark?'#EDF3FF':'#142448',surface=dark?'#151C28':'#F4F6F9';
 ctx.clearRect(0,0,W,H);ctx.fillStyle=surface;ctx.fillRect(0,0,W,H);
 for(const face of layout.faces){ctx.beginPath();face.polygon.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=dark?'#243657':'#E4ECFF';ctx.fill();ctx.strokeStyle=dark?'#ACBBD7':'#7182A4';ctx.lineWidth=1.8;ctx.stroke();}
 const path=layout.path,isBest=ExactLength.equal(route,solution.best);
 const triangle=layout.triangle;
 if(triangle.nondegenerate){
  const {a,b,corner:c}=triangle;
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...c);ctx.lineTo(...b);ctx.closePath();ctx.fillStyle=dark?'rgba(255,194,112,.08)':'rgba(255,194,112,.14)';ctx.fill();
  for(const [from,to,color] of [[a,c,dark?'#FFBF70':'#A95200'],[c,b,dark?'#86D4E9':'#00758A']]){
   ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.strokeStyle=surface;ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.setLineDash([7,4]);ctx.stroke();ctx.setLineDash([]);
  }
  const size=Math.min(13,Math.abs(a[0]-c[0])/3,Math.abs(b[1]-c[1])/3),sx=Math.sign(a[0]-c[0]),sy=Math.sign(b[1]-c[1]);
  ctx.beginPath();ctx.moveTo(c[0]+sx*size,c[1]);ctx.lineTo(c[0]+sx*size,c[1]+sy*size);ctx.lineTo(c[0],c[1]+sy*size);ctx.strokeStyle=ink;ctx.lineWidth=2;ctx.stroke();
 }
 if(route.detour){ctx.strokeStyle=resultsAreVisible()?'#139C74':'#285CD1';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(...path[0]);ctx.lineTo(...path.at(-1));ctx.stroke();ctx.setLineDash([]);}
 ctx.strokeStyle=!resultsAreVisible()?'#285CD1':isBest?'#139C74':'#A66CFF';ctx.lineWidth=4;ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();
 for(const [index,point] of [[0,path[0]],[1,path.at(-1)]]){ctx.beginPath();ctx.arc(...point,5,0,Math.PI*2);ctx.fillStyle=index?'#285CD1':'#139C74';ctx.fill();}
 for(const label of layout.labels){
  const r=label.rect,cx=r.x+r.w/2,cy=r.y+r.h/2;
  ctx.strokeStyle=dark?'#ACBBD7':'#596786';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...label.anchor);ctx.lineTo(cx,cy);ctx.stroke();
  ctx.fillStyle=dark?'#243657':'#FFFFFF';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeRect(r.x,r.y,r.w,r.h);
  ctx.fillStyle=label.text==='A'?(dark?'#76E4C4':'#087A5B'):label.text==='B'?(dark?'#A2BDFF':'#285CD1'):label.kind==='horizontal'?(dark?'#FFBF70':'#A95200'):label.kind==='vertical'?(dark?'#86D4E9':'#00758A'):ink;
  ctx.font=(label.kind==='point'?'bold 28px':label.kind==='face'?'bold 23px':'bold 21px')+' Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label.text,cx,cy);ctx.textBaseline='alphabetic';
 }
 const t=labState.antProgress/100,lengths=path.slice(1).map((p,i)=>Math.hypot(p[0]-path[i][0],p[1]-path[i][1]));
 let remaining=lengths.reduce((s,l)=>s+l,0)*t,segment=0;while(segment<lengths.length-1&&remaining>lengths[segment])remaining-=lengths[segment++];
 const f=lengths[segment]?remaining/lengths[segment]:0,a=path[segment],b=path[segment+1];
 ctx.save();ctx.translate(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);ctx.rotate(Math.atan2(b[1]-a[1],b[0]-a[0]));ctx.scale(.55,.55);ctx.strokeStyle=dark?'#FFCF9E':'#382016';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.7;
 for(const side of [-1,1])for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*3,0);ctx.lineTo(i*5+Math.sin(t*45+i)*2,side*6);ctx.lineTo(i*6+2,side*10);ctx.stroke();}
 for(const [px,rx,ry] of [[-7,6,4],[0,3,3],[6,4,3]]){ctx.beginPath();ctx.ellipse(px,0,rx,ry,0,0,Math.PI*2);ctx.fill();}ctx.restore();
}
function drawAntNet(solution){drawAntUnfolding(solution,antDrawing.active||solution.best);}
function drawAntPointNet(solution,route){drawAntUnfolding(solution,route);}
function renderAntNetInformation(solution,route){
 const legend=document.getElementById('ant-net-legend');legend.replaceChildren();legend.hidden=!solution;
 if(solution){const data=antNetData(solution,route);data.faces.forEach((face,i)=>{const item=document.createElement('span'),number=document.createElement('b');number.textContent=String(i+1);item.append(number,document.createTextNode(face.name));legend.append(item);});}
 const proof=document.getElementById('ant-pythagoras');proof.replaceChildren();proof.hidden=!solution;
 if(solution){
  const note=document.createElement('p');note.textContent=route.u>1e-7&&route.v>1e-7?'Turuncu a ve turkuaz b dik kenarlardır. c, A ile B arasındaki doğrudur. Küçük kare dik açıyı gösterir.':'A ile B bu açınımda aynı doğrultudadır. Dik üçgen oluşmaz.';proof.append(note);
  if(route.detour){const warning=document.createElement('p');warning.textContent=(route.u>1e-7&&route.v>1e-7?'Pisagor üçgeni A ile B arasındaki kesikli doğruya aittir. ':'Kesikli doğru A ile B’yi birleştirir. ')+'Seçili dolambaçlı yolun uzunluğu, yürünülen parçaların uzunlukları eklenerek bulunur.';proof.append(warning);}
  if(resultsAreVisible()&&route.u>1e-7&&route.v>1e-7){
   const equation=document.createElement('div');equation.className='ant-equation';
   const math=document.createElementNS('http://www.w3.org/1998/Math/MathML','math');math.setAttribute('aria-label',`c kare eşittir ${antNumber(route.u)} kare artı ${antNumber(route.v)} kare`);
   math.innerHTML=`<mrow><msup><mi mathvariant="normal">c</mi><mn>2</mn></msup><mo>=</mo><msup><mi mathvariant="normal">a</mi><mn>2</mn></msup><mo>+</mo><msup><mi mathvariant="normal">b</mi><mn>2</mn></msup><mo>=</mo><msup><mn>${antNumber(route.u)}</mn><mn>2</mn></msup><mo>+</mo><msup><mn>${antNumber(route.v)}</mn><mn>2</mn></msup></mrow>`;
   equation.append(math);const length=document.createElement('div');length.className='exact-length';length.append(document.createTextNode('c = '));const value=document.createElement('span');value.className='exact-length';ExactLength.render(value,{u:route.u,v:route.v,length:Math.hypot(route.u,route.v)});length.append(value);proof.append(equation,length);
  }
 }
 const host=document.getElementById('ant-exact-lengths');host.replaceChildren();host.hidden=!solution||!resultsAreVisible();if(host.hidden)return;
 for(const [title,value] of [['Seçili yolun uzunluğu',route],['En kısa yolun uzunluğu',solution.best]]){const card=document.createElement('div'),heading=document.createElement('strong'),length=document.createElement('div');heading.textContent=title;length.className='exact-length';ExactLength.render(length,value);card.append(heading,length);host.append(card);}
}

let antPickTarget=0;
function isAntCustom(){return labState.viewMode==='free'||!!MODULES[activeModuleKey]?.steps[currentStepIdx]?.antCustom;}
function antPointText(point,dimensions) {
  if(!point)return 'Henüz seçilmedi';
  return AntSurface.faceNames.filter((_,face)=>Math.abs(point[Math.floor(face/2)]-(face%2)*dimensions[Math.floor(face/2)])<1e-5).join(' / ')+' yüz; kafes koordinatları '+point.map(antNumber).join(', ')+' cm';
}
function drawAntLattice(dimensions){
 const positions=[],offset=labState.antEdge*.002;
 // Each exterior face has its own shallow offset; hidden surfaces stay occluded.
 for(let face=0;face<6;face++){
  const axis=Math.floor(face/2),axes=AntLattice.faceAxes(face),normal=[0,0,0];normal[axis]=face%2?1:-1;
  const world=p=>worldAntPoint(p).addScaledVector(antVector(normal),offset);
  const point=(u,v)=>{const p=[0,0,0];p[axis]=face%2?dimensions[axis]:0;p[axes[0]]=u;p[axes[1]]=v;return p;};
  for(let u=0;u<=dimensions[axes[0]];u++)positions.push(world(point(u,0)),world(point(u,dimensions[axes[1]])));
  for(let v=0;v<=dimensions[axes[1]];v++)positions.push(world(point(0,v)),world(point(dimensions[axes[0]],v)));
 }
 const dots=AntLattice.nodes(dimensions).map(p=>worldAntPoint(p).addScaledVector(antVector(p.map((v,i)=>v===0?-1:v===dimensions[i]?1:0)),offset));
 stageGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(positions),new THREE.LineBasicMaterial({color:isDarkTheme()?0xe9efff:0x10274b,transparent:true,opacity:.28})));
 stageGroup.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(dots),new THREE.PointsMaterial({color:isDarkTheme()?0xffffff:0x10274b,size:4,sizeAttenuation:false})));
}
function syncAntLatticeControls(){
 const dimensions=[labState.antCount*labState.antEdge,labState.antEdge,labState.antEdge],face=Number(document.getElementById('ant-face').value),axes=AntLattice.faceAxes(face);
 for(const [index,id]of ['ant-face-u','ant-face-v'].entries()){
  const input=document.getElementById(id),axis=axes[index];input.max=dimensions[axis];input.step=1;input.value=Math.max(0,Math.min(dimensions[axis],Math.round(Number(input.value))));
  document.getElementById(id+'-value').textContent=`${input.value} cm`;input.setAttribute('aria-valuetext',`${input.value} santimetre`);
  input.previousElementSibling.firstChild.textContent=`${['x','y','z'][axis]} doğrultusunda konum `;
 }
}
function chooseAntRoutes(solution) {
  // Equal lengths can belong to different paths: retain all three classic nets.
  if(!solution.arbitrary)return [...solution.candidates].sort((a,b)=>a.label.localeCompare(b.label,'tr'));
  const sorted=[...solution.candidates,...AntSurface.detours(solution)].sort((a,b)=>a.length-b.length);
  const result=[solution.best];
  result.push(...sorted.filter(c=>c!==solution.best&&ExactLength.equal(c,solution.best)).slice(0,2));
  for(const route of sorted)if(!result.some(c=>ExactLength.equal(c,route))){
    result.push(route);if(result.length===4)break;
  }
  return result.sort((a,b)=>a.label.localeCompare(b.label,'tr'));
}
function addAntMarker(id,point,color,edge) {
  const marker=new THREE.Mesh(new THREE.SphereGeometry(edge*.035,14,10),new THREE.MeshBasicMaterial({color,depthTest:false}));
  marker.position.copy(worldAntPoint(point));marker.renderOrder=4;stageGroup.add(marker);
  const labelCanvas=document.createElement('canvas');labelCanvas.width=64;labelCanvas.height=64;
  const ctx=labelCanvas.getContext('2d');ctx.fillStyle=isDarkTheme()?'#EDF3FF':'#142448';ctx.font='bold 46px Segoe UI';ctx.textAlign='center';ctx.fillText(id,32,48);
  const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(labelCanvas),depthTest:false}));
  label.position.copy(marker.position).add(new THREE.Vector3(0,edge*.12,0));label.scale.setScalar(edge*.22);label.renderOrder=5;stageGroup.add(label);
}
function drawAntRoute(route,edge,color,solid) {
  const points=route.points.map((point,i)=>{
    const previous=antVector(route.normals[Math.max(0,i-1)]),next=antVector(route.normals[Math.min(i,route.normals.length-1)]);
    const divisor=1+previous.dot(next),offset=divisor>1e-6?previous.add(next).divideScalar(divisor):next;
    return worldAntPoint(point).addScaledVector(offset,edge*.012);
  });
  for(let i=0;i<route.points.length-1;i++){
    const a=points[i],b=points[i+1];
    if(a.distanceTo(b)<1e-7)continue;
    if(solid){
      const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a,b),8,edge*.011,7,false),new THREE.MeshBasicMaterial({color}));
      stageGroup.add(mesh);
    } else {
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineDashedMaterial({color,dashSize:edge*.10,gapSize:edge*.065,transparent:true,opacity:.8}));
      line.computeLineDistances();stageGroup.add(line);
    }
  }
  if(solid)for(const point of points.slice(1,-1)){
    const joint=new THREE.Mesh(new THREE.SphereGeometry(edge*.011,12,8),new THREE.MeshBasicMaterial({color}));
    joint.position.copy(point);stageGroup.add(joint);
  }
}
function renderAntActivity(disp,nameEl,descEl,formEl) {
  const {antCount:count,antEdge:edge,antStart:start,antEnd:end}=labState,custom=isAntCustom();
  const dimensions=[count*edge,edge,edge];
  const selected=custom?labState.antPoints.map(p=>p&&AntLattice.snap(p.map((v,i)=>v*dimensions[i]),dimensions)):null;
  if(custom)labState.antPoints=selected.map(p=>p&&p.map((v,i)=>v/dimensions[i]));
  const complete=!custom||selected.every(Boolean);
  const solution=complete?(custom?AntSurface.solvePoints(count,edge,selected[0],selected[1]):AntSurface.solve(count,edge,start,end)):null;
  const routes=solution?chooseAntRoutes(solution):[];
  labState.antRouteIndex=Math.min(labState.antRouteIndex,routes.length-1);if(labState.antRouteIndex<0)labState.antRouteIndex=0;
  const active=routes[labState.antRouteIndex];
  for(let i=0;i<count;i++) {
    const box=new THREE.Mesh(new THREE.BoxGeometry(edge,edge,edge),new THREE.MeshStandardMaterial({color:CUBE_PALETTE[(i+2)%10],roughness:0.8,wireframe:false}));
    box.position.set((i+.5)*edge-count*edge/2,edge/2,0);box.receiveShadow=true;stageGroup.add(box);allStageMeshes.push(box);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),new THREE.LineBasicMaterial({color:isDarkTheme()?0xe0eaff:0x203353}));edges.position.copy(box.position);stageGroup.add(edges);
  }
  if(custom)drawAntLattice(dimensions);
  if(solution){
    for(const route of routes)if(route!==active&&(!resultsAreVisible()||route!==solution.best))drawAntRoute(route,edge,0x7894b7,false);
    if(resultsAreVisible())drawAntRoute(solution.best,edge,0x139c74,true);
    if(!resultsAreVisible()||active!==solution.best)drawAntRoute(active,edge,!resultsAreVisible()?0x285cd1:ExactLength.equal(active,solution.best)?0x139c74:0xa66cff,true);
    const model=makeAntModel(edge);stageGroup.add(model.group);antDrawing={solution,model,active,routes};
  }
  const points=custom?selected:[solution.start,solution.end];
  points.forEach((point,i)=>{if(point)addAntMarker(i?'B':'A',point,i?0x285cd1:0x139c74,edge);});
  controls.target.set(0,edge/2,0);
  disp.className='ant';nameEl.textContent=`Atom Karınca • ${count} küp`;
  descEl.textContent=`${edge} cm ayrıtlı ${count} eş küp. Karınca birleşik cismin dış yüzeyinde yürür.`;
  formEl.textContent=solution?`En kısa yol: ${ExactLength.text(solution.best)}`:'Yüzeye dokunarak iki nokta seçiniz.';
  document.getElementById('cot-cubes-eq').textContent=`${count} eş küp; ayrıt ${edge} cm`;
  document.getElementById('cot-param-eq').textContent=custom?'Şekil üzerinde seçilen A ve B':`A: ${AntSurface.names[start]}; B: ${AntSurface.names[end]}`;
  document.getElementById('cot-ecc-text').textContent=`Boyutlar: ${dimensions.join(' × ')} cm`;
  document.getElementById('cot-result-text').textContent=formEl.textContent;
  document.getElementById('proj-title').textContent=custom?'Seçili Yolun Açınımı':'Yüzey Açınımı • A → B';
  document.getElementById('ecc-badge').textContent=solution?ExactLength.text(solution.best):'İki nokta seçiniz';
  for(const [i,label,value] of [[1,'Yatay fark:',active?`${antNumber(active.u)} cm`:'—'],[2,'Düşey fark:',active?`${antNumber(active.v)} cm`:'—'],[3,'Seçili yol:',active?ExactLength.text(active):'—'],[4,'En kısa:',solution?ExactLength.text(solution.best):'—']]) {
    document.getElementById(`m-lbl-${i}`).textContent=label;document.getElementById(['','m-a','m-b','m-f','m-c'][i]).textContent=value;
  }
  document.getElementById('ant-builder').hidden=!custom;
  for(const [id,value] of [['ant-count',count],['ant-edge',edge]])document.getElementById(id).value=value;
  if(custom)syncAntLatticeControls();
  const pending=!resultsAreVisible();
  document.getElementById('ant-comparisons').replaceChildren(...routes.map((route,i)=>{
    const item=document.createElement('li'),button=document.createElement('button');button.type='button';
    const shortest=ExactLength.equal(route,solution.best);
    const heading=document.createElement('span');heading.textContent=`Yol ${i+1} · ${route.label.split(' · ')[0]}${!pending&&shortest?' • En kısa':''}`;button.append(heading);
    if(!pending){const length=document.createElement('span');length.className='exact-length';ExactLength.render(length,route);button.append(length);}
    button.setAttribute('aria-pressed',String(i===labState.antRouteIndex));button.className=!pending&&shortest?'ant-shortest':'';
    button.addEventListener('click',()=>{stopAntWalk();labState.antRouteIndex=i;labState.antProgress=0;discoveryChoices.set(discoveryKey(),i);rememberAntCustom();redrawAntPreservingCamera();document.querySelectorAll('#ant-comparisons button')[i]?.focus({preventScroll:true});});
    item.appendChild(button);return item;
  }));
  const same=solution&&solution.best.length<1e-7;
  document.getElementById('ant-point-info').textContent=custom?`A: ${antPointText(points[0],dimensions)}. B: ${antPointText(points[1],dimensions)}.${same?' İki nokta aynı; yol 0 cm.':''}`:`A: ${AntSurface.names[start]}. B: ${AntSurface.names[end]}.`;
  const play=document.getElementById('ant-walk-button');play.disabled=!solution||same||reduceMotionQuery.matches;
  play.title=reduceMotionQuery.matches?'Hareket azaltma etkin. İlerleme sürgüsünü kullanabilirsiniz.':'';
  play.textContent=antWalking?'❚❚ Duraklatınız':'▶ Karıncayı yürütünüz';
  document.getElementById('ant-walk-progress').disabled=!solution||same;
  canvas.classList.toggle('ant-picking',custom&&antPickTarget!==null);
  document.getElementById('ant-pick-status').textContent=antPickTarget===null?'A ve B kafes noktalarına yerleştirildi. Bir yolu seçerek açınımını inceleyiniz.':`${antPickTarget?'B':'A'} noktasını seçmek için yüzeydeki bir kafes noktasına dokununuz. Döndürmek için sürükleyiniz.`;
  for(const i of [0,1])document.getElementById(i?'ant-pick-b':'ant-pick-a').setAttribute('aria-pressed',String(antPickTarget===i));
  document.getElementById('ant-route-proof').textContent=!resultsAreVisible()?'Yolları ve açınımlarını inceleyiniz. Sizce hangi yol en kısa? Sonucu yanıtınızdan sonra karşılaştırabilirsiniz.':solution?(custom?`${solution.examined} yüz sırası incelendi; geçerli açınımların en kısa yolları karşılaştırıldı. Yeşil yol en kısa. Mor dolambaçlı yol seçildiğinde açınımdaki yeşil doğruyla farkını görebilirsiniz.`:'Üç açınım aynı A ve B için karşılaştırılır. Yeşil yol en kısa; kesikli çizgiler diğer seçeneklerdir.'):'İki noktayı seçtiğinizde geçerli açınımlar karşılaştırılır.';
  renderAntNetInformation(solution,active);
  if(solution)updateAntPose();
  else {pCtx.clearRect(0,0,projCanvas.width,projCanvas.height);pCtx.fillStyle=isDarkTheme()?'#EDF3FF':'#142448';pCtx.font='16px Segoe UI';pCtx.textAlign='left';pCtx.fillText('Şekil üzerinde A ve B’yi seçiniz.',24,80);}
}
function redrawAntPreservingCamera(){const target=controls.target.clone();renderActiveSceneAndHUD();controls.target.copy(target);controls.update();}

function stopAntWalk() {
  antWalking=false;lastAntTime=0;
  const button=document.getElementById('ant-walk-button');if(button)button.textContent='▶ Karıncayı yürütünüz';
}

let lastGeometryKey="";
function renderActiveSceneAndHUD() {
  clearStageGroup();
  const mode = labState.freeSubMode;
  const netHeight=mode==='antRow'?440:300;if(projCanvas.height!==netHeight)projCanvas.height=netHeight;
  document.getElementById('ant-net-legend').hidden=mode!=='antRow';document.getElementById('ant-exact-lengths').hidden=mode!=='antRow';
  document.body.classList.toggle('geo-guided',labState.viewMode==='u2');
  document.body.classList.toggle('sequence-guided',['u1','u2'].includes(labState.viewMode));
  document.getElementById('geo-record').hidden=!['u1','u2'].includes(labState.viewMode);

  const disp = document.getElementById('conic-display');
  const nameEl = document.getElementById('conic-name');
  const descEl = document.getElementById('conic-desc');
  const formEl = document.getElementById('conic-formula');

  if (mode === 'side' || mode === 'tower' || mode === 'nested') {
    const terms = getArithmeticTerms(labState.a1, labState.d, labState.nCount);
    const an = terms[terms.length - 1];

    if (mode === 'side') {
      let totalW = 0;
      terms.forEach(t => { totalW += t + 1.4; });
      let curX = -totalW / 2;
      terms.forEach((sz, idx) => {
        const cube = createOpenHollowCube(sz, CUBE_PALETTE[idx % 10], false);
        cube.position.set(curX + sz / 2, 0, 0);
        stageGroup.add(cube);
        curX += sz + 1.4;
      });
      controls.target.set(0, Math.max(5, an * 0.35), 0);
      disp.className = 'arith';
      nameEl.textContent = 'Aritmetik Dizi (Yan Yana)';
      descEl.textContent = `Küpler küçükten büyüğe d = ${labState.d} cm sabit farkla dizildi. Her küpün ayrıtı f(n) = aₙ fonksiyon çıktısıdır.`;
    } else if (mode === 'tower') {
      let curY = 0;
      const rev = [...terms].reverse();
      rev.forEach((sz, idx) => {
        const colorIdx = (terms.length - 1 - idx) % 10;
        const cube = createOpenHollowCube(sz, CUBE_PALETTE[colorIdx], true);
        cube.position.set(0, curY + sz, 0);
        stageGroup.add(cube);
        curY += sz;
      });
      controls.target.set(0, Math.max(8, curY * 0.42), 0);
      disp.className = 'arith';
      nameEl.textContent = 'Aritmetik Kule (Üst Üste)';
      descEl.textContent = `Ayrıtları ${terms.join(', ')} cm olan ${labState.nCount} küp üst üste dizildiğinde küp ayrıtları aynı dizinin terimleri olarak incelenebilir.`;
    } else {
      // İç İçe Takım (Matruşka dizilimi)
      const rev = [...terms].reverse();
      rev.forEach((sz, idx) => {
        const colorIdx = (terms.length - 1 - idx) % 10;
        const cube = createOpenHollowCube(sz, CUBE_PALETTE[colorIdx], false);
        cube.position.set(0, idx * 0.38, 0);
        stageGroup.add(cube);
      });
      controls.target.set(0, Math.max(5, an * 0.35), 0);
      disp.className = 'nested';
      nameEl.textContent = 'İç İçe Küpler Takımı';
      descEl.textContent = 'Üst yüzeyi açık küpler büyükten küçüğe iç içe yerleştirildi. "İç Kesiti Ayırınız" ile katmanları inceleyiniz.';
    }

    formEl.textContent = `aₙ = ${labState.a1} + (n − 1) × ${labState.d} cm`;

    // CoT Güncelle
    document.getElementById('cot-cubes-eq').textContent = `${terms.join(', ')} cm (n = ${labState.nCount})`;
    document.getElementById('cot-param-eq').textContent = `a₁ = ${labState.a1} cm, d = ${labState.d} cm`;
    document.getElementById('cot-ecc-text').textContent = `aₙ = ${labState.a1} + (n−1)·${labState.d} ⇒ a_${labState.nCount} = ${an} cm`;
    document.getElementById('cot-result-text').textContent = `${labState.nCount}. sıradaki küpün ayrıtı ${an} cm olur.`;

    // 2B İzdüşüm Metrikleri
    document.getElementById('proj-title').textContent = 'Küplerin ayrıt uzunlukları';
    document.getElementById('ecc-badge').textContent = `a_${labState.nCount} = ${an} cm`;
    document.getElementById('m-lbl-1').textContent = 'İlk terim a₁:';
    document.getElementById('m-a').textContent = `${labState.a1} cm`;
    document.getElementById('m-lbl-2').textContent = 'Son terim aₙ:';
    document.getElementById('m-b').textContent = `${an} cm`;
    document.getElementById('m-lbl-3').textContent = 'Ortak fark d:';
    document.getElementById('m-f').textContent = `${labState.d} cm`;
    document.getElementById('m-lbl-4').textContent = 'Sıra numarası:';
    document.getElementById('m-c').textContent = `${labState.nCount}`;

    draw2DArithmetic(terms);
    if(labState.viewMode==='u1')renderArithmeticRecord(terms);

  } else if (mode === 'geo' && labState.viewMode === 'u2') {
    renderGuidedGeometry();
  } else if (mode === 'geo' || mode === 'build8') {
    // Serbest mod: 1, 2, 4, 8 numaralı küpler (ayrıtlar 2, 4, 8, 16 cm; ön yüzey alanları 256, 64, 16, 4 cm²)
    const geoEdges = [16, 8, 4, 2];
    const geoColors = [CUBE_PALETTE[7], CUBE_PALETTE[3], CUBE_PALETTE[1], CUBE_PALETTE[0]];
    const stepN = Math.max(1, Math.min(4, labState.geoStep));
    const areaTerms = [256, 64, 16, 4].slice(0, stepN);
    const lastArea=areaTerms[areaTerms.length-1];

    if (mode === 'geo') {
      let curY = 0;
      for (let i = 0; i < stepN; i++) {
        const sz = geoEdges[i];
        const cube = createOpenHollowCube(sz, geoColors[i], true);
        cube.position.set(0, curY + sz, 0);
        stageGroup.add(cube);
        curY += sz;
      }
      controls.target.set(0, 12, 0);
      disp.className = 'geo';
      nameEl.textContent = 'Geometrik Dizi Kulesi (1, 2, 4, 8)';
      descEl.textContent = 'En büyük küpten başlayarak önden görünen yüzey alanları 4⁴, 4³, 4², 4¹ (r = 1/4) geometrik dizisini oluşturur.';
      formEl.textContent = `Aₙ = 256 × (1/4)ⁿ⁻¹ cm²`;
    } else {
      // 8 numaralı küpe (16 cm) eş küp inşası (Kılavuz Sayfa 5)
      const refCube = createOpenHollowCube(16, CUBE_PALETTE[7], true);
      refCube.position.set(-11, 16, 0);
      stageGroup.add(refCube);

      const blocks = [];
      for (const x of [7,15]) for (const y of [8,16]) for (const z of [-4,4])
        blocks.push({sz:8,x,y,z,c:CUBE_PALETTE[3]});
      blocks.forEach(b => {
        const m = createOpenHollowCube(b.sz, b.c, true);
        m.position.set(b.x, b.y, b.z);
        stageGroup.add(m);
      });
      controls.target.set(2, 8, 0);
      disp.className = 'geo';
      nameEl.textContent = 'Hacim Karşılaştırması: 8 Küçük Küp';
      descEl.textContent = '8 numaralı küpün (16 cm) ayrıtı 1/2 oranında küçültülerek 4. küp (8 cm), o da 1/2 küçültülerek 2. küp (4 cm) elde edilir.';
      formEl.textContent = 'aₙ = 2ⁿ cm  |  Hacim Oranı: (16/8)³ = 8 adet 4. küp';
    }

    document.getElementById('cot-cubes-eq').textContent = 'Küpler #8, #4, #2, #1 (16, 8, 4, 2 cm)';
    document.getElementById('cot-param-eq').textContent = 'Ön Alan a₁ = 4⁴ = 256 cm², r = 1/4';
    document.getElementById('cot-ecc-text').textContent = `Aₙ = 4⁴ · (1/4)ⁿ⁻¹ = 4⁵⁻ⁿ cm²`;
    document.getElementById('cot-result-text').textContent = `${stepN}. küpün bir ön yüzünün alanı ${lastArea} cm².`;

    document.getElementById('proj-title').textContent = '📐 2B Ön Yüzey Alanları (4⁴, 4³, 4², 4¹)';
    document.getElementById('ecc-badge').textContent = `A_${stepN} = ${lastArea} cm²`;
    document.getElementById('m-lbl-1').textContent = '1. Alan (4⁴):';
    document.getElementById('m-a').textContent = '256 cm²';
    document.getElementById('m-lbl-2').textContent = 'Çarpan r:';
    document.getElementById('m-b').textContent = '1/4 (0,25)';
    document.getElementById('m-lbl-3').textContent = 'Son yüzün alanı:';
    document.getElementById('m-f').textContent = `${lastArea} cm²`;
    document.getElementById('m-lbl-4').textContent = 'Küp sayısı:';
    document.getElementById('m-c').textContent = `${stepN}`;

    if(mode==='build8'){
      document.getElementById('proj-title').textContent='Referans ve küçük küpün ön yüzü';
      document.getElementById('ecc-badge').textContent='Alan oranı: 4 kat';
      for(const [i,label,value] of [[1,'Referans yüz:','256 cm²'],[2,'Küçük küpün yüzü:','64 cm²'],[3,'Alan oranı:','4 kat'],[4,'Hacim oranı:','8 kat']]){
        document.getElementById(`m-lbl-${i}`).textContent=label;document.getElementById(['','m-a','m-b','m-f','m-c'][i]).textContent=value;
      }
      draw2DGeometric(2);
    }else draw2DGeometric(stepN);

  } else if(mode==='antRow') {
    renderAntActivity(disp,nameEl,descEl,formEl);
  }
  document.getElementById('ant-controls').hidden=mode!=='antRow';
  document.getElementById('proj-panel').classList.toggle('ant-panel',mode==='antRow');
  const pickPrompt=document.getElementById('ant-canvas-prompt');
  pickPrompt.hidden=mode!=='antRow'||!isAntCustom();
  pickPrompt.textContent=antPickTarget===null?(resultsAreVisible()?'A ve B seçildi • Yeşil yol en kısa':'A ve B seçildi • Bir yol seçip tahmininizi kontrol ediniz'):`${antPickTarget?'B':'A'} için bir kafes noktasına dokununuz • Döndürmek için sürükleyiniz`;
  document.getElementById('free-panel').hidden=mode==='antRow';
  document.getElementById('clip-btn').disabled=mode==='antRow';
  document.getElementById('wireframe-btn').disabled=mode==='antRow';
  const key=JSON.stringify([mode,labState.a1,labState.d,labState.nCount,labState.geoStep,labState.antCount,labState.antEdge,labState.antStart,labState.antEnd,currentGuidedStep()?.geoView]);
  if(key!==lastGeometryKey){lastGeometryKey=key;fitScene();}
  const accessible = labState.viewMode==='u2' ? geometricAccessibleDescription() : mode==='geo'||mode==='build8'
    ? `Küplerin önden görülen kare yüzlerinin alanları büyükten küçüğe: ${[256,64,16,4].slice(0,mode==='build8'?2:labState.geoStep).join(', ')} santimetrekare.`
    : mode==='antRow' ? `${labState.antCount} küp. ${document.getElementById('ant-point-info').textContent} ${antDrawing&&resultsAreVisible()?`En kısa yüzey yolu ${ExactLength.text(antDrawing.solution.best)}.`:antDrawing?'Alternatif yolları inceleyip yanıtınızı veriniz.':'Yüzey üzerinde iki nokta seçilmesi bekleniyor.'}`
    : `Küplerin ayrıt uzunlukları: ${getArithmeticTerms(labState.a1,labState.d,labState.nCount).map((v,i)=>isMeasurementHidden(i,'edges')?'gizli ölçü':v).join(', ')} santimetre.`;
  document.getElementById('proj-canvas').setAttribute('aria-label',accessible);
  refreshDisclosure();
}
function fitScene(view=null) {
  view=view||(labState.viewMode==='u1'?'front':'iso');
  const box=new THREE.Box3().setFromObject(stageGroup);
  const center=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  const radius=size.length()/2;
  const mobileScene=document.documentElement.dataset.preview!=='1' && window.matchMedia('(max-width:650px)').matches;
  let dist=Math.max(mobileScene?6:25,radius/Math.sin(Math.min(camera.fov*Math.PI/360,Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect)))*1.12);
  controls.minDistance=mobileScene?4:16;
  // Labels and camera buttons have separate mobile rows outside the drawing stage.
  camera.clearViewOffset();
  const dir=view==='front'?new THREE.Vector3(0,0,1):view==='top'?new THREE.Vector3(0,1,0.001):new THREE.Vector3(1,0.65,1.3).normalize();
  controls.target.copy(center); camera.position.copy(center).addScaledVector(dir,dist);
  controls.maxDistance=Math.max(175,dist*2); camera.far=Math.max(500,dist*4);camera.updateProjectionMatrix();controls.update();
}
function isQuestionPending(){return labState.viewMode.startsWith('u') && !!MODULES[activeModuleKey].steps[currentStepIdx].question && !solvedMap[activeModuleKey].has(currentStepIdx);}
// Derived results are disclosed only for a checked response in this configuration.
function discoveryKey(){
 const mode=labState.freeSubMode;
 const params=mode==='antRow'?[labState.antCount,labState.antEdge,labState.antStart,labState.antEnd,isAntCustom()?labState.antPoints:null]:mode==='geo'||mode==='build8'?[labState.geoStep]:[labState.a1,labState.d,labState.nCount];
 return JSON.stringify([labState.viewMode,labState.viewMode==='free'?null:currentStepIdx,mode,...params]);
}
function currentGuidedStep(){return labState.viewMode.startsWith('u')?MODULES[activeModuleKey].steps[currentStepIdx]:null;}
function resultsAreVisible(){
 const step=currentGuidedStep();
 return step?.question?solvedMap[activeModuleKey].has(currentStepIdx):discoveryResponses.has(discoveryKey());
}
function discoveryTask(){
 const mode=labState.freeSubMode;
 if(mode==='antRow')return {ant:true,prompt:'Karınca, seçtiğiniz A ve B noktaları arasında yalnızca küplerin oluşturduğu cismin dış yüzeyinde yürüyecektir. Yukarıda gösterilen yollardan hangisi karıncayı B noktasına en kısa mesafede ulaştırır?'};
 if(mode==='build8')return {prompt:'16 cm ayrıtlı küpün bir yüzünün alanı, 8 cm ayrıtlı küpün bir yüzünün alanının kaç katıdır?',value:4,unit:'kat'};
 if(mode==='geo'){
  const value=SequenceActivities.areas[labState.geoStep-1];
  return {prompt:`Büyükten küçüğe sıralanan küplerden ${labState.geoStep}. sıradaki küpün bir kare ön yüzünün alanı kaç santimetrekaredir?`,value,unit:'cm²',options:[value/4,value,value*4,value*16]};
 }
 const terms=getArithmeticTerms(labState.a1,labState.d,labState.nCount),value=terms[terms.length-1];
 return {prompt:`İlk ayrıtı ${labState.a1} cm ve ortak farkı ${labState.d} cm olan küp dizisinde ${labState.nCount}. sıradaki küpün ayrıt uzunluğu kaç santimetredir?`,value,unit:'cm',options:[value-labState.d,value,value+labState.d,value+2*labState.d]};
}
function refreshDisclosure(){
 const step=currentGuidedStep(),visible=resultsAreVisible(),task=discoveryTask(),key=discoveryKey();
 document.body.classList.toggle('question-pending',isQuestionPending());
 document.body.classList.toggle('results-hidden',!visible);
 document.body.dataset.scene=labState.freeSubMode;
 if(step)document.getElementById('cv-shape-chip').textContent=step.sceneMode.startsWith('ant')?'Dış yüzeyde yollar • A → B':step.chip||'Ayrıtları karşılaştırınız';
 const panel=document.getElementById('discovery-panel');panel.hidden=!!step?.question||!!(step&&!step.explore&&step.sceneMode!=='build8'&&!step.antCustom);
 const anchor=document.getElementById(task.ant?'ant-comparisons':'projection-overview');
 if(anchor.nextElementSibling!==panel)anchor.after(panel);
 document.getElementById('discovery-title').textContent=visible?'Tahmin ve sonuç':'Önce tahmin ediniz';
 document.getElementById('discovery-prompt').textContent=`Soru: ${task.prompt}`;
 const note=document.getElementById('discovery-answer-note');note.textContent=task.note||'';note.hidden=!task.note;
 const input=document.getElementById('discovery-input');input.hidden=!!task.ant||!!task.options;input.disabled=visible;
 input.value=discoveryDrafts.get(key)||'';
 const check=document.getElementById('discovery-check');check.textContent=task.ant?'Seçilen Yolu Kontrol Ediniz':'Tahmini Karşılaştırınız';check.hidden=visible;
 renderDiscoveryChoices(task,key,visible);
 renderDiscoveryFeedback(discoveryResponses.get(key));
 document.getElementById('proj-canvas').hidden=false;
}

function renderDiscoveryChoices(task,key,visible){
 const host=document.getElementById('discovery-options');host.hidden=!task.options;host.replaceChildren();
 const check=document.getElementById('discovery-check');
 check.disabled=!!task.options&&!task.options.includes(discoveryChoices.get(key));
 if(!task.options)return;
 task.options.forEach((value,index)=>{
  const button=document.createElement('button'),selected=discoveryChoices.get(key)===value;
  button.type='button';button.className='question-option';button.textContent=`${value} ${task.unit}`;
  button.setAttribute('aria-pressed',String(selected));button.disabled=visible;
  if(visible&&value===task.value)button.classList.add('correct');
  if(visible&&selected&&value!==task.value)button.classList.add('wrong');
  button.addEventListener('click',()=>{
   discoveryChoices.set(key,value);renderDiscoveryChoices(task,key,false);
   host.children[index].focus({preventScroll:true});
  });
  host.append(button);
 });
}

function renderDiscoveryFeedback(response){
 const feedback=document.getElementById('discovery-feedback');
 feedback.replaceChildren();feedback.hidden=!response;
 if(!response){delete feedback.dataset.tone;return;}
 if(typeof response==='string')response={tone:'info',title:'Tahmin karşılaştırması',message:response};
 feedback.dataset.tone=response.tone;
 const heading=document.createElement('strong');heading.className='feedback-heading';
 const icon=document.createElement('span');icon.className='feedback-icon';icon.setAttribute('aria-hidden','true');
 icon.textContent=response.tone==='success'?'✓':response.tone==='compare'?'↔':'!';
 heading.append(icon,document.createTextNode(response.title));feedback.append(heading);
 if(response.facts?.length){
  const facts=document.createElement('dl');facts.className='feedback-facts';
  for(const fact of response.facts){
   const row=document.createElement('div'),label=document.createElement('dt'),value=document.createElement('dd');
   label.textContent=fact.label;if(fact.route)ExactLength.render(value,fact.route);else value.textContent=fact.value;row.append(label,value);facts.append(row);
  }
  feedback.append(facts);
 }
 if(response.message){const message=document.createElement('p');message.textContent=response.message;feedback.append(message);}
}
function revealDiscoveryFeedback(){
 const feedback=document.getElementById('discovery-feedback');
 feedback.focus({preventScroll:true});
 feedback.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduceMotionQuery.matches?'instant':'smooth'});
}

// Uygulama 2 uses the same cube order and the same measured face at every stage.
function renderGuidedSuccess(step){
 MaterialMath.setText(elQFeedback,step.question.success);
 if(step.question.successFormula)SequenceActivities.appendFormula(elQFeedback,step.question.successFormula);
}
function isMeasurementHidden(index,measure){
 const step=currentGuidedStep();
 return !!step?.alwaysHiddenMeasurements?.[measure]?.includes(index)||(!resultsAreVisible()&&!!step?.hiddenMeasurements?.[measure]?.includes(index));
}
function appendMeasurementTable(host,captionText,labels,rows){
 const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=captionText;table.append(caption);
 const head=document.createElement('thead'),tr=document.createElement('tr');for(const label of labels){const cell=document.createElement('th');cell.scope='col';cell.textContent=label;tr.append(cell);}head.append(tr);table.append(head);
 const body=document.createElement('tbody');for(const values of rows){const row=document.createElement('tr');for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}body.append(row);}table.append(body);host.append(table);
}
function renderArithmeticRecord(terms){
 const host=document.getElementById('geo-record');host.replaceChildren();
 appendMeasurementTable(host,'Küçükten büyüğe ayrıt dizisi',['Sıra','Ayrıt uzunluğu'],terms.map((value,i)=>[i+1,isMeasurementHidden(i,'edges')?'?':`${value} cm`]));
 if(terms.some((_,i)=>isMeasurementHidden(i,'edges'))){const note=document.createElement('p');note.className='geo-record-note';note.textContent='Soru işaretli sütunun yüksekliği gizli ölçüyü temsil etmez. Ayrıtı genel terimle belirleyiniz.';host.append(note);}
}
function geometricAccessibleDescription(){
 const step=currentGuidedStep(),n=labState.geoStep,data=SequenceActivities.dataFor(step);
 if(step.geoView==='patterns')return step.series.map(s=>`${s.label}. dizilim: ${s.edges.join(', ')} santimetre`).join('. ');
 if(step.geoView==='edges'||((step.hideAreasUntilAnswer||step.geoView==='area-pair')&&!resultsAreVisible()))return `Küpler büyükten küçüğe. Ayrıtlar ${data.edges.slice(0,n).join(', ')} santimetre. Alanlar yanıt ve gerekçeden sonra gösterilir.`;
 return 'Sırayla küplerin birer kare ön yüzünün alanları: '+data.areas.slice(0,n).map((v,i)=>isMeasurementHidden(i,'areas')?'gizli ölçü':v).join(', ')+' santimetrekare.';
}
function addGeometricLabel(text,x,y){
 const surface=document.createElement('canvas');surface.width=128;surface.height=64;
 const ctx=surface.getContext('2d');ctx.fillStyle=isDarkTheme()?'#EDF3FF':'#142448';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.fillText(text,64,48);
 const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(surface),depthTest:false}));label.position.set(x,y,0);label.scale.set(5,2.5,1);stageGroup.add(label);
}
function renderGuidedGeometry(){
 const step=currentGuidedStep(),n=labState.geoStep,data=SequenceActivities.dataFor(step);
 const colors=data.cubeNumbers.map(number=>CUBE_PALETTE[number-1]);
 if(step.geoView==='patterns'){
  step.series.forEach((series,index)=>{
   let y=0;const x=(index-1)*16;
   [...series.edges].reverse().forEach(edge=>{const cube=createOpenHollowCube(edge,CUBE_PALETTE[Math.round(edge/2)-1],true);cube.position.set(x,y+edge,0);stageGroup.add(cube);y+=edge;});
   addGeometricLabel(series.label,x,y+2.5);
  });
 }else{
  let y=0;
  for(let i=0;i<n;i++){
   const edge=data.edges[i],cube=createOpenHollowCube(edge,colors[i],true);cube.position.set(0,y+edge,0);stageGroup.add(cube);y+=edge;
  }
  if(step.geoView==='area-pair'){
   const points=[new THREE.Vector3(-8,8,8.025),new THREE.Vector3(8,8,8.025),new THREE.Vector3(0,0,8.025),new THREE.Vector3(0,16,8.025)];
   stageGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:isDarkTheme()?0xffffff:0x142448})));
  }
 }
 document.getElementById('proj-title').textContent=step.geoView==='patterns'?'Üç farklı küp dizilimi':step.geoView==='edges'?'Küplerin ayrıt uzunlukları':'Küplerin birer kare ön yüzü';
 document.getElementById('geo-record').hidden=false;drawGuidedGeometricFaces(step,n);renderGeometricRecord(step,n);
}
function renderGeometricRecord(step,n){
 const host=document.getElementById('geo-record');host.replaceChildren();const data=SequenceActivities.dataFor(step),visible=resultsAreVisible();
 if(step.geoView==='patterns'){
  appendMeasurementTable(host,'Küçükten büyüğe ayrıtlar',['Dizilim','Ayrıtlar','Tür'],step.series.map(series=>[series.label,series.edges.join(', ')+' cm',visible?({geometric:'Geometrik',arithmetic:'Aritmetik',neither:'İki türe de uymaz'})[SequenceActivities.classify(series.edges)]:'?']));return;
 }
 const hideAll=(step.geoView==='area-pair'||step.hideAreasUntilAnswer)&&!visible,isEdges=step.geoView==='edges';
 appendMeasurementTable(host,'Büyükten küçüğe sıralama',isEdges?['Sıra','Takımdaki küp','Ayrıt']:['Sıra','Ayrıt','Bir ön yüzün alanı'],Array.from({length:n},(_,i)=>isEdges?[i+1,data.cubeNumbers[i],`${data.edges[i]} cm`]:[i+1,`${data.edges[i]} cm`,hideAll||isMeasurementHidden(i,'areas')?'?':`${data.areas[i]} cm²`]));
 const note=document.createElement('p');note.className='geo-record-note';note.textContent=isEdges?'Sıra numarası, seçilen küplerin büyükten küçüğe dizilişindeki yeridir.':'Aₙ, n. sıradaki tek küpün bir kare ön yüzünün alanıdır.';host.append(note);
}
function drawGuidedGeometricFaces(step,n){
 const W=projCanvas.width,H=projCanvas.height,dark=isDarkTheme(),data=SequenceActivities.dataFor(step);
 pCtx.clearRect(0,0,W,H);pCtx.fillStyle=dark?'#151C28':'#F4F6F9';pCtx.fillRect(0,0,W,H);
 const ink=dark?'#EDF3FF':'#142448',colors=data.cubeNumbers.map(number=>'#'+CUBE_PALETTE[number-1].toString(16).padStart(6,'0'));
 pCtx.fillStyle=ink;pCtx.font='bold 18px Arial';pCtx.textAlign='left';
 if(step.geoView==='patterns'){
  pCtx.fillText('Küçükten büyüğe →',18,25);
  step.series.forEach((series,row)=>{
   const base=102+row*88;pCtx.fillStyle=ink;pCtx.font='bold 25px Arial';pCtx.textAlign='left';pCtx.fillText(series.label,18,base-12);
   series.edges.forEach((edge,i)=>{
    const x=88+i*83,h=edge*4.5;pCtx.fillStyle='#'+CUBE_PALETTE[edge/2-1].toString(16).padStart(6,'0');pCtx.fillRect(x,base-h,38,h);pCtx.strokeStyle=ink;pCtx.lineWidth=1.5;pCtx.strokeRect(x,base-h,38,h);
    pCtx.fillStyle=ink;pCtx.font='bold 20px Arial';pCtx.textAlign='center';pCtx.fillText(`${edge} cm`,x+19,base-h-8);
   });
  });return;
 }
 pCtx.fillText('Büyükten küçüğe →',24,30);
 const pair=step.geoView==='area-pair',baseY=H-49;let x=pair?40:24;
 for(let i=0;i<n;i++){
  const size=data.edges[i]*(pair?10:8),y=baseY-size;
  pCtx.fillStyle=colors[i];pCtx.fillRect(x,y,size,size);pCtx.strokeStyle=ink;pCtx.lineWidth=2;
  pCtx.strokeRect(x,y,size,size);
  if(pair&&i===0){pCtx.beginPath();pCtx.moveTo(x+size/2,y);pCtx.lineTo(x+size/2,baseY);pCtx.moveTo(x,y+size/2);pCtx.lineTo(x+size,y+size/2);pCtx.stroke();}
  const showArea=step.geoView!=='edges'&&(!(pair||step.hideAreasUntilAnswer)||resultsAreVisible());
  pCtx.fillStyle=ink;pCtx.font='bold 22px Arial';pCtx.textAlign='center';pCtx.fillText(isMeasurementHidden(i,'areas')?'?':showArea?`${data.areas[i]} cm²`:`${data.edges[i]} cm`,x+size/2,y-12);
  pCtx.font='bold 19px Arial';pCtx.fillText(`${i+1}. sıra`,x+size/2,baseY+30);x+=size+(pair?88:42);
 }
}

function getPointAlongPolyline(pts, t) {
  const lens = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = pts[i].distanceTo(pts[i + 1]);
    lens.push(l);
    total += l;
  }
  let target = t * total;
  for (let i = 0; i < lens.length; i++) {
    if (target <= lens[i] || i === lens.length - 1) {
      const localT = lens[i] > 0 ? target / lens[i] : 0;
      return new THREE.Vector3().lerpVectors(pts[i], pts[i + 1], localT);
    }
    target -= lens[i];
  }
  return pts[0].clone();
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. SAĞ ALT 2B CANVAS ÇİZİM FONKSİYONLARI
═══════════════════════════════════════════════════════════════════════════ */
const projCanvas = document.getElementById('proj-canvas');
const pCtx = projCanvas.getContext('2d');

function draw2DArithmetic(terms) {
  const W = projCanvas.width, H = projCanvas.height;
  pCtx.clearRect(0, 0, W, H);
  const dark = isDarkTheme();
  pCtx.fillStyle = dark ? '#151C28' : '#F4F6F9';
  pCtx.fillRect(0, 0, W, H);

  // Izgara
  pCtx.strokeStyle = dark ? 'rgba(113,131,166,0.22)' : 'rgba(113,130,164,0.22)';
  pCtx.lineWidth = 1;
  for (let x = 30; x < W; x += 40) {
    pCtx.beginPath(); pCtx.moveTo(x, 15); pCtx.lineTo(x, H - 35); pCtx.stroke();
  }
  for (let y = 25; y < H - 30; y += 35) {
    pCtx.beginPath(); pCtx.moveTo(25, y); pCtx.lineTo(W - 15, y); pCtx.stroke();
  }

  // Sütunlar (Her küpün ayrıtı f(n) = a_n)
  const n = terms.length;
  const maxVal = Math.max(...terms, 20);
  const availW = W - 60;
  const barW = Math.min(36, (availW / n) - 8);
  const baseY = H - 44;

  terms.forEach((val, idx) => {
    const x = 35 + idx * (availW / n);
    const barH = isMeasurementHidden(idx,'edges')?72:(val / maxVal) * (H - 110);
    const y = baseY - barH;
    const hexStr = '#' + CUBE_PALETTE[idx % 10].toString(16).padStart(6, '0');

    pCtx.fillStyle = hexStr;
    pCtx.fillRect(x, y, barW, barH);
    pCtx.strokeStyle = dark ? '#EDF3FF' : '#142448';
    pCtx.lineWidth = 1.5;
    pCtx.strokeRect(x, y, barW, barH);

    pCtx.fillStyle = dark ? '#EDF3FF' : '#142448';
    pCtx.font = 'bold 23px Segoe UI, sans-serif';
    pCtx.textAlign = 'center';
    pCtx.fillText(isMeasurementHidden(idx,'edges')?'?':`${val}`, x + barW / 2, y - 8);

    pCtx.fillStyle = dark ? '#ACBBD7' : '#596786';
    pCtx.font = 'bold 22px Segoe UI, sans-serif';
    const index=String(idx+1).replace(/[0-9]/g,digit=>'₀₁₂₃₄₅₆₇₈₉'[Number(digit)]);
    pCtx.fillText(`a${index}`, x + barW / 2, baseY + 28);
  });

  pCtx.fillStyle = dark ? '#A2BDFF' : '#285CD1';
  pCtx.font = 'bold 15px Consolas, monospace';
  pCtx.textAlign = 'right';
}

function draw2DGeometric(stepN) {
  const W = projCanvas.width, H = projCanvas.height;
  pCtx.clearRect(0, 0, W, H);
  const dark = isDarkTheme();
  pCtx.fillStyle = dark ? '#151C28' : '#F4F6F9';
  pCtx.fillRect(0, 0, W, H);

  const items = [
    { label: '4⁴=256', sz: 128, col: '#ea580c' },
    { label: '4³=64',  sz: 64,  col: '#7c3aed' },
    { label: '4²=16',  sz: 32,  col: '#0d9488' },
    { label: '4¹=4',   sz: 16,  col: '#2563eb' }
  ];
  let curX = 28;
  const baseY = H - 36;

  for (let i = 0; i < stepN; i++) {
    const it = items[i];
    const y = baseY - it.sz;
    pCtx.fillStyle = it.col;
    pCtx.fillRect(curX, y, it.sz, it.sz);
    pCtx.strokeStyle = dark ? '#EDF3FF' : '#142448';
    pCtx.lineWidth = 2;
    pCtx.strokeRect(curX, y, it.sz, it.sz);

    pCtx.fillStyle = dark ? '#EDF3FF' : '#142448';
    pCtx.font = 'bold 21px Consolas, monospace';
    pCtx.textAlign = 'center';
    pCtx.fillText(it.label, curX + it.sz / 2, y - 7);
    curX += it.sz + 40;
  }

  pCtx.fillStyle = dark ? '#A2BDFF' : '#285CD1';
  pCtx.font = 'bold 15px Consolas, monospace';
  pCtx.textAlign = 'right';
}

/* ═══════════════════════════════════════════════════════════════════════════
   7. SERBEST MOD KONTROLLERİ
═══════════════════════════════════════════════════════════════════════════ */
window.setFreeMode = function(mode) {
  stopAntWalk();
  labState.freeSubMode = mode;
  if(mode==='antRow')antPickTarget=labState.antPoints[0]?(labState.antPoints[1]?null:1):0;
  document.querySelectorAll('#side-panel .ctrl-btn').forEach(b => {
    if (b.id.startsWith('btn-mode-')) b.classList.remove('active');
  });
  const activeBtn = document.getElementById(`btn-mode-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');
  document.querySelectorAll('[id^=btn-mode-]').forEach(b=>b.setAttribute('aria-pressed',String(b===activeBtn)));

  const s1 = document.getElementById('param1-slider');
  const s2 = document.getElementById('param2-slider');
  const l1 = document.getElementById('slider1-label');
  const l2 = document.getElementById('slider2-label');
  const v1 = document.getElementById('free-s1-val');
  const v2 = document.getElementById('free-s2-val');

  if (mode === 'antRow') {
    l1.textContent = '🐜 Karınca Yürüyüş İlerleyişi (%)';
    s1.min = 0; s1.max = 100; s1.value = labState.antProgress;
    v1.textContent = `%${labState.antProgress}`;
  } else if (mode === 'geo' || mode === 'build8') {
    l1.textContent = '🌸 Geometrik Küp Adımı (n)';
    s1.min = 1; s1.max = 4; s1.value = labState.geoStep;
    v1.textContent = `n = ${labState.geoStep}`;
  } else {
    l1.textContent = '🎚️ Ortak Fark (d — Artış Miktarı)';
    s1.min = 1; s1.max = 6; s1.value = labState.d;
    v1.textContent = `d = ${labState.d} cm`;
  }

  s2.closest('.slider-row').hidden = ['geo','build8','antRow'].includes(mode);
  s1.closest('.slider-row').hidden = mode === 'build8' || mode === 'antRow';
  l2.textContent = '📏 Seçili Küp Sayısı (n)';
  s2.min = 2; s2.max = 10; s2.value = labState.nCount;
  v2.textContent = `n = ${labState.nCount} küp`;

  renderActiveSceneAndHUD();
};

window.applyFreePreset = function(preset) {
  if (preset === 'odd5') {
    labState.a1 = 2; labState.d = 4; labState.nCount = 5;
    window.setFreeMode('tower');
  } else if (preset === 'all10') {
    labState.a1 = 2; labState.d = 2; labState.nCount = 10;
    window.setFreeMode('nested');
  }
};

window.toggleCrossSection = function() {
  if(labState.freeSubMode==='antRow')return;
  clippingActive = !clippingActive;
  allStageMeshes.forEach(m => {
    if (m.material) {
      m.material.clippingPlanes = clippingActive ? [clipPlane] : [];
      m.material.needsUpdate = true;
    }
  });
  const btn = document.getElementById('clip-btn');
  btn.classList.toggle('active', clippingActive);
  btn.setAttribute('aria-pressed',String(clippingActive));
  btn.querySelector('span:last-of-type').textContent = clippingActive ? 'Küpleri Birleştiriniz' : 'İç Kesiti Ayırınız';
};

window.toggleWireframe = function() {
  if(labState.freeSubMode==='antRow')return;
  wireframeOn = !wireframeOn;
  allStageMeshes.forEach(m => {
    if (m.material) m.material.wireframe = wireframeOn;
  });
  document.getElementById('wireframe-btn').classList.toggle('active', wireframeOn);
  document.getElementById('wireframe-btn').setAttribute('aria-pressed',String(wireframeOn));
};

window.setCameraView = function(view) {
  if (view === 'front') {
    camera.position.set(0, 12, 65);
  } else if (view === 'top') {
    camera.position.set(0, 68, 4);
  } else {
    camera.position.set(42, 32, 58);
  }
  stageGroup.rotation.set(0,0,0);
  fitScene(view);
  controls.update();
};

document.getElementById('param1-slider').addEventListener('input', function() {
  const val = Number(this.value);
  const mode = labState.freeSubMode;
  if (mode === 'antRow') {
    labState.antProgress = val;
    document.getElementById('free-s1-val').textContent = `%${val}`;
  } else if (mode === 'geo' || mode === 'build8') {
    labState.geoStep = val;
    document.getElementById('free-s1-val').textContent = `n = ${val}`;
  } else {
    labState.d = val;
    document.getElementById('free-s1-val').textContent = `d = ${val} cm`;
  }
  renderActiveSceneAndHUD();
});

document.getElementById('param2-slider').addEventListener('input', function() {
  labState.nCount = Number(this.value);
  document.getElementById('free-s2-val').textContent = `n = ${labState.nCount} küp`;
  renderActiveSceneAndHUD();
});

/* ═══════════════════════════════════════════════════════════════════════════
   8. ADIM ADIM UYGULAMA SİHİRBAZI (Uygulama 1, 2 ve 3 Müfredatı - Kılavuz)
═══════════════════════════════════════════════════════════════════════════ */
const MODULES = {
  u1: SequenceActivities.arithmeticModule,

  u2: SequenceActivities.module,

  u3: {
    title:'Uygulama 3: Atom Karınca',watermark:'ATOM KARINCA',
    steps:[
      {
        title:'Bir küpün yüzeyinde iki karşıt köşe',sceneMode:'antRow',antCount:1,antEdge:6,antStart:0,antEnd:7,antProgress:0,
        chip:'1 küp • ayrıt 6 cm • A → B',
        body:'<p>A, küpün sol alt ön köşesi; B, sağ üst arka köşesidir. Karınca yalnız dış yüzeyde yürüyebilir.</p><p>Komşu yüzlerin açınımlarını inceleyiniz. Küpün 6 cm’lik ayrıtından yararlanarak açınımın kenarlarını ve A–B yolunun uzunluğunu bulunuz.</p>',
        question:{label:'Ayrıt uzunluğu 6 cm olan küpün karşıt köşelerindeki A ve B noktaları arasında, yalnızca küpün dış yüzeyinde yürüyen karıncanın alabileceği en kısa yol kaç santimetredir?',options:['6 cm','6√2 cm','6√3 cm','6√5 cm'],answers:['6√5 cm'],success:'✓ 12² + 6² = 180. En kısa yüzey yolu √180 = 6√5 cm’dir. Üç açınım da aynı uzunluğu verir.',hint:'Açınımda 12 cm ve 6 cm dik kenarları olan üçgeni kullanınız.'}
      },
      {
        title:'İki küp yan yana',sceneMode:'antRow',antCount:2,antEdge:6,antStart:0,antEnd:7,antProgress:0,
        chip:'2 küp • birleşik cisim 12 × 6 × 6 cm',
        body:'<p>A, en soldaki küpün alt ön köşesi; B, en sağdaki küpün üst arka köşesidir. Alternatif yolları seçerek her yolun geçtiği yüzleri ve bu yüzlerin açınımını inceleyiniz.</p>',
        question:{label:'Ayrıt uzunluğu 6 cm olan iki eş küp, birer yüzleri tamamen çakışacak biçimde yan yana yerleştiriliyor. Oluşan cismin karşıt köşelerindeki A ve B noktaları arasında, yalnızca dış yüzeyde yürüyen karıncanın alabileceği en kısa yol kaç santimetredir?',options:['12 cm','12√2 cm','6√10 cm','12√5 cm'],answers:['12√2 cm'],success:'✓ 18² + 6² = 360; 12² + 12² = 288. Küçük olan √288 = 12√2 cm’dir. Tek bir açınımı hesaplamak yeterli değildir.',hint:'İki açınım için Pisagor toplamlarını karşılaştırınız.'}
      },
      {
        title:'Üç küpte yol nasıl değişir?',sceneMode:'antRow',antCount:3,antEdge:6,antStart:0,antEnd:7,antProgress:0,
        chip:'3 küp • birleşik cisim 18 × 6 × 6 cm',
        body:'<p>Aynı ayrıt uzunluğuna sahip üçüncü bir küp eklenmiştir. A ve B yine birleşik cismin karşıt köşeleridir.</p><p>Küplerin 6 cm’lik ayrıtlarından yararlanarak alternatif açınımların kenarlarını bulunuz ve yolları karşılaştırınız. Küp sayısının artması yolun aynı oranda artmasını gerektirir mi?</p>',
        question:{label:'Ayrıt uzunluğu 6 cm olan üç eş küp, komşu yüzleri tamamen çakışacak biçimde düz bir sıra oluşturuyor. Oluşan cismin karşıt köşelerindeki A ve B noktaları arasında, yalnızca dış yüzeyde yürüyen karıncanın alabileceği en kısa yol kaç santimetredir?',options:['18 cm','6√13 cm','6√17 cm','18√5 cm'],answers:['6√13 cm'],success:'✓ 24² + 6² = 612; 12² + 18² = 468. En kısa yol √468 = 6√13 cm’dir; tek küpteki yolun üç katı değildir.',hint:'İki açınımın köşegenlerini hesaplayın; daha küçük olanı seçiniz.'}
      },
      {
        title:'Yüzeyde iki kafes noktası seçiniz',sceneMode:'antRow',antCustom:true,antCount:1,antEdge:6,antStart:0,antEnd:7,antPoints:[null,null],antRouteIndex:0,antProgress:0,final:true,
        chip:'1–4 küp • yüzey üzerinde A ve B seçiniz',
        body:'<p>Küp sayısını ve ayrıtı belirleyiniz. Yüzeydeki 1 cm aralıklı kafesten iki nokta seçiniz: ilk nokta A, ikincisi B olur. Dokunuşunuz en yakın kafes noktasına yerleşir. Görünmeyen yüzlere ulaşmak için modeli sürükleyerek döndürünüz.</p><p>Alternatif yolların açınımlarını inceleyiniz. En kısa olduğunu düşündüğünüz yolu seçip yanıtınızı kontrol ediniz; ardından uzunlukları karşılaştırınız.</p>',
        reflectionPrompt:'Seçtiğiniz A ve B noktaları arasındaki en kısa yolu nasıl buldunuz? Küp sayısı değiştirildiğinde hangi ölçüler değişmiştir? Açınımları karşılaştırarak açıklayınız.'
      }
    ]
  }
};

for(const mod of Object.values(MODULES)) mod.steps.forEach((step,i)=>{
 step.badge=`Adım ${i+1} / ${mod.steps.length}`;
 if(step.question) step.question.success=step.question.success.replace(' ve Kilitlendi','');
});

let activeModuleKey = 'u1';
let currentStepIdx = 0;
const solvedMap = { u1: new Set(), u2: new Set(), u3: new Set() };
const reflectionMap = { u1: '', u2: '', u3: '' };
const answerAccepted=new Set(),reasonChoices=new Map();
const answerMap={}; const exploreMap={};
const discoveryResponses=new Map(),discoveryDrafts=new Map(),discoveryChoices=new Map();
const sectionSteps={u1:0,u2:0,u3:0};
let freeWorkspace=null;
let antCustomState=null;

const elStepTitle     = document.getElementById('step-title');
const elStepBody      = document.getElementById('step-body');
const elStepBadge     = document.getElementById('step-badge');
const elBtnPrev       = document.getElementById('btn-prev');
const elBtnNext       = document.getElementById('btn-next');
const elBtnReplay     = document.getElementById('btn-replay');
const elQWrap         = document.getElementById('question-wrap');
const elQLabel        = document.getElementById('question-label');
const elQOptions      = document.getElementById('question-options');
const elQInputRow     = document.getElementById('question-input-row');
const elQInput        = document.getElementById('question-input');
const elQBtn          = document.getElementById('question-btn');
const elQFeedback     = document.getElementById('question-feedback');
const elExploreWrap   = document.getElementById('explore-wrap');
const elExploreSlider = document.getElementById('explore-slider');
const elExploreLabel  = document.getElementById('explore-angle-label');
const elReflectWrap   = document.getElementById('reflection-wrap');
const elReflectInput  = document.getElementById('reflection-input');

function normalizeAns(s) {
  return String(s).toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/\s+/g, ' ').trim();
}

function launchSection(target) {
  stopAntWalk();
  if(labState.viewMode.startsWith('u'))sectionSteps[activeModuleKey]=currentStepIdx;
  if(labState.viewMode==='free')freeWorkspace=JSON.parse(JSON.stringify(labState));
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('workspace-scroll').scrollTop=0;

  document.querySelectorAll('[data-nav]').forEach(b => {
    b.classList.toggle('current', b.dataset.nav === target);
    if(b.dataset.nav===target)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
  });

  if (target === 'free') {
    if(freeWorkspace)Object.assign(labState,JSON.parse(JSON.stringify(freeWorkspace)));
    labState.viewMode = 'free';
    antPickTarget=labState.antPoints[0]?(labState.antPoints[1]?null:1):0;
    document.body.classList.remove('guided-active');
    document.getElementById('watermark-text').className = '';
    window.setFreeMode(labState.freeSubMode);
    setTimeout(resize, 30);
    return;
  }

  labState.viewMode = target;
  activeModuleKey = target;
  currentStepIdx = sectionSteps[target]||0;
  document.body.classList.add('guided-active');
  renderGuidedStep();
  setTimeout(resize, 30);
}

function renderGuidedStep() {
  stopAntWalk();
  const mod = MODULES[activeModuleKey];
  const step = mod.steps[currentStepIdx];
  const isSolved = solvedMap[activeModuleKey].has(currentStepIdx);
  const accepted=isSolved||answerAccepted.has(guidedAnswerKey());

  document.getElementById('panel-title').textContent = mod.title;
  elStepTitle.textContent = step.title;
  elStepBody.innerHTML = step.body;
  elStepBadge.textContent = step.badge;

  document.getElementById('cv-badge').textContent = `${mod.title} · ${step.badge}`;
  document.getElementById('cv-shape-chip').textContent = step.chip || '';
  const wm = document.getElementById('watermark-text');
  wm.textContent = mod.watermark;
  wm.className = 'show';

  // Sahne parametrelerini adıma göre ayarla
  if (step.a1 !== undefined) labState.a1 = step.a1;
  if (step.d !== undefined) labState.d = step.d;
  if (step.nCount !== undefined) labState.nCount = step.nCount;
  if (step.geoStep !== undefined) labState.geoStep = step.geoStep;
  for(const key of ['antCount','antEdge','antStart','antEnd','antProgress','antPoints','antRouteIndex']) {
    if(step[key]!==undefined)labState[key]=step.antCustom && antCustomState ? antCustomState[key] : step[key];
  }
  if(step.explore && exploreMap[activeModuleKey+':'+currentStepIdx]!==undefined) labState[step.explore.param]=exploreMap[activeModuleKey+':'+currentStepIdx];
  labState.freeSubMode = step.sceneMode;
  labState.antRouteIndex=step.antCustom?labState.antRouteIndex:0;
  if(step.antCustom)antPickTarget=labState.antPoints[0]?(labState.antPoints[1]?null:1):0;
  renderActiveSceneAndHUD();

  // Keşfet sürgüsü
  if (step.explore) {
    elExploreWrap.classList.add('on');
    document.getElementById('explore-slider-title').textContent = `🎚️ ${step.explore.label}`;
    elExploreSlider.min = step.explore.min;
    elExploreSlider.max = step.explore.max;
    elExploreSlider.value = labState[step.explore.param];
    elExploreLabel.textContent = `${elExploreSlider.value}`;
  } else {
    elExploreWrap.classList.remove('on');
  }

  // Soru bloğu (Bitir/Onaylayınız sonrası kilitlenir - Bölüm 3 & 8)
  elQWrap.classList.toggle('on', !!step.question);
  elQInput.value = answerMap[activeModuleKey+':'+currentStepIdx] || '';
  elQInput.className = '';
  elQFeedback.className = '';
  elQFeedback.textContent = '';

  if (step.question) {
    MaterialMath.setText(elQLabel,`Soru: ${step.question.label}`);
    const hasOpts = Array.isArray(step.question.options);
    elQOptions.classList.toggle('geo-options',['u1','u2'].includes(activeModuleKey));
    elQOptions.classList.toggle('on', hasOpts);
    elQInputRow.style.display = hasOpts ? 'none' : 'flex';
    document.getElementById('sqrt-btn').style.display = activeModuleKey === 'u3' ? '' : 'none';
    elQOptions.replaceChildren();

    if (hasOpts) {
      step.question.options.forEach((opt,optionIndex) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'question-option';
        if(step.question.formulaOptions){SequenceActivities.appendFormula(b,step.question.formulaOptions[optionIndex]);}
        else MaterialMath.setText(b,opt);
        b.setAttribute('aria-label',opt);
        b.disabled = accepted;
        if (accepted && step.question.answers.some(a => normalizeAns(a) === normalizeAns(opt))) {
          b.classList.add('correct');
        }
        b.addEventListener('click', () => {
          elQInput.value = opt;
          checkGuidedAnswer(b);
        });
        elQOptions.appendChild(b);
      });
    }

    elQInput.disabled = accepted;
    elQBtn.disabled = accepted;
    elQInput.placeholder = isSolved ? '🔒 Bu adım onaylandı ve kilitlendi' : 'Cevabınızı yazınız…';
    if(accepted&&!isSolved)elQFeedback.textContent='Yanıtınız kaydedildi. Bu yanıtı destekleyen gerekçeyi seçiniz.';
    if (isSolved) {
      elQFeedback.className = 'fb-ok';
      renderGuidedSuccess(step);
    }
  }

  renderReasonChoices(step);

  // Yansıtıcı Not
  if (step.final && step.reflectionPrompt) {
    elReflectWrap.classList.add('on');
    elReflectWrap.querySelector('label').textContent = `✍️ Yansıtıcı Not: ${step.reflectionPrompt}`;
    elReflectInput.value = reflectionMap[activeModuleKey] || '';
    elReflectInput.disabled = false;
  } else {
    elReflectWrap.classList.remove('on');
  }

  elBtnPrev.disabled = currentStepIdx === 0;
  elBtnNext.disabled = (!!step.question && !isSolved);
  elBtnNext.textContent = (step.final && (!step.question || isSolved)) ? 'Serbest Moda Geçiniz →' : 'İleri ▶';
  // Değerlendirme kilitlendiyse sıfırlama düğmesi cevabı sıfırlamaz
  elBtnReplay.disabled = false;
  document.getElementById('step-content').scrollTop=0;
  if(window.matchMedia('(max-width:650px)').matches)document.getElementById('workspace-scroll').scrollTop=0;
}

function guidedAnswerKey(){return activeModuleKey+':'+currentStepIdx;}
function learningContext(){
 const mode=labState.freeSubMode;
 if(mode==='geo')return {mode,n:labState.geoStep,edges:SequenceActivities.dataFor(currentGuidedStep()).edges.slice(0,labState.geoStep)};
 if(mode==='antRow')return {mode,count:labState.antCount,edge:labState.antEdge};
 return {mode,n:labState.nCount,firstEdge:labState.a1,difference:labState.d};
}
function recordGuidedAttempt(stage,choice,correct){
 const step=currentGuidedStep(),key=guidedAnswerKey();
 LearningRecord.record({key:key+':'+stage,section:activeModuleKey,step:step.id||step.title,stage,prompt:stage==='reason'?step.reason.prompt:step.question.label,choice,correct,context:learningContext()});
}
function renderReasonChoices(step){
 const wrap=document.getElementById('reason-wrap'),key=guidedAnswerKey(),solved=solvedMap[activeModuleKey].has(currentStepIdx);
 wrap.hidden=!step?.reason||!answerAccepted.has(key);if(wrap.hidden)return;
 document.getElementById('reason-prompt').textContent=step.reason.prompt;
 const host=document.getElementById('reason-options');host.replaceChildren();
 const feedback=document.getElementById('reason-feedback');feedback.textContent='';feedback.className='';
 step.reason.options.forEach((option,index)=>{
  const button=document.createElement('button');button.type='button';button.className='question-option';button.textContent=option;button.disabled=solved;
  if(reasonChoices.get(key)===index)button.classList.add(solved?'correct':'wrong');
  button.addEventListener('click',()=>{
   if(solvedMap[activeModuleKey].has(currentStepIdx))return;
   const correct=index===step.reason.answer;reasonChoices.set(key,index);recordGuidedAttempt('reason',option,correct);
   if(correct){completeGuidedAnswer(step);}
   else{button.classList.add('wrong');feedback.className='fb-err';feedback.textContent='Bu gerekçe seçtiğiniz yanıtı desteklemiyor. '+step.reason.hint;feedback.focus({preventScroll:true});feedback.scrollIntoView({block:'nearest',behavior:reduceMotionQuery.matches?'instant':'smooth'});}
  });host.append(button);
 });
}
function completeGuidedAnswer(step){
 solvedMap[activeModuleKey].add(currentStepIdx);
 elQInput.disabled=true;elQBtn.disabled=true;elQOptions.querySelectorAll('button').forEach(button=>button.disabled=true);
 elQFeedback.className='fb-ok';renderGuidedSuccess(step);renderReasonChoices(step);elBtnNext.disabled=false;
 if(step.final)elBtnNext.textContent='Serbest Moda Geçiniz →';
 renderActiveSceneAndHUD();
 if(['u1','u2'].includes(activeModuleKey)){elQFeedback.tabIndex=-1;elQFeedback.focus({preventScroll:true});elQFeedback.scrollIntoView({block:'nearest',behavior:reduceMotionQuery.matches?'instant':'smooth'});}
}
function checkGuidedAnswer(clickedBtn=null){
 const step=currentGuidedStep(),key=guidedAnswerKey();
 if(!step.question||solvedMap[activeModuleKey].has(currentStepIdx)||answerAccepted.has(key))return;
 answerMap[key]=elQInput.value;
 const value=normalizeAns(elQInput.value),correct=step.question.answers.some(a=>normalizeAns(a)===value)||(step.question.numericValue!==undefined&&SequenceActivities.matchesNumeric(step.question,elQInput.value));
 recordGuidedAttempt('answer',elQInput.value,correct);
 elQInput.className=correct?'correct':'wrong';if(clickedBtn)clickedBtn.classList.add(correct?'correct':'wrong');
 if(correct){
  answerAccepted.add(key);
  if(step.reason){
   elQInput.disabled=true;elQBtn.disabled=true;elQOptions.querySelectorAll('button').forEach(button=>button.disabled=true);
   elQFeedback.className='';elQFeedback.textContent='Yanıtınız kaydedildi. Bu yanıtı destekleyen gerekçeyi seçiniz.';
   renderReasonChoices(step);const heading=document.getElementById('reason-title');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:reduceMotionQuery.matches?'instant':'smooth'});
  }else completeGuidedAnswer(step);
 }else{
  elQFeedback.className='fb-err';elQFeedback.textContent='Henüz doğru değil. '+step.question.hint;
  if(['u1','u2'].includes(activeModuleKey)){elQFeedback.tabIndex=-1;elQFeedback.focus({preventScroll:true});elQFeedback.scrollIntoView({block:'nearest',behavior:reduceMotionQuery.matches?'instant':'smooth'});}
 }
}

// Adım içi Keşfet Sürgüsü Dinleyicisi
elExploreSlider.addEventListener('input', () => {
  const mod = MODULES[activeModuleKey];
  const step = mod.steps[currentStepIdx];
  if (!step.explore) return;
  const val = Number(elExploreSlider.value);
  elExploreLabel.textContent = `${val}`;
  exploreMap[activeModuleKey+':'+currentStepIdx]=val;
  labState[step.explore.param] = val;
  renderActiveSceneAndHUD();
});

elBtnPrev.addEventListener('click', () => {
  if (currentStepIdx > 0) {
    currentStepIdx--;
    renderGuidedStep();
  }
});

elBtnNext.addEventListener('click', () => {
  const mod = MODULES[activeModuleKey];
  if (currentStepIdx === mod.steps.length - 1 && (!mod.steps[currentStepIdx].question || solvedMap[activeModuleKey].has(currentStepIdx))) {
    launchSection('free');focusWorkspace();
    return;
  }
  if (currentStepIdx < mod.steps.length - 1) {
    currentStepIdx++;
    renderGuidedStep();
  }
});

elBtnReplay.addEventListener('click', () => {
  stageGroup.rotation.set(0,0,0);
  fitScene();
});

elQBtn.addEventListener('click', () => checkGuidedAnswer());
elQInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkGuidedAnswer(); });

document.getElementById('sqrt-btn').addEventListener('click', () => {
  if (elQInput.disabled) return;
  const pos = elQInput.selectionStart ?? elQInput.value.length;
  const v = elQInput.value;
  elQInput.value = v.slice(0, pos) + '√' + v.slice(pos);
  elQInput.focus();
});

function rememberAntCustom() {
  if(labState.viewMode==='u3' && MODULES.u3.steps[currentStepIdx].antCustom)antCustomState=Object.fromEntries(['antCount','antEdge','antStart','antEnd','antProgress','antPoints','antRouteIndex'].map(key=>[key,labState[key]]));
}
function commitAntPoint(normalized) {
  if(antPickTarget===null||!isAntCustom()||labState.freeSubMode!=='antRow')return;
  stopAntWalk();
  const target=antPickTarget,dimensions=[labState.antCount*labState.antEdge,labState.antEdge,labState.antEdge];
  normalized=AntLattice.snap(normalized.map((v,i)=>v*dimensions[i]),dimensions).map((v,i)=>v/dimensions[i]);
  labState.antPoints=labState.antPoints.map((p,i)=>i===target?normalized:p);
  antPickTarget=labState.antPoints[1-target]?null:1-target;
  labState.antProgress=0;labState.antRouteIndex=0;rememberAntCustom();redrawAntPreservingCamera();
}
for(const [id,key] of [['ant-count','antCount'],['ant-edge','antEdge']]) {
  document.getElementById(id).addEventListener('change',event=>{stopAntWalk();labState[key]=Number(event.target.value);labState.antProgress=0;labState.antRouteIndex=0;rememberAntCustom();renderActiveSceneAndHUD();});
}
for(const i of [0,1])document.getElementById(i?'ant-pick-b':'ant-pick-a').addEventListener('click',()=>{antPickTarget=i;stopAntWalk();redrawAntPreservingCamera();});
document.getElementById('ant-reset-points').addEventListener('click',()=>{stopAntWalk();labState.antPoints=[null,null];labState.antRouteIndex=0;labState.antProgress=0;antPickTarget=0;rememberAntCustom();redrawAntPreservingCamera();});
const antRaycaster=new THREE.Raycaster();let antPointerDown=null;
const antPointerIds=new Set();let antMultiGesture=false;
canvas.addEventListener('pointerdown',event=>{
  antPointerIds.add(event.pointerId);
  if(antPointerIds.size>1){antMultiGesture=true;antPointerDown=null;return;}
  antPointerDown={id:event.pointerId,x:event.clientX,y:event.clientY,time:performance.now()};
},{passive:true});
canvas.addEventListener('pointercancel',event=>{antPointerIds.delete(event.pointerId);if(!antPointerIds.size)antMultiGesture=false;antPointerDown=null;},{passive:true});
canvas.addEventListener('pointerup',event=>{
  const down=antPointerDown,multi=antMultiGesture;antPointerDown=null;
  antPointerIds.delete(event.pointerId);if(!antPointerIds.size)antMultiGesture=false;
  if(multi||!down||down.id!==event.pointerId||event.button!==0||Math.hypot(event.clientX-down.x,event.clientY-down.y)>7||performance.now()-down.time>800||labState.freeSubMode!=='antRow'||!isAntCustom()||antPickTarget===null)return;
  const rect=canvas.getBoundingClientRect();
  stageGroup.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  antRaycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,1-(event.clientY-rect.top)/rect.height*2),camera);
  const hit=antRaycaster.intersectObjects(allStageMeshes,false)[0];
  if(!hit){document.getElementById('ant-pick-status').textContent='Nokta seçilemedi. Renkli cismin bir yüzeyine dokununuz.';return;}
  const local=stageGroup.worldToLocal(hit.point.clone()),dimensions=[labState.antCount*labState.antEdge,labState.antEdge,labState.antEdge];
  const point=[(local.x+dimensions[0]/2)/dimensions[0],local.y/dimensions[1],(dimensions[2]/2-local.z)/dimensions[2]].map(v=>Math.max(0,Math.min(1,v)));
  let boundary=-1,best=Infinity;
  point.forEach((v,i)=>{const distance=Math.min(v,1-v);if(distance<best){best=distance;boundary=i;}});
  if(best>1e-5){document.getElementById('ant-pick-status').textContent='Yalnız cismin dış yüzeyleri seçilebilir.';return;}
  point[boundary]=point[boundary]<.5?0:1;commitAntPoint(point);
},{passive:true});
document.getElementById('ant-apply-point').addEventListener('click',()=>{
  if(antPickTarget===null)antPickTarget=0;
  const dimensions=[labState.antCount*labState.antEdge,labState.antEdge,labState.antEdge],face=Number(document.getElementById('ant-face').value),axes=AntLattice.faceAxes(face),u=Number(document.getElementById('ant-face-u').value)/dimensions[axes[0]],v=Number(document.getElementById('ant-face-v').value)/dimensions[axes[1]];
  commitAntPoint(AntSurface.facePoint([1,1,1],face,u,v));
});
document.getElementById('ant-face').addEventListener('change',syncAntLatticeControls);
for(const id of ['ant-face-u','ant-face-v'])document.getElementById(id).addEventListener('input',syncAntLatticeControls);


document.getElementById('ant-walk-progress').addEventListener('input',event=>{stopAntWalk();labState.antProgress=Number(event.target.value);rememberAntCustom();updateAntPose();if(labState.viewMode==='free'){document.getElementById('param1-slider').value=labState.antProgress;document.getElementById('free-s1-val').textContent=`%${Math.round(labState.antProgress)}`;}});
document.getElementById('ant-walk-button').addEventListener('click',()=>{
  if(antWalking){stopAntWalk();return;}
  if(!antDrawing)return;
  if(labState.antProgress>=100)labState.antProgress=0;
  antWalking=true;lastAntTime=0;document.getElementById('ant-walk-button').textContent='❚❚ Duraklatınız';
});
reduceMotionQuery.addEventListener('change',()=>{stopAntWalk();if(antDrawing)renderActiveSceneAndHUD();});

/* ═══════════════════════════════════════════════════════════════════════════
   9. PORTAL, NAVİGASYON, KLAVYE VE ÖNİZLEME (?onizleme=1) DİNLEYİCİLERİ
═══════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('[data-launch]').forEach(btn => {
  btn.addEventListener('click', () => launchSection(btn.dataset.launch));
});

document.querySelectorAll('[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => launchSection(btn.dataset.nav));
});

document.getElementById('guide-open-btn').addEventListener('click', () => {
  document.getElementById('intro').classList.remove('hidden');
});

// Mobil Araç Çekmecesi
const mobileToggle = document.getElementById('mobile-tools-toggle');
const sidePanel = document.getElementById('side-panel');
mobileToggle.addEventListener('click', () => {
  const open = !sidePanel.classList.contains('mobile-open');
  sidePanel.classList.toggle('mobile-open', open);
  mobileToggle.setAttribute('aria-expanded', String(open));
});

// 3B Canvas Klavye Erişimi (M4: Yön tuşları ve +/-)
canvas.addEventListener('keydown', e => {
  const rotStep = 0.08;
  if(e.shiftKey && e.key.startsWith('Arrow')){e.preventDefault();const delta=new THREE.Vector3(e.key==='ArrowLeft'?-2:e.key==='ArrowRight'?2:0,e.key==='ArrowDown'?-2:e.key==='ArrowUp'?2:0,0);camera.position.add(delta);controls.target.add(delta);return;}
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stageGroup.rotation.y -= rotStep;
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    stageGroup.rotation.y += rotStep;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    camera.position.y = Math.min(95, camera.position.y + 4);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    camera.position.y = Math.max(8, camera.position.y - 4);
  } else if (e.key === '+' || e.key === '=') {
    e.preventDefault();
    camera.position.multiplyScalar(0.92);
  } else if (e.key === '-' || e.key === '_') {
    e.preventDefault();
    camera.position.multiplyScalar(1.08);
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   10. GÜVENLİ TEMA UYGULAMA VE POSTMESSAGE ALICISI (Bölüm 5)
═══════════════════════════════════════════════════════════════════════════ */
function applyTheme(theme, fromSite = false) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = currentTheme;
  const dark = isDarkTheme();

  // 7 Ekim 2026 paleti Materyal Çizim Zemini: Açık #F4F6F9, Koyu #151C28
  const bgHex = dark ? 0x151C28 : 0xF4F6F9;
  scene.background.setHex(bgHex);
  scene.fog.color.setHex(bgHex);
  rebuildGridForTheme();

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.textContent = dark ? '🌙' : '☀️';
    themeBtn.setAttribute('aria-label', dark ? 'Açık temaya geçiniz' : 'Koyu temaya geçiniz');
    themeBtn.setAttribute('aria-pressed', String(dark));
    if (fromSite) {
      siteManagedTheme = true;
      themeBtn.classList.add('hidden');
    }
  }

  // Mevcut matematiksel durumu sıfırlamadan yeniden çiz
  const target=controls.target.clone();
  renderActiveSceneAndHUD();
  controls.target.copy(target);
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  if (siteManagedTheme) return;
  const next = isDarkTheme() ? 'light' : 'dark';
  try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  applyTheme(next, false);
});

window.addEventListener('message', event => {
  if (window.parent === window || event.source !== window.parent) return;
  if (location.protocol === 'file:' || event.origin !== location.origin) return;
  let data = event.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (_) { return; }
  }
  if (!data || data.channel !== 'matbis-theme' || data.type !== 'set-theme') return;
  if (data.theme !== 'light' && data.theme !== 'dark') return;
  applyTheme(data.theme, true);
});

if (window.parent && window.parent !== window && location.protocol !== 'file:') {
  try {
    window.parent.postMessage({ channel: 'matbis-theme', type: 'ready' }, location.origin);
  } catch (_) {}
}

/* ═══════════════════════════════════════════════════════════════════════════
   11. RESIZE VE ANİMASYON DÖNGÜSÜ (M5: prefers-reduced-motion uyumlu)
═══════════════════════════════════════════════════════════════════════════ */
function resize() {
  const w = Math.max(1, sceneStage.clientWidth);
  const h = Math.max(1, sceneStage.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if(stageGroup.children.length)fitScene();
}
new ResizeObserver(resize).observe(sceneStage);
// The fixed header may grow with text size, safe areas or a narrower screen.
const mobileHeader=document.getElementById('material-header');
new ResizeObserver(()=>{
 document.documentElement.style.setProperty('--mobile-header-height',`${mobileHeader.offsetHeight}px`);
}).observe(mobileHeader);
window.addEventListener('resize', resize);

// İlk Başlatma
if (document.documentElement.dataset.preview === '1') {
  labState.freeSubMode = 'nested';
  labState.a1=2; labState.d=2; labState.nCount=6;
}
applyTheme(currentTheme, false);
resize();
document.getElementById('loading-overlay').classList.add('hidden');

let isPageVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
  if(!isPageVisible)stopAntWalk();
});

function animate(time) {
  requestAnimationFrame(animate);
  if (!isPageVisible) return;
  if(antWalking && antDrawing && !reduceMotionQuery.matches && document.getElementById('intro').classList.contains('hidden')) {
    if(lastAntTime)labState.antProgress=Math.min(100,labState.antProgress+Math.min(time-lastAntTime,80)*.01);
    lastAntTime=time;updateAntPose();rememberAntCustom();
    if(labState.viewMode==='free'){document.getElementById('param1-slider').value=labState.antProgress;document.getElementById('free-s1-val').textContent=`%${Math.round(labState.antProgress)}`;}
    if(labState.antProgress>=100)stopAntWalk();
  } else lastAntTime=0;

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

document.getElementById('discovery-input').addEventListener('input',event=>{discoveryDrafts.set(discoveryKey(),event.target.value);});
document.getElementById('discovery-input').addEventListener('keydown',event=>{if(event.key==='Enter')document.getElementById('discovery-check').click();});
document.getElementById('discovery-check').addEventListener('click',()=>{
 const key=discoveryKey(),task=discoveryTask();
 if(discoveryResponses.has(key))return;
 let response;
 const requestAnswer=message=>{renderDiscoveryFeedback({tone:'info',title:'Yanıtınızı tamamlayınız',message});revealDiscoveryFeedback();};
 if(task.ant){
  if(!antDrawing){requestAnswer('Önce şeklin yüzeyinde A ve B noktalarını seçiniz.');return;}
  const choice=discoveryChoices.get(key);
  if(choice===undefined){requestAnswer('Önce alternatiflerden bir yolu seçiniz.');return;}
  const route=antDrawing.routes[choice],best=antDrawing.solution.best;
  const matches=ExactLength.equal(route,best);
  response={tone:matches?'success':'compare',title:matches?'Seçtiğiniz yol en kısa yollardan biri':'Daha kısa bir yol var',facts:[{label:'Seçtiğiniz yol',value:`Yol ${choice+1}`},{label:'En kısa yolun uzunluğu',value:ExactLength.text(best),route:best}],message:'Seçtiğiniz yolu, yeşil yolu ve bu yolların açınımlarını karşılaştırınız.'};
 }else{
  let value;
  if(task.options){
    value=discoveryChoices.get(key);
    if(!task.options.includes(value)){requestAnswer('Önce seçeneklerden bir tahmin seçiniz.');return;}
  }else{
    const raw=document.getElementById('discovery-input').value.trim().replace(',','.');
    if(!/^[+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)||!Number.isFinite(Number(raw))){requestAnswer('Önce sayısal bir tahmin yazınız.');return;}
    value=Number(raw);
  }
  const matches=Math.abs(value-task.value)<1e-6;
  response={tone:matches?'success':'compare',title:matches?'Tahmininiz sonuçla aynı':'Tahmininiz sonuçtan farklı',facts:[{label:'Tahmininiz',value:`${antNumber(value)} ${task.unit}`},{label:'Modelin sonucu',value:`${antNumber(task.value)} ${task.unit}`}],message:task.explanation || (matches?'Sonucu küplerin ölçüleriyle kontrol ediniz.':'Küplerin ölçülerini ve çözümünüzü yeniden karşılaştırınız.')};
 }
 LearningRecord.record({key:key+':prediction',section:labState.viewMode,step:currentGuidedStep()?.id||labState.freeSubMode,stage:'prediction',prompt:task.prompt,choice:response.facts?.[0]?.value||'',correct:response.tone==='success',context:learningContext()});
 discoveryResponses.set(key,response);
 const target=controls.target.clone();renderActiveSceneAndHUD();controls.target.copy(target);controls.update();
 revealDiscoveryFeedback();
});
elQInput.addEventListener('input',()=>{answerMap[activeModuleKey+':'+currentStepIdx]=elQInput.value;});
elReflectInput.addEventListener('input',()=>{reflectionMap[activeModuleKey]=elReflectInput.value;});
function focusModal(modal){
 document.getElementById('canvas-wrap').inert=true;
 for(const id of ['workspace-scroll','ui-panel','side-panel','free-panel','proj-panel','material-nav']) document.getElementById(id).inert=true;
 modal.querySelector('button')?.focus();
}
function focusWorkspace(){
 for(const id of ['canvas-wrap','workspace-scroll','ui-panel','side-panel','free-panel','proj-panel','material-nav']) document.getElementById(id).inert=false;
 const target=window.matchMedia('(max-width:650px)').matches?document.getElementById('workspace-scroll'):labState.viewMode==='free'||elBtnNext.disabled?canvas:elBtnNext;
 target.focus({preventScroll:true});
}
document.querySelectorAll('[data-launch],[data-nav]').forEach(b=>b.addEventListener('click',focusWorkspace));
document.getElementById('guide-open-btn').addEventListener('click',()=>focusModal(document.getElementById('intro')));
document.addEventListener('keydown',e=>{
 const modal=!document.getElementById('intro').classList.contains('hidden')?document.getElementById('intro'):null;
 if(!modal)return;
 if(e.key==='Escape' && labState.viewMode!=='portal'){e.preventDefault();modal.classList.add('hidden');focusWorkspace();}
 if(e.key==='Tab'){
  const buttons=[...modal.querySelectorAll('button,input,textarea,a[href],summary')].filter(x=>!x.disabled && x.getClientRects().length);
  const first=buttons[0],last=buttons[buttons.length-1];
  if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
 }
});
if(document.documentElement.dataset.preview==='1'){
 document.getElementById('intro').classList.add('hidden');
 canvas.tabIndex=-1; controls.enabled=false; if(gridHelper)gridHelper.visible=false; fitScene();
}else if(document.documentElement.dataset.entryMode==='free') {launchSection('free');delete document.documentElement.dataset.entryMode;}
else focusModal(document.getElementById('intro'));
if(new URLSearchParams(location.search).get('test')==='1') window.__cubesTest={get state(){return {...labState};},getArithmeticTerms,getPointAlongPolyline,get camera(){return camera.position.toArray();},get target(){return controls.target.toArray();}};

// Optional local export preserves first responses and attempts without a score screen.
document.getElementById('download-responses').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify(LearningRecord.snapshot(),null,2)],{type:'application/json;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='kupler-yanit-kaydi.json';document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
