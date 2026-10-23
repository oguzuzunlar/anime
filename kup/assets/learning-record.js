/* Session-only response evidence. No score, storage, network request or student identity. */
const LearningRecord=(()=>{
 const rows=new Map();
 function record({key,section,step,stage,prompt,choice,correct,context={}}){
  if(!rows.has(key))rows.set(key,{section,step,stage,prompt,context:JSON.parse(JSON.stringify(context)),attempts:[]});
  const row=rows.get(key);
  row.attempts.push({choice:String(choice),correct:!!correct,time:new Date().toISOString()});
  return row.attempts.length;
 }
 function snapshot(){
  return {format:'matbis-yanit-kaydi',material:'Küpler Materyali',version:'3.2.2',created:new Date().toISOString(),
   questions:[...rows.values()].map(row=>({...JSON.parse(JSON.stringify(row)),firstChoice:row.attempts[0].choice,firstCorrect:row.attempts[0].correct,attemptCount:row.attempts.length}))};
 }
 return {record,snapshot};
})();
if(typeof module!=='undefined')module.exports=LearningRecord;
