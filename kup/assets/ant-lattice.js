/* One-centimetre exterior lattice. Only endpoints snap; walking paths stay continuous. */
const AntLattice=(()=>{
 function snap(point,dimensions){
  if(point.length!==3||dimensions.length!==3||!point.every(Number.isFinite)||!dimensions.every(d=>Number.isInteger(d)&&d>0))throw new Error('Geçersiz kafes koordinatı.');
  const bounded=point.map((v,i)=>Math.max(0,Math.min(dimensions[i],v)));
  let axis=0,gap=Infinity,side=0;
  bounded.forEach((v,i)=>{for(const s of [0,1]){const d=Math.abs(v-s*dimensions[i]);if(d<gap){gap=d;axis=i;side=s;}}});
  const result=bounded.map(Math.round);result[axis]=side*dimensions[axis];return result;
 }
 function faceAxes(face){return [0,1,2].filter(axis=>axis!==Math.floor(face/2));}
 function nodes(dimensions){
  const result=[];
  for(let x=0;x<=dimensions[0];x++)for(let y=0;y<=dimensions[1];y++)for(let z=0;z<=dimensions[2];z++){
   const point=[x,y,z];if(point.some((v,i)=>v===0||v===dimensions[i]))result.push(point);
  }
  return result;
 }
 return {snap,faceAxes,nodes};
})();
if(typeof module!=='undefined')module.exports=AntLattice;
