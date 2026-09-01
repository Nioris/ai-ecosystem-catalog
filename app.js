const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
let DATA={models:[],tools:[],paid:[],repos:[],radar:[],taxonomy:null,recipes:[]};
let state={kind:"Все",paidCat:"Все",repoCat:"Все",profession:"",task:"",quick:new Set()};

async function json(url){const r=await fetch(url);if(!r.ok)throw new Error(`${url}: HTTP ${r.status}`);return r.json()}
async function optionalJson(url){try{return await json(url)}catch(e){return null}}
async function load(){
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
 $("#summary").innerHTML=[
  `${DATA.models.length+DATA.tools.length} карточки`,`${DATA.models.length} моделей`,`${DATA.tools.length} инструментов`,
  `${DATA.paid.length} платных`,`${DATA.repos.length} GitHub`,`${DATA.radar.length} Radar`
 ].map(x=>`<span class="pill"><b>${x}</b></span>`).join("");
 initNavigator();initFilters();renderAll();
}
function chips(el,vals,setter){
 el.innerHTML=vals.map((v,i)=>`<button class="chip ${i===0?"active":""}" data-v="${esc(v)}">${esc(v)}</button>`).join("");
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>{el.querySelectorAll("button").forEach(z=>z.classList.toggle("active",z===b));setter(b.dataset.v);renderAll()});
}
function hay(x){return [x.name,x.org,x.desc,x.kind,x.status,x.locality,x.requirements,x.note,x.purpose,x.category,x.slug,x.license,x.source,x.install,x.run,x.url,x.price,x.free,x.billing,x.commercial,...(x.tags2||[]),...(x.cats||[])].join(" ").toLowerCase()}
function expandQuery(q){
 const tokens=q.toLowerCase().split(/\s+/).filter(Boolean), out=[...tokens];
 for(const t of tokens){for(const [k,vals] of Object.entries(DATA.taxonomy.synonyms||{})){if(t===k||t.includes(k))out.push(...vals)}}
 return [...new Set(out)];
}
function queryMatch(x,q){if(!q)return true;const h=hay(x),terms=expandQuery(q);return terms.every(t=>h.includes(t))||terms.some(t=>h.includes(t))}
function keywordScore(x,keywords=[]){const h=hay(x);return keywords.reduce((n,k)=>n+(h.includes(k.toLowerCase())?1:0),0)}
function roleTaskMatch(x){
 let score=0;
 if(state.profession){const p=DATA.taxonomy.professions.find(z=>z.id===state.profession);const s=keywordScore(x,p?.keywords);if(!s)return -1;score+=s*3}
 if(state.task){const t=DATA.taxonomy.tasks.find(z=>z.id===state.task);const s=keywordScore(x,t?.keywords);if(!s)return -1;score+=s*4}
 return score;
}
function quickMatch(x){
 const h=hay(x);
 for(const id of state.quick){
  const f=DATA.taxonomy.quickFilters.find(z=>z.id===id);if(f && !f.match.some(k=>h.includes(k.toLowerCase())))return false
 }
 return true
}
function initNavigator(){
 const p=$("#profession"),t=$("#task");
 p.innerHTML='<option value="">Все профессии</option>'+DATA.taxonomy.professions.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join("");
 t.innerHTML='<option value="">Все задачи</option>'+DATA.taxonomy.tasks.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join("");
 p.onchange=()=>{state.profession=p.value;renderAll()};t.onchange=()=>{state.task=t.value;renderAll()};
 $("#quickFilters").innerHTML=DATA.taxonomy.quickFilters.map(x=>`<button class="chip" data-id="${esc(x.id)}">${esc(x.label)}</button>`).join("");
 $("#quickFilters").querySelectorAll("button").forEach(b=>b.onclick=()=>{const id=b.dataset.id;state.quick.has(id)?state.quick.delete(id):state.quick.add(id);b.classList.toggle("active",state.quick.has(id));renderAll()});
 $("#recipes").innerHTML=DATA.recipes.map(r=>`<button class="recipe" data-p="${esc(r.profession)}" data-t="${esc(r.task)}"><b>${esc(r.name)}</b><small>${esc(r.note)}</small></button>`).join("");
 $("#recipes").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.profession=b.dataset.p;state.task=b.dataset.t;p.value=state.profession;t.value=state.task;activateTab("catalog");renderAll();window.scrollTo({top:document.querySelector(".tabs").offsetTop-10,behavior:"smooth"})});
 $("#clearNavigator").onclick=()=>{state.profession="";state.task="";state.quick.clear();p.value="";t.value="";$("#quickFilters").querySelectorAll("button").forEach(b=>b.classList.remove("active"));renderAll()}
}
function initFilters(){
 chips($("#catalogKinds"),["Все",...new Set([...DATA.models,...DATA.tools].map(x=>x.kind||"Модель"))],v=>state.kind=v);
 chips($("#paidFilters"),["Все",...new Set(DATA.paid.map(x=>x.category))],v=>state.paidCat=v);
 chips($("#repoFilters"),["Все",...new Set(DATA.repos.map(x=>x.category))],v=>state.repoCat=v);
}
function mainCard(x){
 const tags=(x.tags2||x.cats||[]).slice(0,8);
 return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.org)} · ${esc(x.updated||"")}</div></div><span class="kind">${esc(x.kind||"Модель")}</span></div>
 <div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}<span class="tag">${esc(x.status||"")}</span><span class="tag">${esc(x.locality||"")}</span></div>
 <p class="desc">${esc(x.desc)}</p>
 <div class="meta"><b>Требования</b><span>${esc(x.requirements||x.hw||"")}</span>${x.run?`<b>Runtime</b><span>${esc(x.run)}</span>`:""}</div>
 ${x.install?`<div class="code">${esc(x.install)}</div>`:""}${x.note?`<div class="note">${esc(x.note)}</div>`:""}
 <div class="actions"><a class="btn primary" href="${esc(x.source)}" target="_blank" rel="noopener">Источник ↗</a>${x.install?`<button class="btn copy" data-copy="${encodeURIComponent(x.install)}">Копировать</button>`:""}</div></article>`
}
function paidCard(x){return `<article class="card"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.category)} · ${esc(x.checked||"")}</div></div><p class="desc">${esc(x.purpose)}</p><div class="price">${esc(x.price)}</div><div class="meta"><b>Free</b><span>${esc(x.free)}</span><b>Оплата</b><span>${esc(x.billing)}</span><b>Коммерция</b><span>${esc(x.commercial)}</span></div>${x.note?`<div class="note">${esc(x.note)}</div>`:""}<div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">Сервис ↗</a><a class="btn" href="${esc(x.pricing_url)}" target="_blank">Тарифы</a></div></article>`}
function fmtStars(n){if(!n)return"";return n>=1000?(n/1000).toFixed(n>=10000?1:2).replace(/\.0$/,"K").replace(/(\d)$/,"$1K"):String(n)}
function health(r){
 if(r.archived)return["D","Archived","d"];
 const s=(r.status||"").toLowerCase();
 if(s.startsWith("a"))return["A","Active","a"];if(s.startsWith("b"))return["B","Experimental","b"];
 if(s.includes("legacy")||s.includes("класс"))return["C","Legacy","c"];return["—",r.status||"Curated","b"]
}
function repoCard(x){const [grade,label,cls]=health(x);return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.slug)}</div></div><span class="health ${cls}">${esc(grade)} · ${esc(label)}</span></div>
 <div class="tags">${x.stars?`<span class="tag stars">★ ${fmtStars(x.stars)}</span>`:""}${x.forks?`<span class="tag">Forks ${fmtStars(x.forks)}</span>`:""}${x.license?`<span class="tag">${esc(x.license)}</span>`:""}${x.pushed?`<span class="tag">push ${esc(x.pushed)}</span>`:""}${x.verified?`<span class="tag">✓ ${esc(x.verified)}</span>`:""}</div>
 <p class="desc">${esc(x.purpose)}</p><div class="code">${esc(x.clone)}</div>${x.note?`<div class="note">${esc(x.note)}</div>`:""}
 <div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">GitHub ↗</a><button class="btn copy" data-copy="${encodeURIComponent(x.clone)}">Клонировать</button></div></article>`}
