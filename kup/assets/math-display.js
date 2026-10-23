/* Local numeric formatting and native MathML; no external font/runtime. */
const MaterialMath=(()=>{
  function decimal(value) {
    const rounded=Number(value.toFixed(2));
    const approximate=Math.abs(rounded-value)>Math.max(1,Math.abs(value))*1e-10;
    return (approximate?'≈ ':'')+rounded.toLocaleString('tr-TR',{maximumFractionDigits:2});
  }
  function setText(element,value) {
    const text=String(value),fragment=document.createDocumentFragment();
    const expression=/(\d+)?√(\d+)/g;let previous=0,match;
    while((match=expression.exec(text))){
      fragment.appendChild(document.createTextNode(text.slice(previous,match.index)));
      const ns='http://www.w3.org/1998/Math/MathML',math=document.createElementNS(ns,'math'),row=document.createElementNS(ns,'mrow');
      math.setAttribute('display','inline');math.setAttribute('aria-label',match[0]);
      if(match[1]){const coefficient=document.createElementNS(ns,'mn');coefficient.textContent=match[1];row.appendChild(coefficient);}
      const root=document.createElementNS(ns,'msqrt'),number=document.createElementNS(ns,'mn');number.textContent=match[2];root.appendChild(number);row.appendChild(root);math.appendChild(row);fragment.appendChild(math);
      previous=expression.lastIndex;
    }
    fragment.appendChild(document.createTextNode(text.slice(previous)));element.replaceChildren(fragment);
  }
  return {decimal,setText};
})();
if(typeof module!=='undefined')module.exports=MaterialMath;
