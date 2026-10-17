/* Domain model. No network, credentials or runtime dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.JLSI=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='jlsi.portal.v1';
const clone=v=>JSON.parse(JSON.stringify(v));
const days=(start,end)=>{const out=[];let d=new Date(start+'T12:00:00Z');const last=new Date(end+'T12:00:00Z');for(let i=0;d<=last&&i<366;i++){out.push(d.toISOString().slice(0,10));d.setUTCDate(d.getUTCDate()+1);}return out;};
const fail=(code)=>{throw new Error(code);};
const required=(v)=>typeof v==='string'&&v.trim().length>0;
const number=(v,min,max=Infinity)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function seed(){
const trainers=[
{id:'T1',ar:'د. أحمد عبد الله',en:'Dr. Ahmed Abdulla',specialtyAr:'التشريع والصياغة القانونية',specialtyEn:'Legislation and legal drafting',rating:4.8},
{id:'T2',ar:'د. مريم حسن',en:'Dr. Maryam Hassan',specialtyAr:'المهارات القضائية',specialtyEn:'Judicial skills',rating:4.9},
{id:'T3',ar:'أ. يوسف إبراهيم',en:'Yousif Ibrahim',specialtyAr:'حقوق الإنسان',specialtyEn:'Human rights',rating:4.7}
];
const names=[
['P1','الصياغة القانونية للتشريعات','Legislative Drafting','law','T1','2026-10-20','2026-10-22',15,24,3],
['P2','مهارات تسبيب الأحكام القضائية','Judicial Reasoning & Judgment Writing','judicial','T2','2026-10-26','2026-10-28',18,20,3],
['P3','ضمانات حقوق الإنسان في العدالة','Human Rights in Justice','rights','T3','2026-11-02','2026-11-03',10,18,3],
['P4','إدارة الجلسات القضائية','Court Hearing Management','judicial','T2','2026-10-05','2026-10-07',15,16,3],
['P5','تفسير النصوص القانونية','Legal Interpretation','law','T1','2026-11-09','2026-11-11',15,25,1],
['P6','الوساطة وتسوية المنازعات','Mediation & Dispute Resolution','judicial','T2','2026-11-16','2026-11-18',15,20,0]
];
const programs=names.map((p,i)=>({id:p[0],ref:'JLSI-2026-00'+(i+1),ar:p[1],en:p[2],field:p[3],trainer:p[4],start:p[5],end:p[6],hours:p[7],seats:p[8],stage:p[9],completed:p[0]==='P4',external:false,externalApproved:false,roomAr:'قاعة '+(i%3+1),roomEn:'Hall '+(i%3+1),descriptionAr:'برنامج تطبيقي لتطوير الكفايات المهنية من خلال دراسة حالات وورش عمل وتمارين عملية بإشراف مختصين.',descriptionEn:'An applied program developing professional competencies through case studies, workshops and practical exercises led by specialists.'}));
const people=[
['DEMO-101','سارة أحمد','Sara Ahmed'],['DEMO-102','خالد علي','Khalid Ali'],['DEMO-103','نورة يوسف','Noora Yousif'],['DEMO-104','محمد حسن','Mohammed Hassan'],['DEMO-105','فاطمة إبراهيم','Fatima Ibrahim'],['DEMO-106','علي عبد الله','Ali Abdulla']
];
let requests=[];for(const program of ['P1','P2','P3','P4'])for(const [i,p] of people.entries()){if(program==='P3'&&i>2)continue;requests.push({id:'REQ-'+String(1001+requests.length),program,learner:p[0],nameAr:p[1],nameEn:p[2],orgAr:'جهة تدريبية تجريبية',orgEn:'Demo training entity',type:i%2?'entity':'individual',status:'approved',reason:'',created:'2026-10-01T09:00:00Z'});}
requests.push({id:'REQ-1022',program:'P1',learner:'DEMO-201',nameAr:'عبد الرحمن سالم',nameEn:'Abdulrahman Salem',orgAr:'جهة تجريبية',orgEn:'Demo entity',type:'entity',status:'pending',reason:'',created:'2026-10-16T09:00:00Z'});
const attendance={},grades={};
for(const [i,p] of people.entries()){
for(const [j,d] of days('2026-10-05','2026-10-07').entries())attendance['P4|'+d+'|'+p[0]]={status:i===2&&j>0?'absent':'present',reason:'',updated:'2026-10-07T10:00:00Z'};
grades['P4|'+p[0]]={exam:i===3?45:82+i,assignment:i===3?50:88+i};
}
return {version:1,programs,trainers,requests,attendance,grades,evaluations:[{id:'EV-1',program:'P4',type:'end',ratings:[5,4,5,4],notes:'',created:'2026-10-07'}],expenses:[{id:'EX-1',program:'P4',ar:'مستحقات المدرب',en:'Trainer fees',fils:450000,status:'paid'},{id:'EX-2',program:'P1',ar:'ضيافة المشاركين',en:'Participant hospitality',fils:75000,status:'pending'},{id:'EX-3',program:'P2',ar:'ترجمة المواد',en:'Material translation',fils:120000,status:'approved'}],files:[],archive:[],settings:{attendance:80,score:60},activity:[{ar:'تهيئة بيانات العرض التجريبي',en:'Demo workspace initialized',at:'2026-10-17T08:00:00Z'}]};
}
class Portal{
constructor(state=seed(),persist=()=>{}){this.state=clone(state);this.persist=persist;}
commit(work,ar,en){const next=clone(this.state);const result=work(next);next.activity.unshift({ar,en,at:new Date().toISOString()});next.activity=next.activity.slice(0,80);this.persist(next);this.state=next;return result;}
program(id){return this.state.programs.find(p=>p.id===id)||fail('notFound');}
participants(id){return this.state.requests.filter(r=>r.program===id&&r.status==='approved');}
available(id){return Math.max(0,this.program(id).seats-this.participants(id).length);}
canRegister(id){const p=this.program(id);return p.stage===3&&!p.completed&&(!p.external||p.externalApproved);}
status(p){return p.completed?'completed':p.stage===3?(p.external&&!p.externalApproved?'external':'open'):['draft','review','director'][p.stage];}
addProgram(input){
const p=clone(input);for(const k of ['ar','en','descriptionAr','descriptionEn','roomAr','roomEn'])if(!required(p[k]))fail('required');
if(!['law','judicial','rights'].includes(p.field)||!this.state.trainers.some(t=>t.id===p.trainer))fail('required');
if(!/^\d{4}-\d{2}-\d{2}$/.test(p.start)||!Number.isFinite(Date.parse(p.start))||!Number.isFinite(Date.parse(p.end))||p.end<p.start||days(p.start,p.end).length>60)fail('dates');
if(!number(p.hours,0.5,1000)||!number(p.seats,1,10000)||!Number.isInteger(p.seats))fail('positive');
return this.commit(s=>{p.id='P'+(Math.max(...s.programs.map(x=>+x.id.slice(1)))+1);p.ref='JLSI-'+p.start.slice(0,4)+'-'+p.id.slice(1).padStart(3,'0');Object.assign(p,{stage:0,completed:false,external:!!p.external,externalApproved:false});s.programs.push(p);return p;},'إنشاء برنامج تدريبي','Training program created');
}
advanceProgram(id){const p=this.program(id);if(p.stage>=3)fail('state');return this.commit(s=>{s.programs.find(x=>x.id===id).stage++;},'تحديث الاعتماد الداخلي','Internal approval advanced');}
approveExternal(id){const p=this.program(id);if(!p.external||p.externalApproved)fail('state');return this.commit(s=>{s.programs.find(x=>x.id===id).externalApproved=true;},'تسجيل موافقة خارجية تجريبية','Demo external approval recorded');}
apply(input){
if(!this.canRegister(input.program))fail('closed');
for(const k of ['id','nameAr','nameEn','orgAr','orgEn'])if(!required(input[k]))fail('required');
const learner=input.id.trim().toUpperCase();if(!/^DEMO-[A-Z0-9-]{1,24}$/.test(learner))fail('demoId');
if(!input.consent||!['individual','entity'].includes(input.type))fail('consent');
if(this.state.requests.some(r=>r.program===input.program&&r.learner===learner&&r.status!=='rejected'))fail('duplicate');
return this.commit(s=>{const r={id:'REQ-'+(Math.max(1000,...s.requests.map(x=>+x.id.slice(4)))+1),program:input.program,learner,nameAr:input.nameAr.trim(),nameEn:input.nameEn.trim(),orgAr:input.orgAr.trim(),orgEn:input.orgEn.trim(),type:input.type,status:'pending',reason:'',created:new Date().toISOString()};s.requests.push(r);return r;},'تقديم طلب تسجيل','Registration submitted');
}
decide(id,action,reason=''){
const r=this.state.requests.find(x=>x.id===id);if(!r||!['pending','waitlist'].includes(r.status))fail('state');
if(!['approve','reject'].includes(action))fail('state');if(action==='reject'&&!reason.trim())fail('reason');
if(action==='approve'&&!this.canRegister(r.program))fail('closed');
const status=action==='reject'?'rejected':this.available(r.program)>0?'approved':'waitlist';
return this.commit(s=>{const row=s.requests.find(x=>x.id===id);row.status=status;row.reason=reason.trim();return row;},'تحديث قرار طلب التسجيل','Registration decision updated');
}
attend(program,date,learner,status,reason=''){
if(!this.participants(program).some(r=>r.learner===learner))fail('participant');
const p=this.program(program);if(!days(p.start,p.end).includes(date))fail('attendanceDate');
if(!['present','absent'].includes(status))fail('required');
const key=[program,date,learner].join('|'),old=this.state.attendance[key];
if(old&&old.status!==status&&!reason.trim())fail('reason');
return this.commit(s=>{s.attendance[key]={status,reason:reason.trim()||old?.reason||'',updated:new Date().toISOString()};},'حفظ سجل الحضور','Attendance saved');
}
grade(program,learner,exam,assignment){
if(!this.participants(program).some(r=>r.learner===learner))fail('participant');
if(!number(exam,0,100)||!number(assignment,0,100))fail('grade');
return this.commit(s=>{s.grades[program+'|'+learner]={exam,assignment};},'حفظ الدرجات','Grades saved');
}
eligibility(program,learner){
const p=this.program(program),sessions=days(p.start,p.end),g=this.state.grades[program+'|'+learner];
const present=sessions.filter(d=>this.state.attendance[[program,d,learner].join('|')]?.status==='present').length;
const recorded=sessions.filter(d=>this.state.attendance[[program,d,learner].join('|')]).length;
const attendance=sessions.length?present/sessions.length*100:0,score=g?(g.exam+g.assignment)/2:null;
const reasons=[];if(recorded<sessions.length)reasons.push('incompleteAttendance');if(attendance<this.state.settings.attendance)reasons.push('lowAttendance');if(score===null)reasons.push('missingGrades');else if(score<this.state.settings.score)reasons.push('lowScore');
return {attendance,score,recorded,total:sessions.length,reasons,eligible:reasons.length===0};
}
evaluate(input){
this.program(input.program);if(!['end','impact','experience'].includes(input.type)||input.ratings.length!==4||input.ratings.some(n=>!Number.isInteger(n)||!number(n,1,5)))fail('rating');
return this.commit(s=>{s.evaluations.push({...clone(input),id:'EV-'+(s.evaluations.length+1),created:new Date().toISOString()});},'استلام تقييم جديد','New evaluation received');
}
expense(input){
this.program(input.program);if(!required(input.ar)||!required(input.en))fail('required');if(!number(input.amount,0.001,1000000))fail('positive');
return this.commit(s=>{const e={id:'EX-'+(s.expenses.length+1),program:input.program,ar:input.ar.trim(),en:input.en.trim(),fils:Math.round(input.amount*1000),status:'pending'};s.expenses.push(e);return e;},'تسجيل مصروف','Expense recorded');
}
advanceExpense(id){const e=this.state.expenses.find(x=>x.id===id);if(!e||e.status==='paid')fail('state');return this.commit(s=>{s.expenses.find(x=>x.id===id).status=e.status==='pending'?'approved':'paid';},'تحديث حالة المصروف (محاكاة)','Expense status updated (simulation)');}
addTrainer(input){for(const k of ['ar','en','specialtyAr','specialtyEn'])if(!required(input[k]))fail('required');return this.commit(s=>s.trainers.push({...input,id:'T'+(s.trainers.length+1),rating:null}),'إضافة مدرب','Trainer added');}
setSettings(input){if(!number(input.attendance,0,100)||!number(input.score,0,100))fail('grade');return this.commit(s=>{s.settings=input;},'تحديث معايير الشهادات التجريبية','Demo certificate criteria updated');}
addFile(input,archive=false){
this.program(input.program);if(!required(input.ar)||!required(input.en))fail('required');
if(!number(input.size,1,500*1024)||!['application/pdf','image/png','image/jpeg','image/webp','text/plain'].includes(input.mime)||!input.data.startsWith('data:'+input.mime+';base64,'))fail('file');
return this.commit(s=>{const f={...input,id:'FILE-'+Date.now()+'-'+s.files.length};s.files.push(f);if(archive)s.archive.push(f.id);return f;},'حفظ مرفق محلي','Local attachment saved');
}
removeFile(id){return this.commit(s=>{s.files=s.files.filter(f=>f.id!==id);s.archive=s.archive.filter(x=>x!==id);},'حذف مرفق محلي','Local attachment removed');}
}
function csv(rows){return '\ufeff'+rows.map(row=>row.map(v=>{let s=String(v??'');if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
return {Portal,seed,KEY,days,csv};
});