function radarCard(x){return `<article class="radar"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.type)} · ${esc(x.source)}</div></div><span class="tag">${esc(x.status)}</span></div><p>${esc(x.why)}</p>${x.stars?`<div class="tags"><span class="tag">★ ${fmtStars(x.stars)}</span><span class="tag">проверено ${esc(x.checked)}</span></div>`:""}<div class="radarRisk"><b>Риск/оговорка:</b> ${esc(x.risk)}</div><div class="actions" style="margin-top:10px"><a class="btn primary" href="${esc(x.url)}" target="_blank">Открыть ↗</a></div></article>`}
function wireCopy(){$$(".copy").forEach(b=>b.onclick=async()=>{const s=decodeURIComponent(b.dataset.copy);try{await navigator.clipboard.writeText(s);let o=b.textContent;b.textContent="Скопировано";setTimeout(()=>b.textContent=o,1000)}catch(e){prompt("Скопируйте:",s)}})}
function sortNewest(a,b){return String(b.updated||"").localeCompare(String(a.updated||""),"ru")}
function renderCatalog(){
 const q=$("#catalogQ").value.trim(), all=[...DATA.models,...DATA.tools];
 let rows=all.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0 && (state.kind==="Все"||(z.x.kind||"Модель")===state.kind) && quickMatch(z.x) && queryMatch(z.x,q));
 const mode=$("#catalogSort").value;
 if(mode==="relevance")rows.sort((a,b)=>b.score-a.score);
 if(mode==="newest")rows.sort((a,b)=>sortNewest(a.x,b.x));
 if(mode==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,"ru"));
 $("#catalogGrid").innerHTML=rows.length?rows.map(z=>mainCard(z.x)).join(""):'<div class="empty">Ничего не найдено. Снимите один из фильтров или попробуйте другой запрос.</div>';
 $("#catalogStats").textContent=`Показано ${rows.length} из ${all.length}`+(state.profession||state.task||state.quick.size?" · активен подбор":"");wireCopy()
}
function renderPaid(){
 const q=$("#paidQ").value.trim();let rows=DATA.paid.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.paidCat==="Все"||z.x.category===state.paidCat)&&queryMatch(z.x,q));
 if($("#paidSort").value==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,"ru"));
 else rows.sort((a,b)=>(/free|бесплат/i.test(b.x.free||"")?1:0)-(/free|бесплат/i.test(a.x.free||"")?1:0));
 $("#paidGrid").innerHTML=rows.map(z=>paidCard(z.x)).join("");$("#paidStats").textContent=`Показано ${rows.length} из ${DATA.paid.length}`+(state.profession||state.task?" · активен подбор":"")
}
function renderRepos(){
 const q=$("#repoQ").value.trim();let rows=DATA.repos.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.repoCat==="Все"||z.x.category===state.repoCat)&&queryMatch(z.x,q));
 const mode=$("#repoSort").value;
 if(mode==="stars")rows.sort((a,b)=>(b.x.stars||0)-(a.x.stars||0));
 if(mode==="name")rows.sort((a,b)=>a.x.name.localeCompare(b.x.name,"ru"));
 if(mode==="health")rows.sort((a,b)=>health(a.x)[0].localeCompare(health(b.x)[0]));
 $("#repoGrid").innerHTML=rows.map(z=>repoCard(z.x)).join("");$("#repoStats").textContent=`Показано ${rows.length} из ${DATA.repos.length} · metadata verified: ${rows.filter(z=>z.x.verified).length}`+(state.profession||state.task?" · активен подбор":"");wireCopy()
}
function renderRadar(){$("#radarGrid").innerHTML=DATA.radar.map(radarCard).join("")}
function renderAll(){renderCatalog();renderPaid();renderRepos();renderRadar()}
function activateTab(id){$$(".tab").forEach(x=>x.classList.toggle("active",x.dataset.section===id));$$(".section").forEach(s=>s.classList.toggle("active",s.id===id))}
$$(".tab").forEach(b=>b.onclick=()=>activateTab(b.dataset.section));
["catalogQ","paidQ","repoQ"].forEach(id=>$("#"+id).addEventListener("input",renderAll));
["catalogSort","paidSort","repoSort"].forEach(id=>$("#"+id).addEventListener("change",renderAll));
load().catch(e=>{document.body.innerHTML=`<pre style="padding:20px">Не удалось загрузить данные: ${esc(e.message)}</pre>`});
