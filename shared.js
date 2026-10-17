'use strict';
const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>[...root.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let storageError='';
let prefs={lang:'ar',role:'coordinator',large:false};
let saved;
try{prefs={...prefs,...JSON.parse(localStorage.getItem('jlsi.preferences')||'{}')};saved=JSON.parse(localStorage.getItem(JLSI.KEY)||'null');if(saved&&saved.version!==1)throw Error('version');}catch{storageError='read';}
let lang=prefs.lang==='en'?'en':'ar';
const t=(ar,en)=>lang==='ar'?ar:en;
const loc=(o,key='')=>key?(o[key+(lang==='ar'?'Ar':'En')]||''):(o[lang]||'');
const num=(n,d=0)=>new Intl.NumberFormat(lang==='ar'?'ar-BH':'en-GB',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
const money=n=>num(n,3)+' '+t('د.ب','BHD');
const date=d=>d?new Date(d+'T12:00:00').toLocaleDateString(lang==='ar'?'ar-BH':'en-GB',{day:'numeric',month:'short',year:'numeric'}):'—';
const app=new JLSI.Portal(saved||JLSI.seed(),state=>{try{localStorage.setItem(JLSI.KEY,JSON.stringify(state));}catch{throw Error('storage');}});
const iconPaths={
home:'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
dashboard:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
programs:'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4zM13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2',
requests:'M9 4H5v17h14V4h-4M9 2h6v4H9zM8 11h8M8 15h5',
calendar:'M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2zM7 2v6M17 2v6M3 11h18M7 15h2M13 15h2',
trainers:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M19 8a3 3 0 0 1 0 6M22 21v-3a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
attendance:'M20 11v9H4V4h11M9 11l3 3 9-10',
grades:'M4 3h16v18H4zM8 7h8M8 11h4M8 16l2 2 5-5',
evaluation:'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z',
certificates:'M16 9a5 5 0 1 1-10 0 5 5 0 0 1 10 0M7 13l-1 9 5-3 5 3-1-9',
finance:'M3 5h18v15H3zM3 9h18M16 13h5v4h-5zM6 15h3',
reports:'M4 3v18h18M8 17v-5M13 17V7M18 17V3',
archive:'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15 8h.01',
settings:'M4 7h16M4 17h16M8 4v6M16 14v6',
help:'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 4M12 18h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
search:'m20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
arrow:'M19 12H5m7-7-7 7 7 7',plus:'M12 5v14M5 12h14',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
shield:'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6zM8 12l3 3 5-6',
clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
menu:'M4 6h16M4 12h16M4 18h16',close:'m6 6 12 12M18 6 6 18',
scale:'M12 2v18M5 21h14M4 6h16M5 6l-4 8h8zM19 6l-4 8h8z'
};
const icon=(id)=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="'+(iconPaths[id]||iconPaths.programs)+'"/></svg>';
const serviceData=[
['dashboard','لوحة المتابعة','Dashboard','مؤشرات التدريب والطلبات في مكان واحد','Your training and requests at a glance','training'],
['programs','البرامج التدريبية','Training programs','اكتشف البرامج وأدر مسار اعتمادها','Explore programs and manage approvals','training'],
['requests','الترشيحات والطلبات','Nominations & requests','قدّم ترشيحًا وتابع حالة طلبك','Submit nominations and track requests','beneficiary'],
['calendar','الجدول التدريبي','Training calendar','خطط لمواعيدك واطّلع على القاعات','Plan dates and explore training venues','training'],
['trainers','المدربون والمواد','Trainers & materials','خبرات متخصصة وموارد معرفية','Specialist expertise and learning resources','training'],
['attendance','الحضور والغياب','Attendance','سجّل الحضور وراجع سجلات المشاركة','Record attendance and participation','training'],
['grades','الاختبارات والدرجات','Tests & grades','أدخل النتائج وتابع التحصيل','Record results and learning outcomes','training'],
['evaluation','التقييم وأثر التدريب','Evaluation & impact','شارك تجربتك وقِس أثر التعلم','Share feedback and assess learning impact','beneficiary'],
['certificates','الشهادات والإفادات','Certificates','تحقق من الاستحقاق وعاين الشهادة','Check eligibility and preview certificates','beneficiary'],
['finance','المستحقات والمصروفات','Expenses & payments','سجّل المستحقات وتابع دورة الصرف','Track expenses and simulated payments','training'],
['reports','التقارير والإحصاءات','Reports & statistics','قراءة شاملة لنتائج التدريب','A comprehensive view of training results','training'],
['archive','الأرشيف الإعلامي','Media archive','وثّق الفعاليات واحفظ المرفقات','Document events and preserve attachments','beneficiary']
];
const roles=[['coordinator','منسق التدريب','Training coordinator'],['director','مدير المعهد','Institute director'],['trainer','المدرب','Trainer'],['trainee','المتدرب','Trainee'],['entity','ممثل الجهة','Entity representative'],['finance','الشؤون المالية','Finance officer']];
if(!roles.some(r=>r[0]===prefs.role))prefs.role='coordinator';
const roleServices={coordinator:serviceData.map(s=>s[0]),director:serviceData.map(s=>s[0]),trainer:['dashboard','programs','calendar','trainers','attendance','grades','evaluation','reports'],trainee:['programs','requests','calendar','attendance','evaluation','certificates','archive'],entity:['programs','requests','calendar','reports','certificates'],finance:['dashboard','finance','reports']};
const manage=()=>['coordinator','director'].includes(prefs.role);
const teach=()=>manage()||prefs.role==='trainer';
const service=id=>serviceData.find(s=>s[0]===id);
const title=id=>{const s=service(id);return s?t(s[1],s[2]):({home:t('الخدمات الإلكترونية للمعهد','Institute e-services'),settings:t('الإعدادات','Settings'),guide:t('دليل الاستخدام','User guide'),program:t('تفاصيل البرنامج','Program details')})[id]||'';};
const statusLabels={draft:['مسودة','Draft'],review:['مراجعة رئيس التدريب','Head of training review'],director:['اعتماد مدير المعهد','Director approval'],open:['متاح للتسجيل','Open for registration'],completed:['مكتمل','Completed'],external:['موافقة خارجية مطلوبة','External approval required'],pending:['قيد المراجعة','Pending review'],approved:['معتمد','Approved'],rejected:['مرفوض','Rejected'],waitlist:['قائمة الانتظار','Waitlisted'],paid:['تم الصرف','Paid'],present:['حاضر','Present'],absent:['غائب','Absent'],unrecorded:['لم يسجل','Not recorded']};
const badge=(s)=>'<span class="badge '+esc(s)+'">'+esc(t(...(statusLabels[s]||[s,s])))+'</span>';
const fieldName=k=>t(...({law:['التشريع والقانون','Legislation & law'],judicial:['المهارات القضائية','Judicial skills'],rights:['حقوق الإنسان','Human rights']}[k]));
const errorLabels={required:['يرجى استكمال الحقول المطلوبة.','Please complete all required fields.'],dates:['تحقق من التواريخ؛ النهاية لا تسبق البداية والمدة لا تتجاوز ٦٠ يومًا.','Check dates: end must follow start, with a maximum of 60 days.'],positive:['أدخل قيمًا موجبة ضمن الحدود الموضحة.','Enter positive values within the specified limits.'],demoId:['استخدم معرّفًا تجريبيًا مثل DEMO-101.','Use a demo identifier such as DEMO-101.'],consent:['يلزم الإقرار بمراجعة المتطلبات.','Confirm that you reviewed the requirements.'],duplicate:['يوجد طلب نشط لهذا المتدرب في البرنامج نفسه.','This learner already has an active request for this program.'],reason:['يلزم إدخال سبب قبل حفظ هذا التعديل.','A reason is required before saving this change.'],closed:['التسجيل غير متاح قبل اكتمال الاعتمادات أو بعد اكتمال البرنامج.','Registration is unavailable before approvals or after program completion.'],state:['هذه العملية غير متاحة في الحالة الحالية.','This action is unavailable in the current state.'],participant:['المعرّف غير موجود ضمن المشاركين المعتمدين في هذا البرنامج.','The identifier is not an approved participant in this program.'],attendanceDate:['اختر تاريخًا ضمن فترة البرنامج.','Choose a date within the program dates.'],grade:['أدخل درجة بين 0 و100.','Enter a score between 0 and 100.'],rating:['أكمل التقييمات الأربعة بقيم من 1 إلى 5.','Complete all four ratings from 1 to 5.'],file:['ملف غير مدعوم أو يتجاوز 500 كيلوبايت. استخدم PDF أو PNG أو JPG أو WebP أو TXT.','Unsupported file or over 500 KB. Use PDF, PNG, JPG, WebP or TXT.'],storage:['تعذر الحفظ: مساحة التخزين ممتلئة أو التخزين محظور. لم تُحفظ العملية. احذف مرفقًا غير مطلوب أو فعّل التخزين.','Could not save: storage is full or blocked. The action was not saved. Remove an unused attachment or allow storage.'],notFound:['العنصر المطلوب غير موجود.','The requested item was not found.']};
const errorText=e=>t(...(errorLabels[e.message]||errorLabels.required));
const page=document.body.dataset.page;
let ui={program:new URLSearchParams(location.search).get('id')||(page==='certificates'||page==='grades'?'P4':'P1'),month:'2026-10',tab:'overview'};
if(!app.state.programs.some(p=>p.id===ui.program))ui.program='P1';
function preference(){try{localStorage.setItem('jlsi.preferences',JSON.stringify(prefs));}catch{toast(t('تعذر حفظ التفضيلات.','Could not save preferences.'),true);}}
function toast(message,error=false){const n=$('#toast');n.textContent=message;n.className=error?'toast error':'toast';n.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.hidden=true,7000);}
function safe(action){try{const result=action();renderPage();toast(t('تم الحفظ بنجاح.','Saved successfully.'));return result;}catch(e){toast(errorText(e),true);return null;}}
function btn(label,action,cls='secondary',attrs=''){return '<button type="button" class="btn '+cls+'" data-action="'+action+'" '+attrs+'>'+label+'</button>';}
function link(label,url,cls='secondary'){return '<a class="btn '+cls+'" href="'+esc(url)+'">'+label+'</a>';}
function empty(message=t('لا توجد نتائج مطابقة.','No matching results.')){return '<div class="empty">'+icon('search')+'<strong>'+message+'</strong><span>'+t('جرّب تغيير البحث أو التصفية.','Try changing your search or filters.')+'</span></div>';}
function panel(head,body,action=''){return '<section class="panel"><div class="section-head"><h2>'+head+'</h2>'+action+'</div>'+body+'</section>';}
function table(headers,rows){return '<div class="table-wrap"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';}
function row(cells){return '<tr>'+cells.map(v=>'<td>'+v+'</td>').join('')+'</tr>';}
function input(name,label,type='text',value='',attrs=''){return '<label class="form-field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+attrs+'></label>';}
function area(name,label,value='',attrs=''){return '<label class="form-field wide"><span>'+label+'</span><textarea name="'+name+'" rows="3" '+attrs+'>'+esc(value)+'</textarea></label>';}
function select(name,label,options,selected='',attrs=''){return '<label class="form-field"><span>'+label+'</span><select name="'+name+'" '+attrs+'>'+options.map(([v,l])=>'<option value="'+esc(v)+'" '+(String(v)===String(selected)?'selected':'')+'>'+esc(l)+'</option>').join('')+'</select></label>';}
function programSelect(selected=ui.program,onlyOpen=false){return select('program',t('البرنامج التدريبي','Training program'),app.state.programs.filter(p=>!onlyOpen||app.canRegister(p.id)).map(p=>[p.id,loc(p)]),selected,'required');}
function programPicker(extra=''){return '<div class="toolbar">'+programSelect()+extra+'</div>';}
function pageHead(sub,actions=''){return '<div class="page-head"><div><p class="eyebrow">'+t('بوابة الخدمات الإلكترونية','E-SERVICES PORTAL')+'</p><h1>'+esc(title(page))+'</h1><p>'+sub+'</p></div><div class="actions">'+actions+'</div></div>';}
function info(text){return '<div class="notice">'+icon('shield')+'<span>'+text+'</span></div>';}
function stats(items){return '<div class="stats">'+items.map(([label,value,ic,sub])=>'<div class="stat"><span class="stat-icon">'+icon(ic)+'</span><div><span>'+label+'</span><strong>'+value+'</strong><small>'+sub+'</small></div></div>').join('')+'</div>';}
function programCard(p,compact=false){return '<article class="program-card '+(compact?'compact':'')+'"><div class="program-top"><span class="field">'+fieldName(p.field)+'</span>'+badge(app.status(p))+'</div><h3><a href="program.html?id='+p.id+'">'+esc(loc(p))+'</a></h3><div class="program-meta"><span>'+icon('calendar')+date(p.start)+'</span><span>'+icon('clock')+num(p.hours)+' '+t('ساعة','hours')+'</span></div><div class="program-bottom"><span>'+t('المقاعد المتاحة','Available seats')+' <b>'+num(app.available(p.id))+'</b></span><a class="text-link" href="program.html?id='+p.id+'">'+t('التفاصيل','Details')+icon('arrow')+'</a></div></article>';}
let dialogReturn;
function modal(titleText,body,onSubmit=null,wide=false){
const d=$('#dialog');dialogReturn=document.activeElement;d.className=wide?'wide-dialog':'';
d.innerHTML='<div class="dialog-head"><h2 id="dialog-title">'+titleText+'</h2><button type="button" class="icon-btn" data-close aria-label="'+t('إغلاق','Close')+'">'+icon('close')+'</button></div><form id="modal-form" novalidate><div class="dialog-body">'+body+'<p class="form-error" role="alert" hidden></p></div>'+(onSubmit?'<div class="dialog-footer">'+btn(t('إلغاء','Cancel'),'close')+'<button type="submit" class="btn primary">'+t('حفظ ومتابعة','Save & continue')+'</button></div>':'')+'</form>';
d.showModal();
$('[data-close]',d).onclick=()=>d.close();
$('[data-action="close"]',d)?.addEventListener('click',()=>d.close());
d.onclose=()=>dialogReturn?.focus();
if(onSubmit)$('#modal-form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget;const err=$('.form-error',form);const submit=$('[type="submit"]',form);try{if(!form.checkValidity())throw Error('required');submit.disabled=true;await onSubmit(Object.fromEntries(new FormData(form)),form);d.close();renderPage();toast(t('تم الحفظ بنجاح.','Saved successfully.'));}catch(error){err.textContent=errorText(error);err.hidden=false;form.querySelector(':invalid')?.focus();}finally{submit.disabled=false;}};
}
function download(name,data,mime='text/plain;charset=utf-8'){const blob=data instanceof Blob?data:new Blob([data],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
function fileDownload(id){const f=app.state.files.find(x=>x.id===id);if(!f)return;const bytes=Uint8Array.from(atob(f.data.split(',')[1]),c=>c.charCodeAt(0));download(f.name,new Blob([bytes],{type:f.mime}));}
function readFile(file){return new Promise((resolve,reject)=>{if(!file||file.size===0||file.size>500*1024)return reject(Error('file'));const extension=file.name.split('.').pop().toLowerCase();const mime={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',txt:'text/plain'}[extension];if(!mime||file.type&&file.type!==mime)return reject(Error('file'));const reader=new FileReader();reader.onload=()=>resolve({name:file.name,size:file.size,mime,data:String(reader.result).replace(/^data:[^;]*;/,'data:'+mime+';')});reader.onerror=()=>reject(Error('file'));reader.readAsDataURL(file);});}
function upload(archive=false){modal(t('إضافة مرفق','Add attachment'),'<div class="form-grid">'+programSelect()+input('ar',t('العنوان بالعربية','Arabic title'),'text','','required maxlength="160"')+input('en',t('العنوان بالإنجليزية','English title'),'text','','required maxlength="160"')+input('attachment',t('الملف','File'),'file','','required accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"')+'</div>'+info(t('حتى 500 كيلوبايت للملف. يحفظ في هذا المتصفح فقط؛ السعة المشتركة محدودة (عادة عدة ميغابايت).','Up to 500 KB per file. Stored only in this browser; the shared quota is limited (usually a few MB).')),async(v,form)=>{const data=await readFile(form.elements.attachment.files[0]);app.addFile({...data,program:v.program,ar:v.ar,en:v.en},archive);});}
function sample(kind){download('JLSI-'+kind+'-'+lang+'.txt',kind==='guide'?t('دليل المشارك — نسخة تجريبية\nراجع أهداف البرنامج ومتطلبات المشاركة.\nاحضر جميع الجلسات وأنجز الاختبار والتكليف.\nمعايير الشهادة تجريبية وقابلة للتعديل.','Participant guide — DEMO\nReview program objectives and requirements.\nAttend all sessions and complete the test and assignment.\nCertificate thresholds are demonstration values.'):t('نموذج اختبار توضيحي — غير رسمي\n1. حلّل حالة افتراضية وحدّد المسائل القانونية.\n2. اقترح معالجة معللة.\nالدرجة من 100، والنتيجة النهائية متوسط الاختبار والتكليف.','Illustrative test — NOT OFFICIAL\n1. Analyse a hypothetical case and identify the legal issues.\n2. Propose a reasoned response.\nScore out of 100; final result is the average of test and assignment.'));}
function shell(){
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.documentElement.classList.toggle('large-text',!!prefs.large);
document.title=title(page)+' | '+t('معهد الدراسات القضائية والقانونية','Judicial & Legal Studies Institute');
const visible=roleServices[prefs.role];
$('#shell').innerHTML='<a class="skip-link" href="#main">'+t('تجاوز إلى المحتوى','Skip to content')+'</a><aside class="sidebar" id="sidebar"><a class="brand" href="index.html"><span class="brand-mark">'+icon('scale')+'</span><span>'+t('معهد الدراسات','Judicial & Legal')+'<br>'+t('القضائية والقانونية','Studies Institute')+'<small>'+t('مملكة البحرين','KINGDOM OF BAHRAIN')+'</small></span></a><p class="nav-label">'+t('مساحة العمل','WORKSPACE')+'</p><nav aria-label="'+t('الخدمات الرئيسية','Main services')+'"><a class="nav-item '+(page==='home'?'active':'')+'" href="index.html" '+(page==='home'?'aria-current="page"':'')+'>'+icon('home')+t('الرئيسية','Home')+'</a>'+serviceData.filter(s=>visible.includes(s[0])).map(s=>'<a class="nav-item '+(page===s[0]?'active':'')+'" href="'+s[0]+'.html" '+(page===s[0]?'aria-current="page"':'')+'>'+icon(s[0])+t(s[1],s[2])+'</a>').join('')+'</nav><div class="sidebar-bottom"><a class="nav-item" href="settings.html">'+icon('settings')+t('الإعدادات','Settings')+'</a><a class="nav-item" href="guide.html">'+icon('help')+t('دليل الاستخدام','User guide')+'</a><span class="sidebar-caption">'+t('معرفة راسخة. عدالة متجددة.','Knowledge for a stronger justice system.')+'</span></div></aside><div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-btn menu-button" id="menu" aria-expanded="false" aria-controls="sidebar" aria-label="'+t('القائمة','Menu')+'">'+icon('menu')+'</button><a href="index.html">'+t('البوابة الإلكترونية','E-services')+'</a><span>/</span><b>'+esc(title(page))+'</b></div><div class="top-actions"><button class="icon-btn" id="text-size" dir="ltr" aria-label="'+t('تكبير النص','Increase text size')+'" aria-pressed="'+!!prefs.large+'">A+</button><button class="lang-button" id="language">'+t('English','العربية')+'</button><span class="divider"></span><span class="avatar">'+t('ع','JI')+'</span></div></header><div class="demo-bar"><div><span class="demo-dot"></span><b>'+t('بيئة تجريبية','DEMO WORKSPACE')+'</b><span class="demo-description">'+t('للاستعراض والمراجعة — جميع البيانات افتراضية','For review and demonstration — all records are fictional')+'</span></div><label class="role-label">'+t('عرض الواجهة بصفة','Preview as')+' <select id="role">'+roles.map(r=>'<option value="'+r[0]+'" '+(r[0]===prefs.role?'selected':'')+'>'+t(r[1],r[2])+'</option>').join('')+'</select></label></div><main id="main" tabindex="-1"></main><footer><span>'+t('معهد الدراسات القضائية والقانونية · مملكة البحرين','Judicial & Legal Studies Institute · Kingdom of Bahrain')+'</span><a href="guide.html">'+t('حول النموذج وحدود الاستخدام','About this prototype')+'</a></footer></div>';
$('#language').onclick=()=>{lang=lang==='ar'?'en':'ar';prefs.lang=lang;preference();shell();renderPage();};
$('#role').onchange=e=>{prefs.role=e.target.value;preference();shell();renderPage();};
$('#text-size').onclick=()=>{prefs.large=!prefs.large;preference();document.documentElement.classList.toggle('large-text',prefs.large);$('#text-size').setAttribute('aria-pressed',String(prefs.large));};
const navPanel=$('#sidebar'); navPanel.inert=innerWidth<=1023;
$('#menu').onclick=()=>{const open=navPanel.classList.toggle('mobile-open');navPanel.inert=!open&&innerWidth<=1023;$('#menu').setAttribute('aria-expanded',String(open));if(open)navPanel.querySelector('a').focus();};
window.onresize=()=>{navPanel.inert=innerWidth<=1023&&!navPanel.classList.contains('mobile-open');};
document.onkeydown=e=>{if(e.key==='Escape'&&navPanel.classList.contains('mobile-open')){navPanel.classList.remove('mobile-open');navPanel.inert=innerWidth<=1023;$('#menu').setAttribute('aria-expanded','false');$('#menu').focus();}};
}
function renderPage(){
$('#main').innerHTML=views[page]?views[page]():empty();
if(storageError||location.protocol==='file:')$('#main').insertAdjacentHTML('afterbegin',info(storageError?t('تعذر قراءة البيانات المحلية. لن تُحفظ التغييرات إذا كان التخزين محظورًا.','Local data could not be read. Changes cannot be saved if storage is blocked.'):t('لضمان مشاركة البيانات بين الصفحات شغّل المجلد عبر GitHub Pages أو خادم محلي. فتح الملفات مباشرة قد يعزل التخزين.','For consistent storage across pages, use GitHub Pages or a local server. Opening files directly may isolate storage.')));
bindPage();
}
const views={};

