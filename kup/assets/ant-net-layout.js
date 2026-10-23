/* Deterministic, collision-free label positions for the unfolding canvas. */
const AntNetLayout=(()=>{
 const overlap=(a,b)=>a.x<b.x+b.w+5&&a.x+a.w+5>b.x&&a.y<b.y+b.h+5&&a.y+a.h+5>b.y;
 function distance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
 function inside(p,poly){let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
 function plan(faces,path,W,H,measurements=null){
  const vertices=faces.flatMap(f=>f.polygon),xs=vertices.map(p=>p[0]),ys=vertices.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  const scale=Math.min((W-112)/Math.max(1,maxX-minX),(H-112)/Math.max(1,maxY-minY));
  const transform=p=>[(W-(maxX-minX)*scale)/2+(p[0]-minX)*scale,(H+(maxY-minY)*scale)/2-(p[1]-minY)*scale];
  const screenFaces=faces.map(f=>({...f,polygon:f.polygon.map(transform)})),screenPath=path.map(transform),labels=[];
  function place(text,anchor,w,h,candidates=[],kind='face'){
   for(const radius of [36,60,84,112])for(let i=0;i<12;i++){const angle=i*Math.PI/6;candidates.push([anchor[0]+Math.cos(angle)*radius,anchor[1]+Math.sin(angle)*radius]);}
   for(let y=24;y<H-20;y+=22)for(let x=24;x<W-20;x+=22)candidates.push([x,y]);
   for(const point of candidates){
    const rect={x:point[0]-w/2,y:point[1]-h/2,w,h};
    if(rect.x<6||rect.y<6||rect.x+w>W-6||rect.y+h>H-6||labels.some(l=>overlap(rect,l.rect)))continue;
    if(screenPath.slice(1).some((p,i)=>distance(point,screenPath[i],p)<Math.hypot(w,h)/2+4))continue;
    const label={text,anchor,rect,kind};labels.push(label);return label;
   }
   throw new Error('Etiket için boş konum bulunamadı.');
  }
  place('A',screenPath[0],42,40,[],'point');place('B',screenPath.at(-1),42,40,[],'point');
  const a=screenPath[0],b=screenPath.at(-1),corner=[b[0],a[1]];
  const triangle={a,b,corner,nondegenerate:Math.abs(a[0]-b[0])>1e-6&&Math.abs(a[1]-b[1])>1e-6};
  if(measurements){
   function measure(text,from,to,kind){
    const anchor=[(from[0]+to[0])/2,(from[1]+to[1])/2],dx=to[0]-from[0],dy=to[1]-from[1],length=Math.hypot(dx,dy),normal=length?[-dy/length,dx/length]:[0,1],candidates=[];
    for(const offset of [28,-28,46,-46,66,-66])candidates.push([anchor[0]+normal[0]*offset,anchor[1]+normal[1]*offset]);
    place(text,anchor,Math.max(34,text.length*11+14),32,candidates,kind);
   }
   if(triangle.nondegenerate){measure(measurements.horizontal,a,corner,'horizontal');measure(measurements.vertical,corner,b,'vertical');}
   if(Math.hypot(b[0]-a[0],b[1]-a[1])>1e-6)measure(measurements.hypotenuse,a,b,'hypotenuse');
  }
  screenFaces.forEach((f,index)=>{
   const center=f.polygon.reduce((sum,p)=>[sum[0]+p[0]/4,sum[1]+p[1]/4],[0,0]),candidates=[center];
   for(const ratio of [.6,.35])for(const p of f.polygon)candidates.push([center[0]+(p[0]-center[0])*ratio,center[1]+(p[1]-center[1])*ratio]);
   const fitting=candidates.filter(p=>[[-15,-15],[15,-15],[15,15],[-15,15]].every(d=>inside([p[0]+d[0],p[1]+d[1]],f.polygon)));
   place(String(index+1),center,30,30,fitting);
  });
  return {faces:screenFaces,path:screenPath,labels,scale,triangle};
 }
 function heightFor(faces,width){
  const points=faces.flatMap(f=>f.polygon),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  return Math.round(Math.max(300,Math.min(440,112+(width-112)*(Math.max(...ys)-Math.min(...ys))/Math.max(1,Math.max(...xs)-Math.min(...xs)))));
 }
 return {plan,overlap,heightFor};
})();
if(typeof module!=='undefined')module.exports=AntNetLayout;
