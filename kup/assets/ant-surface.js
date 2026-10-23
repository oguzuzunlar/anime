/* Exterior paths on a rectangular prism formed by touching equal cubes.
   Arbitrary surface points: unfold every simple face sequence, intersect the
   straight segment with shared edges, reject routes outside their faces.
   Interior contact faces are never walkable. Vertex exercises are retained. */
const AntSurface = (() => {
  const names = ['Sol alt ön','Sağ alt ön','Sol üst ön','Sağ üst ön',
    'Sol alt arka','Sağ alt arka','Sol üst arka','Sağ üst arka'];
  const bits = id => [id & 1, (id >> 1) & 1, (id >> 2) & 1];
  const distance = (a,b) => Math.hypot(...a.map((v,i)=>v-b[i]));
  function solve(count, edge, startId, endId) {
    const dimensions=[count*edge,edge,edge], startBits=bits(startId), endBits=bits(endId);
    const start=startBits.map((v,i)=>v*dimensions[i]);
    const end=endBits.map((v,i)=>v*dimensions[i]);
    const changed=[0,1,2].filter(i=>startBits[i]!==endBits[i]);
    const normal=(axis,sign)=>[0,1,2].map(i=>i===axis?sign:0);
    const candidates=[];
    if(changed.length===3) {
      for(const [i,j,k] of [[0,1,2],[0,2,1],[1,2,0]]) {
        const u=dimensions[i]+dimensions[j], v=dimensions[k];
        const bend=[...start];
        bend[i]=end[i]; bend[k]=start[k]+(end[k]-start[k])*dimensions[i]/u;
        candidates.push({u,v,fold:dimensions[i],length:Math.hypot(u,v),
          points:[start,bend,end],normals:[normal(j,startBits[j]?1:-1),normal(i,endBits[i]?1:-1)],
          label:`${faceNames[2*j+startBits[j]]} → ${faceNames[2*i+endBits[i]]} · (${dimensions[i]} + ${dimensions[j]}) × ${v}`});
      }
    } else {
      const fixed=[0,1,2].filter(i=>!changed.includes(i));
      const axis=fixed.includes(1)?1:fixed[0];
      const u=changed.length?dimensions[changed[0]]:0;
      const v=changed.length===2?dimensions[changed[1]]:0;
      candidates.push({u,v,fold:null,length:distance(start,end),points:[start,end],
        normals:[normal(axis,startBits[axis]?1:-1)],label:changed.length===2?'Aynı yüzün köşegeni':changed.length===1?'Ortak ayrıt':'A ve B aynı nokta'});
    }
    const best=candidates.reduce((a,b)=>b.length<=a.length+1e-9?b:a);
    return {count,edge,dimensions,start,end,startId,endId,candidates,best};
  }
  const faceNames=['Sol','Sağ','Alt','Üst','Ön','Arka'];
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  const add=(a,b)=>a.map((v,i)=>v+b[i]);
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const mul=(a,t)=>a.map(v=>v*t);
  const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
  const lerp=(a,b,t)=>add(a,mul(sub(b,a),t));
  const freeAxes=face=>[0,1,2].filter(i=>i!==Math.floor(face/2));
  function facePoint(dimensions,face,u,v) {
    const axis=Math.floor(face/2),axes=freeAxes(face),p=[0,0,0];
    p[axis]=(face%2)*dimensions[axis];p[axes[0]]=u*dimensions[axes[0]];p[axes[1]]=v*dimensions[axes[1]];
    return p;
  }
  function embed(transform,p){return add(transform.origin,add(mul(transform.basis[0],p[transform.axes[0]]),mul(transform.basis[1],p[transform.axes[1]])));}
  function inverse(transform,q,dimensions) {
    const p=[0,0,0],delta=sub(q,transform.origin);
    p[Math.floor(transform.face/2)]=(transform.face%2)*dimensions[Math.floor(transform.face/2)];
    transform.axes.forEach((axis,i)=>p[axis]=dot(delta,transform.basis[i]));
    return p;
  }
  function polygon(transform,dimensions) {
    return [[0,0],[1,0],[1,1],[0,1]].map(([u,v])=>embed(transform,facePoint(dimensions,transform.face,u,v)));
  }
  function unfoldNext(previous,next,dimensions) {
    const i=Math.floor(previous.face/2),j=Math.floor(next/2),k=3-i-j;
    const edge=[0,0,0];edge[i]=(previous.face%2)*dimensions[i];edge[j]=(next%2)*dimensions[j];
    const a=embed(previous,edge),b=embed(previous,add(edge,[0,1,2].map(axis=>axis===k?dimensions[k]:0)));
    const along=mul(sub(b,a),1/dimensions[k]),perpendicular=[-along[1],along[0]];
    const middle=embed(previous,facePoint(dimensions,previous.face,.5,.5));
    const inward=mul(perpendicular,dot(sub(middle,a),perpendicular)>0?-1:1);
    const basisI=mul(inward,previous.face%2?-1:1),axes=freeAxes(next);
    return {face:next,axes,basis:axes.map(axis=>axis===i?basisI:along),origin:sub(a,mul(basisI,edge[i])),shared:[a,b]};
  }
  function faceInterval(transform,a,b,dimensions,eps) {
    const start=inverse(transform,a,dimensions),end=inverse(transform,b,dimensions);let low=0,high=1;
    for(const axis of transform.axes){
      const delta=end[axis]-start[axis];
      if(Math.abs(delta)<eps){if(start[axis]<-eps||start[axis]>dimensions[axis]+eps)return null;}
      else {const t0=-start[axis]/delta,t1=(dimensions[axis]-start[axis])/delta;low=Math.max(low,Math.min(t0,t1));high=Math.min(high,Math.max(t0,t1));}
    }
    return low<=high+1e-8?[Math.max(0,low),Math.min(1,high)]:null;
  }
  function edgeInterval(a,b,c,d,eps) {
    const v=sub(b,a),w=sub(d,c),offset=sub(c,a),denom=cross(v,w);
    if(Math.abs(denom)>eps*eps){
      const t=cross(offset,w)/denom,s=cross(offset,v)/denom;
      return t>=-1e-8&&t<=1+1e-8&&s>=-1e-8&&s<=1+1e-8?[Math.max(0,t),Math.min(1,t)]:null;
    }
    if(Math.abs(cross(offset,v))>eps*Math.max(1,Math.hypot(...v)))return null;
    const length2=dot(v,v);if(length2<eps*eps)return [0,1];
    const t0=dot(sub(c,a),v)/length2,t1=dot(sub(d,a),v)/length2;
    const low=Math.max(0,Math.min(t0,t1)),high=Math.min(1,Math.max(t0,t1));
    return low<=high+1e-8?[low,high]:null;
  }
  function solvePoints(count,edge,start,end) {
    const dimensions=[count*edge,edge,edge],eps=Math.max(...dimensions)*1e-8;
    const incident=p=>[0,1,2,3,4,5].filter(face=>Math.abs(p[Math.floor(face/2)]-(face%2)*dimensions[Math.floor(face/2)])<eps);
    for(const p of [start,end])if(p.length!==3||p.some((v,i)=>!Number.isFinite(v)||v<-eps||v>dimensions[i]+eps)||!incident(p).length)throw new RangeError('Noktalar birleşik cismin dış yüzeyinde olmalı.');
    const candidates=[],keys=new Set();let examined=0;
    function evaluate(sequence) {
      examined++;
      const axes=freeAxes(sequence[0]);
      const transforms=[{face:sequence[0],axes,origin:[0,0],basis:[[1,0],[0,1]]}];
      for(let i=1;i<sequence.length;i++)transforms.push(unfoldNext(transforms[i-1],sequence[i],dimensions));
      const a=embed(transforms[0],start),b=embed(transforms.at(-1),end);
      const intervals=transforms.map(t=>faceInterval(t,a,b,dimensions,eps));
      if(intervals.some(v=>!v)||intervals[0][0]>1e-8||intervals.at(-1)[1]<1-1e-8)return;
      const times=[0];
      for(let i=1;i<transforms.length;i++) {
        const [c,d]=transforms[i].shared,interval=edgeInterval(a,b,c,d,eps);if(!interval)return;
        const t=Math.max(times.at(-1),interval[0],intervals[i-1][0],intervals[i][0]);
        if(t>Math.min(interval[1],intervals[i-1][1],intervals[i][1])+1e-8)return;
        times.push(Math.max(0,Math.min(1,t)));
      }
      times.push(1);
      const points=[[...start]],normals=[];
      for(let i=0;i<sequence.length;i++) {
        if(times[i+1]-times[i]<1e-9)continue;
        const point=i===sequence.length-1?[...end]:inverse(transforms[i],lerp(a,b,times[i+1]),dimensions);
        if(distance(points.at(-1),point)<eps)continue;
        points.push(point);normals.push([0,1,2].map(axis=>axis===Math.floor(sequence[i]/2)?(sequence[i]%2?1:-1):0));
      }
      if(points.length===1){points.push([...end]);normals.push([0,1,2].map(axis=>axis===Math.floor(sequence[0]/2)?(sequence[0]%2?1:-1):0));}
      if(distance(points.at(-1),end)>eps)return;
      const key=points.map(p=>p.map(v=>(v/edge).toFixed(7)).join(',')).join(';');if(keys.has(key))return;keys.add(key);
      const length=distance(a,b),u=Math.abs(b[0]-a[0]),v=Math.abs(b[1]-a[1]);
      const crossings=times.slice(1,-1).map(t=>lerp(a,b,t));
      candidates.push({length,u,v,fold:null,points,normals,sequence:[...sequence],label:sequence.map(face=>faceNames[face]).join(' → '),net:{faces:transforms.map(t=>({face:t.face,polygon:polygon(t,dimensions)})),a,b,crossings,edges:transforms.slice(1).map(t=>t.shared),path:[a,...crossings,b]}});
    }
    const targets=incident(end);
    function visit(sequence){
      const face=sequence.at(-1);
      if(targets.includes(face))evaluate(sequence);
      if(sequence.length===6)return;
      for(let next=0;next<6;next++)if(Math.floor(face/2)!==Math.floor(next/2)&&!sequence.includes(next))visit([...sequence,next]);
    }
    for(const face of incident(start))visit([face]);
    candidates.sort((a,b)=>a.length-b.length||a.sequence.length-b.sequence.length);
    if(!candidates.length)throw new Error('Geçerli yüzey açınımı bulunamadı.');
    return {count,edge,dimensions,start:[...start],end:[...end],candidates,best:candidates[0],examined,arbitrary:true};
  }
  // Deliberate alternatives use simple edge positions; the shortest-path solver is unchanged.
  function detours(solution) {
    const best=solution.best;if(!best.net||best.length<1e-8)return [];
    const results=[];
    function fromNet(face,q){
      const p=face.polygon,delta=sub(q,p[0]),u=sub(p[1],p[0]),v=sub(p[3],p[0]);
      return facePoint(solution.dimensions,face.face,dot(delta,u)/dot(u,u),dot(delta,v)/dot(v,v));
    }
    for(const fraction of [.2,.8]){
      let points,path,normals;
      if(best.sequence.length===1){
        const face=best.sequence[0],p=facePoint(solution.dimensions,face,fraction,1-fraction),polygon=best.net.faces[0].polygon;
        const q=add(polygon[0],add(mul(sub(polygon[1],polygon[0]),fraction),mul(sub(polygon[3],polygon[0]),1-fraction)));
        points=[solution.start,p,solution.end];path=[best.net.a,q,best.net.b];normals=[best.normals[0],best.normals[0]];
      }else{
        const crossings=best.net.edges.map((edge,i)=>lerp(...edge,i===0?fraction:.5));
        path=[best.net.a,...crossings,best.net.b];
        points=[solution.start,...crossings.map((q,i)=>fromNet(best.net.faces[i],q)),solution.end];
        normals=best.sequence.map(face=>[0,1,2].map(axis=>axis===Math.floor(face/2)?(face%2?1:-1):0));
      }
      const length=points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);
      if(length-best.length<1e-5)continue;
      results.push({...best,length,points,normals,detour:true,label:best.sequence.length===1?'Aynı yüzde ara noktadan geçen yol':`${best.label} • farklı ayrıt geçişi`,net:{...best.net,path}});
    }
    return results;
  }
  return {names,bits,solve,solvePoints,detours,faceNames,facePoint};
})();
if(typeof module!=='undefined') module.exports=AntSurface;
