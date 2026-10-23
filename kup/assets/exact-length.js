/* Exact path lengths for centimetre coordinates on a 0.01 cm grid. */
const ExactLength=(()=>{
 const cache=new WeakMap(),gcd=(a,b)=>b?gcd(b,a%b):a;
 function squareParts(n){let factor=1,radicand=n;for(let p=2;p*p<=radicand;p++)while(radicand%(p*p)===0){radicand/=p*p;factor*=p;}return {factor,radicand};}
 function scaled(v){const n=Math.round(v*100);return Math.abs(v*100-n)<1e-6?n:null;}
 function get(route){
  if(cache.has(route))return cache.get(route);
  const terms=new Map(),addSquare=n=>{if(!n)return;const p=squareParts(n);terms.set(p.radicand,(terms.get(p.radicand)||0)+p.factor);};
  let valid=true;
  if(route.detour){const path=route.net.path;for(let i=1;i<path.length;i++){const values=[...path[i-1],...path[i]].map(scaled);if(values.some(v=>v===null)){valid=false;break;}const [ax,ay,bx,by]=values;addSquare((bx-ax)**2+(by-ay)**2);}}
  else{const u=scaled(route.u),v=scaled(route.v);if(u===null||v===null)valid=false;else addSquare(u*u+v*v);}
  const result={exact:valid,terms:valid?[...terms].sort((a,b)=>a[0]-b[0]).map(([radicand,num])=>{const g=gcd(num,100);return {radicand,num:num/g,den:100/g};}):[],value:route.length};cache.set(route,result);return result;
 }
 function plain(route){const result=get(route);if(!result.exact)return '≈ '+decimal(route.length);if(!result.terms.length)return '0';return result.terms.map(t=>{const root=t.radicand===1?'':`√${t.radicand}`,num=(t.num===1&&root?'':String(t.num))+root;return num+(t.den===1?'':'/'+t.den);}).join(' + ');}
 function decimal(value){return value.toLocaleString('tr-TR',{minimumFractionDigits:0,maximumFractionDigits:2});}
 function text(route){const result=get(route),irrational=result.terms.some(t=>t.radicand!==1);return plain(route)+' cm'+(result.exact&&irrational?' ≈ '+decimal(route.length)+' cm':'');}
 function render(element,route){
  element.replaceChildren();const result=get(route),ns='http://www.w3.org/1998/Math/MathML';
  const node=(tag,text)=>{const el=document.createElementNS(ns,tag);if(text!==undefined)el.textContent=text;return el;};
  const math=expression=>{const m=node('math');m.setAttribute('display','inline');m.setAttribute('mathvariant','normal');m.append(expression);return m;};
  if(!result.exact){element.textContent=text(route);return;}
  if(!result.terms.length)element.append(math(node('mn','0')));
  result.terms.forEach((term,i)=>{
   const span=document.createElement('span');span.className='exact-term';const row=node('mrow');if(i)row.append(node('mo','+'));
   const numerator=node('mrow');if(term.num!==1||term.radicand===1)numerator.append(node('mn',String(term.num)));
   if(term.radicand!==1){const root=node('msqrt');root.append(node('mn',String(term.radicand)));numerator.append(root);}
   if(term.den!==1){const frac=node('mfrac');frac.append(numerator,node('mn',String(term.den)));row.append(frac);}else row.append(numerator);
   span.append(math(row));element.append(span);
  });
  const unit=document.createElement('span');unit.className='exact-unit';unit.textContent=' cm';element.append(unit);
  if(result.terms.some(t=>t.radicand!==1)){const approx=document.createElement('span');approx.className='exact-approx';approx.textContent='≈ '+decimal(route.length)+' cm';element.append(approx);}
  element.setAttribute('aria-label',text(route));
 }
 function equal(a,b){const x=get(a),y=get(b);return x.exact&&y.exact?JSON.stringify(x.terms)===JSON.stringify(y.terms):Math.abs(a.length-b.length)<1e-9;}
 return {get,plain,text,render,squareParts,equal};
})();
if(typeof module!=='undefined')module.exports=ExactLength;
