'use strict';
function newProgram(){modal(t('إنشاء برنامج تدريبي','Create training program'),'<div class="form-grid">'+input('ar',t('الاسم بالعربية','Arabic name'),'text','','required maxlength="180"')+input('en',t('الاسم بالإنجليزية','English name'),'text','','required maxlength="180"')+area('descriptionAr',t('الوصف بالعربية','Arabic description'),'','required maxlength="2000"')+area('descriptionEn',t('الوصف بالإنجليزية','English description'),'','required maxlength="2000"')+select('field',t('المجال التدريبي','Training field'),['law','judicial','rights'].map(k=>[k,fieldName(k)]))+select('trainer',t('المدرب','Trainer'),app.state.trainers.map(tr=>[tr.id,loc(tr)]))+input('start',t('تاريخ البداية','Start date'),'date','','required')+input('end',t('تاريخ النهاية','End date'),'date','','required')+input('hours',t('الساعات (0.5–1000)','Hours (0.5–1000)'),'number','','required min=".5" max="1000" step=".5"')+input('seats',t('المقاعد (1–10000)','Seats (1–10000)'),'number','','required min="1" max="10000" step="1"')+input('roomAr',t('القاعة بالعربية','Arabic venue'),'text','','required maxlength="120"')+input('roomEn',t('القاعة بالإنجليزية','English venue'),'text','','required maxlength="120"')+'<label class="check-label wide"><input type="checkbox" name="external">'+t('يتطلب موافقة جهة خارجية مستقلة','Requires separate external approval')+'</label></div>',v=>{const p=app.addProgram({...v,hours:+v.hours,seats:+v.seats,external:!!v.external});location.href='program.html?id='+p.id;},true);}
function applyForm(program=ui.program){
if(!app.state.programs.some(p=>app.canRegister(p.id))){toast(errorText(Error('closed')),true);return;}
modal(t('طلب تسجيل جديد','New registration request'),info(t('استخدم بيانات افتراضية فقط. المعرّف التجريبي يربط التسجيل بالحضور والدرجات.','Use fictional data only. The demo identifier links registration to attendance and grades.'))+'<div class="form-grid">'+programSelect(program,true)+select('type',t('نوع الطلب','Request type'),[['individual',t('تسجيل فردي','Individual')],['entity',t('ترشيح جهة','Entity nomination')]])+input('nameAr',t('اسم المتدرب بالعربية','Learner name in Arabic'),'text','','required maxlength="120"')+input('nameEn',t('اسم المتدرب بالإنجليزية','Learner name in English'),'text','','required maxlength="120"')+input('orgAr',t('الجهة بالعربية','Entity in Arabic'),'text','','required maxlength="160"')+input('orgEn',t('الجهة بالإنجليزية','Entity in English'),'text','','required maxlength="160"')+input('id',t('معرّف تجريبي','Demo identifier'),'text','DEMO-','required maxlength="29" pattern="DEMO-(?:[A-Za-z0-9]|-){1,24}" dir="ltr"')+'<label class="check-label wide"><input name="consent" type="checkbox" required>'+t('راجعت متطلبات البرنامج ومعايير الاجتياز.','I reviewed the program requirements and passing criteria.')+'</label></div>',v=>{const r=app.apply({...v,consent:!!v.consent});location.href='requests.html?request='+r.id+'&submitted=1';},true);
}
function bindPage(){
const main=$('#main');
main.querySelector('select[name="program"]')?.addEventListener('change',e=>{ui.program=e.target.value;ui.date=null;renderPage();});
if(page==='home'){
let category='all';const update=()=>$('#service-results').innerHTML=serviceCards($('#search').value,category);
$('#search').oninput=update;$$('[data-category]').forEach(b=>b.onclick=()=>{category=b.dataset.category;$$('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});update();});
}
if(page==='programs'){const update=()=>$('#program-results').innerHTML=programResults($('#search').value,$('[name="status"]').value);$('#search').oninput=update;$('[name="status"]').onchange=update;}
$$('[data-tab]').forEach(b=>{b.onclick=()=>{ui.tab=b.dataset.tab;renderPage();$('#tab-'+ui.tab).focus();};b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=$$('[data-tab]');let i=tabs.indexOf(b);i=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[i].click();}};});
if(typeof bindOperational==='function')bindOperational();
}
document.addEventListener('click',e=>{
const b=e.target.closest('[data-action]');if(!b)return;
const id=b.dataset.id,action=b.dataset.action;
if(action==='new-program')newProgram();
if(action==='apply')applyForm(id);
if(action==='advance-program')safe(()=>app.advanceProgram(id));
if(action==='external')modal(t('تسجيل موافقة خارجية تجريبية','Record demo external approval'),info(t('يقتصر هذا الإجراء على النموذج ولا يمثل موافقة رسمية من جهة خارجية.','This action is local to the prototype and does not constitute official external approval.')),()=>app.approveExternal(id));
if(action==='upload')upload(false);
if(action==='upload-archive')upload(true);
if(action==='download-file')fileDownload(id);
if(action==='delete-file')modal(t('حذف المرفق','Delete attachment'),'<p>'+t('سيحذف هذا المرفق من بيانات النموذج في المتصفح.','This attachment will be removed from the demo data in this browser.')+'</p>',()=>app.removeFile(id));
if(action==='sample-guide')sample('guide');
if(action==='sample-test')sample('test');
if(action==='print')window.print();
if(typeof operationalAction==='function')operationalAction(action,id,b);
});
shell();renderPage();


function requestDetail(id){
const r=app.state.requests.find(x=>x.id===id);if(!r)return;
modal(t('تفاصيل الطلب','Request details')+' · '+esc(id),'<dl class="metadata">'+[[t('المتدرب','Learner'),loc(r,'name')],[t('المعرّف','Identifier'),r.learner],[t('الجهة','Entity'),loc(r,'org')],[t('البرنامج','Program'),loc(app.program(r.program))],[t('نوع الطلب','Request type'),r.type==='entity'?t('ترشيح جهة','Entity nomination'):t('تسجيل فردي','Individual')],[t('تاريخ التقديم','Submitted'),date(r.created.slice(0,10))]].map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>'+badge(r.status)+(r.reason?info(t('سبب القرار: ','Decision reason: ')+esc(r.reason)):'')+(manage()&&['pending','waitlist'].includes(r.status)?'<div class="form-actions">'+btn(t('اعتماد الطلب','Approve request'),'approve-request','primary','data-id="'+id+'"')+btn(t('رفض الطلب','Reject request'),'reject-request','danger','data-id="'+id+'"')+'</div>':''));
}
function certificate(learner){
const p=app.program(ui.program),r=app.participants(p.id).find(r=>r.learner===learner),e=app.eligibility(p.id,learner);
if(!r||!e.eligible){toast(t('لم تتحقق شروط الشهادة.','Certificate criteria are not met.'),true);return;}
modal(t('معاينة شهادة تجريبية','Demo certificate preview'),'<article class="certificate">'+icon('scale')+'<h2>'+t('معهد الدراسات القضائية والقانونية','Judicial & Legal Studies Institute')+'</h2><p>'+t('مملكة البحرين','Kingdom of Bahrain')+'</p><h3>'+t('شهادة اجتياز','Certificate of Completion')+'</h3><p>'+t('يشهد النموذج التجريبي بأن','This demonstration certifies that')+'</p><div class="learner-name">'+esc(loc(r,'name'))+'</div><p>'+t('قد اجتاز متطلبات البرنامج التدريبي','has met the demonstration requirements for')+'</p><h2>'+esc(loc(p))+'</h2><p>'+date(p.start)+' — '+date(p.end)+' · '+num(p.hours)+' '+t('ساعة تدريبية','training hours')+'</p><small>'+t('رقم تجريبي: ','Demo reference: ')+'DEMO-CERT-'+esc(p.id)+'-'+esc(learner)+'</small><div class="demo-stamp">'+t('نسخة تجريبية — غير صالحة للاستخدام الرسمي','DEMONSTRATION COPY — NOT VALID FOR OFFICIAL USE')+'</div></article><div class="print-actions">'+btn(t('طباعة / حفظ PDF','Print / Save PDF'),'print','primary')+'</div>',null,true);
}
function inlineForm(id,submit){
const form=$(id);if(!form)return;
form.onsubmit=e=>{e.preventDefault();const error=$('.form-error',form);try{if(!form.checkValidity())throw Error('required');submit(Object.fromEntries(new FormData(form)));renderPage();toast(t('تم الحفظ بنجاح.','Saved successfully.'));}catch(err){error.hidden=false;error.textContent=errorText(err);form.querySelector(':invalid')?.focus();}};
}
function bindOperational(){
if(page==='requests'){
const q=new URLSearchParams(location.search).get('request');if(q)$('#search').value=q;
const update=()=>$('#request-results').innerHTML=requestResults($('#search').value,$('[name="status"]').value);$('#search').oninput=update;$('[name="status"]').onchange=update;
}
if(page==='attendance'){
$('[name="attendance-date"]').onchange=e=>{ui.date=e.target.value;renderPage();};
inlineForm('#quick-attendance',v=>app.attend(ui.program,ui.date||app.program(ui.program).start,v.learner.trim().toUpperCase(),'present'));
}
inlineForm('#evaluation-form',v=>app.evaluate({program:v.program,type:v.type,ratings:[0,1,2,3].map(i=>+v['rating'+i]),notes:v.notes.trim()}));
inlineForm('#settings-form',v=>app.setSettings({attendance:+v.attendance,score:+v.score}));
}
function operationalAction(action,id,b){
if(action==='request-detail')requestDetail(id);
if(action==='approve-request'){
try{const result=app.decide(id,'approve');$('#dialog').close();renderPage();toast(result.status==='waitlist'?t('المقاعد مكتملة. وضع الطلب في قائمة الانتظار.','Capacity is full. The request was placed on the waitlist.'):t('اعتمد الطلب وتحدّث عدد المشاركين.','Request approved and participant count updated.'));}catch(e){toast(errorText(e),true);}
}
if(action==='reject-request'){
$('#dialog').close();modal(t('رفض طلب التسجيل','Reject registration request'),area('reason',t('سبب الرفض (إلزامي)','Rejection reason (required)'),'','required maxlength="1000"'),v=>app.decide(id,'reject',v.reason));
}
if(action==='prev-month'||action==='next-month'){const d=new Date(ui.month+'-01T12:00:00');d.setMonth(d.getMonth()+(action==='next-month'?1:-1));ui.month=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');renderPage();}
if(action==='new-trainer')modal(t('إضافة مدرب','Add trainer'),'<div class="form-grid">'+input('ar',t('الاسم بالعربية','Arabic name'),'text','','required maxlength="120"')+input('en',t('الاسم بالإنجليزية','English name'),'text','','required maxlength="120"')+input('specialtyAr',t('التخصص بالعربية','Arabic specialty'),'text','','required maxlength="160"')+input('specialtyEn',t('التخصص بالإنجليزية','English specialty'),'text','','required maxlength="160"')+'</div>',v=>app.addTrainer(v));
if(action==='trainer-profile'){
const tr=app.state.trainers.find(x=>x.id===id);modal(esc(loc(tr)),'<p class="prose">'+esc(loc(tr,'specialty'))+'</p><p class="small-muted">'+t('التقييم التجريبي: ','Demo rating: ')+(tr.rating?num(tr.rating,1):'—')+'</p><h3>'+t('البرامج المسندة','Assigned programs')+'</h3><div class="upcoming-list">'+(app.state.programs.filter(p=>p.trainer===id).map(p=>programCard(p,true)).join('')||empty(t('لم تسند برامج لهذا المدرب بعد.','No programs assigned yet.')))+'</div>');
}
if(action==='attendance-edit'){
const day=ui.date||app.program(ui.program).start,a=app.state.attendance[[ui.program,day,id].join('|')];
modal(t('تسجيل الحضور','Record attendance')+' · '+esc(id),'<div class="form-grid">'+select('status',t('الحالة','Status'),[['present',t('حاضر','Present')],['absent',t('غائب','Absent')]],a?.status||'present')+area('reason',t('مبرر التعديل عند تغيير حالة محفوظة','Reason when changing a saved status'),'','maxlength="1000"')+'</div>',v=>app.attend(ui.program,day,id,v.status,v.reason));
}
if(action==='grade-edit'){
const g=app.state.grades[ui.program+'|'+id];modal(t('الدرجات','Grades')+' · '+esc(id),'<div class="form-grid">'+input('exam',t('درجة الاختبار','Test score'),'number',g?.exam??'','required min="0" max="100" step=".1"')+input('assignment',t('درجة التكليف','Assignment score'),'number',g?.assignment??'','required min="0" max="100" step=".1"')+'</div>',v=>app.grade(ui.program,id,+v.exam,+v.assignment));
}
if(action==='certificate')certificate(id);
if(action==='new-expense')modal(t('تسجيل مصروف','Record expense'),'<div class="form-grid">'+programSelect()+input('ar',t('البيان بالعربية','Arabic description'),'text','','required maxlength="160"')+input('en',t('البيان بالإنجليزية','English description'),'text','','required maxlength="160"')+input('amount',t('المبلغ بالدينار البحريني','Amount in BHD'),'number','','required min=".001" max="1000000" step=".001"')+'</div>',v=>app.expense({...v,amount:+v.amount}));
if(action==='advance-expense')safe(()=>app.advanceExpense(id));
if(action==='toggle-size'){$('#text-size').click();renderPage();}
if(action==='reset')modal(t('إعادة ضبط البيانات التجريبية','Reset demonstration data'),info(t('سيتم حذف البرامج والطلبات والتعديلات والمرفقات التي أضفتها في هذا المتصفح، واستعادة العينات الافتراضية. لا يمكن التراجع.','Programs, requests, changes and attachments you added in this browser will be removed and the sample data restored. This cannot be undone.'))+'<label class="check-label"><input name="confirm" type="checkbox" required>'+t('أؤكد إعادة ضبط بيانات النموذج','I confirm resetting the demonstration data')+'</label>',v=>{if(!v.confirm)throw Error('required');const s=JLSI.seed();app.persist(s);app.state=s;ui.program='P1';});
if(action==='export-programs'){
const rows=[[t('الرقم المرجعي','Reference'),t('البرنامج','Program'),t('المجال','Field'),t('البداية','Start'),t('النهاية','End'),t('الساعات','Hours'),t('المقاعد','Capacity'),t('المشاركون','Registered'),t('المتاح','Available'),t('الحالة','Status')],...app.state.programs.map(p=>[p.ref,loc(p),fieldName(p.field),p.start,p.end,p.hours,p.seats,app.participants(p.id).length,app.available(p.id),t(...statusLabels[app.status(p)])])];
download('JLSI-programs-'+lang+'.csv',JLSI.csv(rows),'text/csv;charset=utf-8');
}
if(action==='export-attendance'){
const p=app.program(ui.program),day=ui.date||p.start;
const rows=[[t('البرنامج','Program'),t('التاريخ','Date'),t('المتدرب','Learner'),t('المعرّف','Identifier'),t('الحالة','Status'),t('المبرر','Reason')],...app.participants(p.id).map(r=>{const a=app.state.attendance[[p.id,day,r.learner].join('|')];return [loc(p),day,loc(r,'name'),r.learner,t(...statusLabels[a?.status||'unrecorded']),a?.reason||''];})];
download('JLSI-attendance-'+p.id+'-'+day+'.csv',JLSI.csv(rows),'text/csv;charset=utf-8');
}
}


