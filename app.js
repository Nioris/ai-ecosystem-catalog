const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const CYR=/[А-Яа-яЁё]/;
let DATA={models:[],tools:[],paid:[],repos:[],radar:[],taxonomy:null,recipes:[]};
let state={kind:"Все",paidCat:"Все",repoCat:"Все",profession:"",task:"",quick:new Set()};
let LANG="ru", L=null, LOCALES={};

async function json(url){const r=await fetch(url);if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);return r.json()}
async function optionalJson(url){try{return await json(url)}catch(e){return null}}
function detectLanguage(){
 const qp=new URLSearchParams(location.search).get("lang");
 if(["ru","en","zh"].includes(qp))return qp;
 const saved=localStorage.getItem("catalog-language");
 if(["ru","en","zh"].includes(saved))return saved;
 const b=(navigator.language||"").toLowerCase();
 if(b.startsWith("zh"))return"zh";if(b.startsWith("en"))return"en";return"ru";
}
async function loadLocale(code){
 if(!LOCALES[code])LOCALES[code]=await json(`locales/${code}.json`);
 return LOCALES[code];
}
function t(key){return L?.ui?.[key]??key}
function tx(value){if(value==null)return"";return L?.terms?.[String(value)]??String(value)}
function content(x,field){
 const override=L?.content?.[x.name]?.[field];
 return override!==undefined?override:(x?.[field]??"");
}
function fallbackFor(x,field){
 if(LANG==="ru")return false;
 if(L?.content?.[x.name]?.[field]!==undefined)return false;
 return CYR.test(String(x?.[field]??""));
}
function localeCode(){return LANG==="zh"?"zh-Hans":LANG==="en"?"en":"ru"}
function setStaticText(){
 document.documentElement.lang=L.htmlLang||LANG;
 document.title=t("title");
 const meta=$("#metaDescription");if(meta)meta.setAttribute("content",t("metaDescription"));
 $("#versionText").textContent=t("version");
 $("#heroText").textContent=t("hero");
 $("#languageLabel").textContent=t("language");
 $("#loadingText") && ($("#loadingText").textContent=t("loading"));
 $("#navigatorTitle").textContent=t("navigatorTitle");
 $("#navigatorText").textContent=t("navigatorText");
 $("#professionLabel").textContent=t("profession");
 $("#taskLabel").textContent=t("task");
 $("#clearNavigator").textContent=t("clear");
 $("#recipesTitle").textContent=t("recipesTitle");
 $("#recipesText").textContent=t("recipesText");
 $("#tabCatalog").textContent=t("tabCatalog");
 $("#tabPaid").textContent=t("tabPaid");
 $("#tabRepos").textContent=t("tabRepos");
 $("#tabRadar").textContent=t("tabRadar");
 $("#catalogQ").placeholder=t("catalogPlaceholder");
 $("#paidQ").placeholder=t("paidPlaceholder");
 $("#repoQ").placeholder=t("repoPlaceholder");
 const cs=$("#catalogSort").options;cs[0].text=t("sortRecommended");cs[1].text=t("sortNewest");cs[2].text=t("sortName");
 const ps=$("#paidSort").options;ps[0].text=t("sortName");ps[1].text=t("sortFree");
 const rs=$("#repoSort").options;rs[0].text=t("sortCurated");rs[1].text="Stars ↓";rs[2].text=t("sortHealth");rs[3].text=t("sortName");
 $("#repoWarning").textContent=t("repoWarning");
 $("#radarTitle").textContent=t("radarTitle");
 $("#radarText").textContent=t("radarText");
 $("#footerText").textContent=t("footer");
 $$(".langBtn").forEach(b=>b.classList.toggle("active",b.dataset.lang===LANG));
}
async function setLanguage(code,{initial=false}={}){
 if(!["ru","en","zh"].includes(code))code="ru";
 LANG=code;L=await loadLocale(code);
 localStorage.setItem("catalog-language",code);
 const u=new URL(location.href);u.searchParams.set("lang",code);
 if(!initial)history.replaceState(null,"",u);
 setStaticText();
 if(DATA.taxonomy){initNavigator();initFilters();renderSummary();renderAll()}
}
async function load(){
 LANG=detectLanguage();L=await loadLocale(LANG);setStaticText();
 const partNames=["data/catalog.part1a","data/catalog.part2","data/catalog.part3","data/catalog.part4a","data/catalog.part4b"];
 const [encodedParts,extra,healthSnapshot]=await Promise.all([
   Promise.all(partNames.map(u=>fetch(u).then(r=>{if(!r.ok)throw new Error(`${u}: HTTP ${r.status}`);return r.text()}))),
   json("data/v11-extra.json"),
   optionalJson("data/repo-health.json")
 ]);
 const encoded=encodedParts.join("");
 const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
 const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
 const base=JSON.parse(await new Response(stream).text());
 const tools=[...base.tools];
 for(const u of extra.itemUpdates||[]){const x=tools.find(z=>z.name===u.name);if(x)Object.assign(x,u.patch)}
 for(const x of extra.newTools||[]){if(!tools.some(z=>z.name===x.name))tools.push(x)}
 const repos=[...base.repos];
 for(const r of extra.repoAdditions||[]){const i=repos.findIndex(z=>z.slug===r.slug);i>=0?repos[i]=Object.assign({},repos[i],r):repos.push(r)}
 const liveHealth=healthSnapshot?.repositories||{};for(const r of repos){if(liveHealth[r.slug])Object.assign(r,liveHealth[r.slug])}
 DATA={models:base.models,tools,paid:base.paid,repos,radar:extra.radar||[],taxonomy:extra.taxonomy,recipes:extra.recipes||[]};
 renderSummary();initNavigator();initFilters();renderAll();
}
function renderSummary(){
 const vals=[
  `${DATA.models.length+DATA.tools.length} ${t("cards")}`,
  `${DATA.models.length} ${t("models")}`,
  `${DATA.tools.length} ${t("tools")}`,
  `${DATA.paid.length} ${t("paid")}`,
  `${DATA.repos.length} ${t("github")}`,
  `${DATA.radar.length} ${t("radar")}`
 ];
 $("#summary").innerHTML=vals.map(x=>`<span class="pill"><b>${esc(x)}</b></span>`).join("");
}
function makeChips(el,vals,current,setter,labelFn=x=>tx(x)){
 el.innerHTML=vals.map(v=>`<button class="chip ${v===current?"active":""}" data-v="${esc(v)}">${esc(labelFn(v))}</button>`).join("");
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>{setter(b.dataset.v);renderAll();initFilters()});
}
function localizedHay(x){
 const fields=["desc","requirements","note","purpose","category","status","locality","kind","free","billing","commercial"];
 return [
  x.name,x.org,x.slug,x.source,x.install,x.run,x.url,x.price,x.license,
  ...fields.map(f=>content(x,f)),...fields.map(f=>tx(x[f]||"")),
  ...(x.tags2||[]),...(x.cats||[])
 ].join(" ").toLowerCase();
}
function hay(x){return [
 x.name,x.org,x.desc,x.kind,x.status,x.locality,x.requirements,x.note,x.purpose,x.category,x.slug,x.license,x.source,x.install,x.run,x.url,x.price,x.free,x.billing,x.commercial,
 ...(x.tags2||[]),...(x.cats||[]),localizedHay(x)
].join(" ").toLowerCase()}
function expandQuery(q){
 const tokens=q.toLowerCase().split(/\s+/).filter(Boolean),out=[...tokens];
 const maps=[DATA.taxonomy?.synonyms||{},L?.searchSynonyms||{}];
 for(const token of tokens)for(const map of maps)for(const [k,vals] of Object.entries(map)){if(token===k||token.includes(k))out.push(...vals)}
 return[...new Set(out)];
}
function queryMatch(x,q){if(!q)return true;const h=hay(x),terms=expandQuery(q);return terms.every(v=>h.includes(v.toLowerCase()))||terms.some(v=>h.includes(v.toLowerCase()))}
function keywordScore(x,keywords=[]){const h=hay(x);return(keywords||[]).reduce((n,k)=>n+(h.includes(k.toLowerCase())?1:0),0)}
function roleTaskMatch(x){
 let score=0;
 if(state.profession){const p=DATA.taxonomy.professions.find(z=>z.id===state.profession);const s=keywordScore(x,p?.keywords);if(!s)return-1;score+=s*3}
 if(state.task){const q=DATA.taxonomy.tasks.find(z=>z.id===state.task);const s=keywordScore(x,q?.keywords);if(!s)return-1;score+=s*4}
 return score
}
function quickMatch(x){
 const h=hay(x);
 for(const id of state.quick){const f=DATA.taxonomy.quickFilters.find(z=>z.id===id);if(f&&!f.match.some(k=>h.includes(k.toLowerCase())))return false}
 return true
}
function professionLabel(x){return L.professions?.[x.id]||x.label}
function taskLabel(x){return L.tasks?.[x.id]||x.label}
function quickLabel(x){return L.quickFilters?.[x.id]||x.label}
function initNavigator(){
 const p=$("#profession"),q=$("#task");
 p.innerHTML=`<option value="">${esc(t("allProfessions"))}</option>`+DATA.taxonomy.professions.map(x=>`<option value="${esc(x.id)}">${esc(professionLabel(x))}</option>`).join("");
 q.innerHTML=`<option value="">${esc(t("allTasks"))}</option>`+DATA.taxonomy.tasks.map(x=>`<option value="${esc(x.id)}">${esc(taskLabel(x))}</option>`).join("");
 p.value=state.profession;q.value=state.task;
 p.onchange=()=>{state.profession=p.value;renderAll()};q.onchange=()=>{state.task=q.value;renderAll()};
 $("#quickFilters").innerHTML=DATA.taxonomy.quickFilters.map(x=>`<button class="chip ${state.quick.has(x.id)?"active":""}" data-id="${esc(x.id)}">${esc(quickLabel(x))}</button>`).join("");
 $("#quickFilters").querySelectorAll("button").forEach(b=>b.onclick=()=>{const id=b.dataset.id;state.quick.has(id)?state.quick.delete(id):state.quick.add(id);initNavigator();renderAll()});
 $("#recipes").innerHTML=DATA.recipes.map(r=>{const lr=L.recipes?.[r.name]||r;return`<button class="recipe" data-p="${esc(r.profession)}" data-t="${esc(r.task)}"><b>${esc(lr.name||r.name)}</b><small>${esc(lr.note||r.note)}</small></button>`}).join("");
 $("#recipes").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.profession=b.dataset.p;state.task=b.dataset.t;p.value=state.profession;q.value=state.task;activateTab("catalog");renderAll();window.scrollTo({top:document.querySelector(".tabs").offsetTop-10,behavior:"smooth"})});
 $("#clearNavigator").onclick=()=>{state.profession="";state.task="";state.quick.clear();initNavigator();renderAll()}
}
function initFilters(){
 makeChips($("#catalogKinds"),["Все",...new Set([...DATA.models,...DATA.tools].map(x=>x.kind||"Модель"))],state.kind,v=>state.kind=v,v=>v==="Все"?(LANG==="zh"?"全部":LANG==="en"?"All":"Все"):tx(v));
 makeChips($("#paidFilters"),["Все",...new Set(DATA.paid.map(x=>x.category))],state.paidCat,v=>state.paidCat=v,v=>v==="Все"?(LANG==="zh"?"全部":LANG==="en"?"All":"Все"):tx(v));
 makeChips($("#repoFilters"),["Все",...new Set(DATA.repos.map(x=>x.category))],state.repoCat,v=>state.repoCat=v,v=>v==="Все"?(LANG==="zh"?"全部":LANG==="en"?"All":"Все"):tx(v));
}
function fallbackBadge(x,field){
 return fallbackFor(x,field)?`<span class="tag fallbackTag" title="${esc(t("originalContentNote"))}">${esc(t("contentFallback"))}</span>`:""
}
function mainCard(x){
 const tags=(x.tags2||x.cats||[]).slice(0,8),desc=content(x,"desc"),req=content(x,"requirements")||content(x,"hw"),note=content(x,"note");
 return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.org)} · ${esc(x.updated||"")}</div></div><span class="kind">${esc(tx(x.kind||"Модель"))}</span></div>
 <div class="tags">${tags.map(v=>`<span class="tag">${esc(tx(v))}</span>`).join("")}<span class="tag">${esc(tx(x.status||""))}</span><span class="tag">${esc(tx(x.locality||""))}</span>${fallbackBadge(x,"desc")}</div>
 <p class="desc">${esc(desc)}</p>
 <div class="meta"><b>${esc(t("requirements"))}</b><span>${esc(req)}</span>${x.run?`<b>${esc(t("runtime"))}</b><span>${esc(x.run)}</span>`:""}</div>
 ${x.install?`<div class="code">${esc(x.install)}</div>`:""}${note?`<div class="note">${esc(note)}</div>`:""}
 <div class="actions"><a class="btn primary" href="${esc(x.source)}" target="_blank" rel="noopener">${esc(t("source"))}</a>${x.install?`<button class="btn copy" data-copy="${encodeURIComponent(x.install)}">${esc(t("copy"))}</button>`:""}</div></article>`
}
function paidCard(x){
 const purpose=content(x,"purpose"),note=content(x,"note");
 return `<article class="card"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(tx(x.category))} · ${esc(x.checked||"")}</div></div>
 <div class="tags">${fallbackBadge(x,"purpose")}</div><p class="desc">${esc(purpose)}</p><div class="price">${esc(x.price)}</div>
 <div class="meta"><b>${esc(t("free"))}</b><span>${esc(content(x,"free"))}</span><b>${esc(t("billing"))}</b><span>${esc(content(x,"billing"))}</span><b>${esc(t("commercial"))}</b><span>${esc(content(x,"commercial"))}</span></div>
 ${note?`<div class="note">${esc(note)}</div>`:""}<div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">${esc(t("service"))}</a><a class="btn" href="${esc(x.pricing_url)}" target="_blank">${esc(t("pricing"))}</a></div></article>`
}
function fmtStars(n){if(!n)return"";return n>=1000?(n/1000).toFixed(n>=10000?1:2).replace(/\.0$/,'')+"K":String(n)}
function health(r){
 if(r.archived)return["D",t("healthArchived"),"d"];
 const s=(r.status||"").toLowerCase();
 if(s.startsWith("a"))return["A",t("healthActive"),"a"];if(s.startsWith("b"))return["B",t("healthExperimental"),"b"];
 if(s.includes("legacy")||s.includes("класс"))return["C",t("healthLegacy"),"c"];return["—",t("healthCurated"),"b"]
}
function repoCard(x){
 const [grade,label,cls]=health(x),purpose=content(x,"purpose"),note=content(x,"note");
 return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.slug)}</div></div><span class="health ${cls}">${esc(grade)} · ${esc(label)}</span></div>
 <div class="tags">${x.stars?`<span class="tag stars">★ ${fmtStars(x.stars)}</span>`:""}${x.forks?`<span class="tag">${esc(t("forks"))} ${fmtStars(x.forks)}</span>`:""}${x.license?`<span class="tag">${esc(x.license)}</span>`:""}${x.pushed?`<span class="tag">${esc(t("push"))} ${esc(x.pushed)}</span>`:""}${x.verified?`<span class="tag">✓ ${esc(tx(x.verified))}</span>`:""}${fallbackBadge(x,"purpose")}</div>
 <p class="desc">${esc(purpose)}</p><div class="code">${esc(x.clone)}</div>${note?`<div class="note">${esc(note)}</div>`:""}
 <div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">GitHub ↗</a><button class="btn copy" data-copy="${encodeURIComponent(x.clone)}">${esc(t("clone"))}</button></div></article>`
}
function radarCard(x){
 const why=content(x,"why"),risk=content(x,"risk");
 return `<article class="radar"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(tx(x.type))} · ${esc(tx(x.source))}</div></div><span class="tag">${esc(tx(x.status))}</span></div>
 <div class="tags">${fallbackBadge(x,"why")}</div><p>${esc(why)}</p>${x.stars?`<div class="tags"><span class="tag">★ ${fmtStars(x.stars)}</span><span class="tag">${esc(t("checked"))} ${esc(x.checked)}</span></div>`:""}
 <div class="radarRisk"><b>${esc(t("risk"))}</b> ${esc(risk)}</div><div class="actions" style="margin-top:10px"><a class="btn primary" href="${esc(x.url)}" target="_blank">${esc(t("open"))}</a></div></article>`
}
function wireCopy(){
 $$(".copy").forEach(b=>b.onclick=async()=>{const s=decodeURIComponent(b.dataset.copy);try{await navigator.clipboard.writeText(s);const old=b.textContent;b.textContent=t("copied");setTimeout(()=>b.textContent=old,1000)}catch(e){prompt(t("copyPrompt"),s)}})
}
function sortNewest(a,b){return String(b.updated||"").localeCompare(String(a.updated||""),localeCode())}
function stats(n,total,extra=""){return`${t("shown")} ${n} ${t("of")} ${total}${extra?` · ${extra}`:""}`}
function renderCatalog(){
 const q=$("#catalogQ").value.trim(),all=[...DATA.models,...DATA.tools];
 let rows=all.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.kind==="Все"||(z.x.kind||"Модель")===state.kind)&&quickMatch(z.x)&&queryMatch(z.x,q));
 const mode=$("#catalogSort").value;
 if(mode==="relevance")rows.sort((a,b)=>b.score-a.score);
 if(mode==="newest")rows.sort((a,b)=>sortNewest(a.x,b.x));
 if(mode==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,localeCode()));
 $("#catalogGrid").innerHTML=rows.length?rows.map(z=>mainCard(z.x)).join(""):`<div class="empty">${esc(t("noResults"))}</div>`;
 $("#catalogStats").textContent=stats(rows.length,all.length,state.profession||state.task||state.quick.size?t("selectionActive"):"");wireCopy()
}
function renderPaid(){
 const q=$("#paidQ").value.trim();let rows=DATA.paid.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.paidCat==="Все"||z.x.category===state.paidCat)&&queryMatch(z.x,q));
 if($("#paidSort").value==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,localeCode()));
 else rows.sort((a,b)=>(/free|бесплат/i.test(b.x.free||"")?1:0)-(/free|бесплат/i.test(a.x.free||"")?1:0));
 $("#paidGrid").innerHTML=rows.length?rows.map(z=>paidCard(z.x)).join(""):`<div class="empty">${esc(t("noResults"))}</div>`;
 $("#paidStats").textContent=stats(rows.length,DATA.paid.length,state.profession||state.task?t("selectionActive"):"")
}
function renderRepos(){
 const q=$("#repoQ").value.trim();let rows=DATA.repos.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.repoCat==="Все"||z.x.category===state.repoCat)&&queryMatch(z.x,q));
 const mode=$("#repoSort").value;
 if(mode==="stars")rows.sort((a,b)=>(b.x.stars||0)-(a.x.stars||0));
 if(mode==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,localeCode()));
 if(mode==="health")rows.sort((a,b)=>health(a.x)[0].localeCompare(health(b.x)[0]));
 $("#repoGrid").innerHTML=rows.length?rows.map(z=>repoCard(z.x)).join(""):`<div class="empty">${esc(t("noResults"))}</div>`;
 const verified=`${t("metadataVerified")}: ${rows.filter(z=>z.x.verified).length}`;
 $("#repoStats").textContent=stats(rows.length,DATA.repos.length,verified+(state.profession||state.task?` · ${t("selectionActive")}`:""));wireCopy()
}
function renderRadar(){$("#radarGrid").innerHTML=DATA.radar.map(radarCard).join("")}
function renderAll(){renderCatalog();renderPaid();renderRepos();renderRadar()}
function activateTab(id){$$(".tab").forEach(x=>x.classList.toggle("active",x.dataset.section===id));$$(".section").forEach(s=>s.classList.toggle("active",s.id===id))}
$$(".tab").forEach(b=>b.onclick=()=>activateTab(b.dataset.section));
$$(".langBtn").forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
["catalogQ","paidQ","repoQ"].forEach(id=>$("#"+id).addEventListener("input",renderAll));
["catalogSort","paidSort","repoSort"].forEach(id=>$("#"+id).addEventListener("change",renderAll));
load().catch(e=>{document.body.innerHTML=`<pre style="padding:20px">${esc(t("loadError"))} ${esc(e.message)}</pre>`});
