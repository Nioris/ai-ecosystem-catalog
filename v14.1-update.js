/* v14.1 update: Sep 11, 2026 — Uncensored / Reduced safeguards section */
(()=>{
  const baseT141=t, baseTx141=tx, baseQuickLabel141=quickLabel;
  const VERSION={ru:"v14.1 · 11 сентября 2026.",en:"v14.1 · September 11, 2026.",zh:"v14.1 · 2026年9月11日。"};
  const TERMS={
    ru:{
      "Reduced safeguards":"Без цензуры / сниженные ограничения",
      "Community model":"Community-модель",
      "Abliterated":"Abliterated",
      "Uncensored fine-tune":"Uncensored fine-tune",
      "Roleplay / Creative":"Roleplay / Creative",
      "Balanced reduced safeguards":"Balanced / сниженные ограничения",
      "Uncensored":"Без цензуры"
    },
    en:{
      "Reduced safeguards":"Uncensored / Reduced safeguards",
      "Community model":"Community model",
      "Abliterated":"Abliterated",
      "Uncensored fine-tune":"Uncensored fine-tune",
      "Roleplay / Creative":"Roleplay / Creative",
      "Balanced reduced safeguards":"Balanced reduced safeguards",
      "Uncensored":"Uncensored"
    },
    zh:{
      "Reduced safeguards":"无审查 / 弱化安全限制",
      "Community model":"社区模型",
      "Abliterated":"Abliterated / 去拒答",
      "Uncensored fine-tune":"Uncensored 微调",
      "Roleplay / Creative":"角色扮演 / 创作",
      "Balanced reduced safeguards":"Balanced / 弱化安全限制",
      "Uncensored":"无审查"
    }
  };
  t=function(key){
    if(key==="version")return VERSION[LANG]||VERSION.ru;
    if(key==="title")return"AI Ecosystem Catalog v14.1";
    return baseT141(key);
  };
  tx=function(value){const raw=String(value??"");return TERMS[LANG]?.[raw]??baseTx141(value)};
  quickLabel=function(x){
    if(x?.id==="reduced-safeguards")return LANG==="zh"?"无审查 / 弱化限制":LANG==="en"?"Uncensored / reduced safeguards":"Без цензуры";
    return baseQuickLabel141(x);
  };

  let MODELS=[];
  let cls="all";
  let size="all";

  function waitForV14(){
    return new Promise(resolve=>{
      const started=Date.now();
      const tick=()=>{
        const ready=DATA?.taxonomy&&Array.isArray(DATA.models)&&DATA.models.length>0;
        const v14Done=DATA?.tools?.some(x=>x.name==="Official Unity Agent Plugin")||Date.now()-started>5000;
        if(ready&&v14Done)resolve(); else setTimeout(tick,50);
      };tick();
    });
  }
  function addNavigatorFilter(){
    if(!DATA.taxonomy?.quickFilters?.some(x=>x.id==="reduced-safeguards")){
      DATA.taxonomy.quickFilters.push({
        id:"reduced-safeguards",
        label:"Без цензуры",
        match:["reduced safeguards","uncensored","abliterated","heretic"]
      });
    }
  }
  function ensureTab(){
    if(document.getElementById("tabUncensored"))return;
    const btn=document.createElement("button");
    btn.className="chip tab";btn.dataset.section="uncensored";btn.id="tabUncensored";
    const catalogBtn=document.getElementById("tabCatalog");catalogBtn?.after(btn);
    btn.onclick=()=>activateTab("uncensored");

    const sec=document.createElement("section");
    sec.id="uncensored";sec.className="section";
    sec.innerHTML=`
      <div class="warning" id="uncensoredWarning"></div>
      <div class="toolbar">
        <input id="uncensoredQ" class="search" type="search">
        <div class="filterRow"><div id="uncensoredFilters" class="filters"></div><div id="uncensoredSize" class="filters"></div></div>
        <div id="uncensoredStats" class="stats"></div>
      </div>
      <main id="uncensoredGrid" class="grid"></main>`;
    document.getElementById("catalog")?.after(sec);
    document.getElementById("uncensoredQ")?.addEventListener("input",renderUncensored);
  }
  function ui(){
    if(LANG==="zh")return{
      tab:"无审查 / 弱化限制",warning:"社区修改模型：安全拒答和防护被有意削弱。它们不一定更聪明、更准确或更可靠。若连接工具、自动化或公开服务，请增加自己的权限边界、日志和内容控制。",
      placeholder:"搜索：Qwen、Gemma、GLM、DeepSeek、roleplay、GGUF…",all:"全部",abl:"Abliterated",fine:"Uncensored 微调",creative:"角色扮演 / 创作",balanced:"Balanced",small:"≤12B",mid:"20–35B",large:"100B+",shown:"显示",of:"共",base:"基础模型",type:"修改类型",size:"规模 / 格式",risk:"Safeguard 风险",requirements:"硬件 / 环境",source:"模型页 ↗",copy:"复制运行命令"};
    if(LANG==="en")return{
      tab:"Uncensored / Reduced safeguards",warning:"Community-modified models with intentionally reduced refusal/safety behavior. They are not necessarily smarter, more accurate or more reliable. Add your own permission boundaries, logging and moderation before connecting tools, automation or public endpoints.",
      placeholder:"Search: Qwen, Gemma, GLM, DeepSeek, roleplay, GGUF…",all:"All",abl:"Abliterated",fine:"Uncensored fine-tune",creative:"Roleplay / Creative",balanced:"Balanced",small:"≤12B",mid:"20–35B",large:"100B+",shown:"Showing",of:"of",base:"Base model",type:"Modification",size:"Size / format",risk:"Safeguard risk",requirements:"Requirements",source:"Model page ↗",copy:"Copy run command"};
    return{
      tab:"Без цензуры",warning:"Community-модели с намеренно ослабленными отказами и safeguards. Они не обязательно умнее, точнее или надёжнее обычных моделей. Перед подключением инструментов, автоматизации или публичного API добавляйте собственные permission boundaries, логирование и модерацию.",
      placeholder:"Поиск: Qwen, Gemma, GLM, DeepSeek, roleplay, GGUF…",all:"Все",abl:"Abliterated",fine:"Uncensored fine-tune",creative:"Roleplay / Creative",balanced:"Balanced",small:"≤12B",mid:"20–35B",large:"100B+",shown:"Показано",of:"из",base:"Базовая модель",type:"Тип модификации",size:"Размер / формат",risk:"Риск safeguards",requirements:"Железо / среда",source:"Страница модели ↗",copy:"Копировать команду"};
  }
  function sizeGroup(m){
    const p=String(m.params||"");
    if(/(?:8B|9B|12B|4B active)/i.test(p))return"small";
    if(/27B|28B|31B|35B/i.test(p))return"mid";
    return"large";
  }
  function classGroup(m){
    const c=String(m.safeguardClass||"").toLowerCase();
    if(c.includes("roleplay"))return"creative";
    if(c.includes("balanced"))return"balanced";
    if(c.includes("abliterated"))return"abl";
    return"fine";
  }
  function chips(){
    const u=ui();
    const classVals=[["all",u.all],["abl",u.abl],["fine",u.fine],["creative",u.creative],["balanced",u.balanced]];
    const sizeVals=[["all",u.all],["small",u.small],["mid",u.mid],["large",u.large]];
    const cf=document.getElementById("uncensoredFilters"),sf=document.getElementById("uncensoredSize");
    if(cf){cf.innerHTML=classVals.map(([id,label])=>`<button class="chip ${cls===id?"active":""}" data-id="${id}">${esc(label)}</button>`).join("");cf.querySelectorAll("button").forEach(b=>b.onclick=()=>{cls=b.dataset.id;chips();renderUncensored()})}
    if(sf){sf.innerHTML=sizeVals.map(([id,label])=>`<button class="chip ${size===id?"active":""}" data-id="${id}">${esc(label)}</button>`).join("");sf.querySelectorAll("button").forEach(b=>b.onclick=()=>{size=b.dataset.id;chips();renderUncensored()})}
  }
  function localField(m,field){return content(m,field)||m[field]||""}
  function uncensoredCard(m){
    const u=ui(),desc=localField(m,"desc"),req=localField(m,"requirements"),note=localField(m,"note");
    const risk=String(m.risk||"");
    return `<article class="card"><div class="head"><div><div class="title">${esc(m.name)}</div><div class="org">${esc(m.org||"")} · ${esc(m.updated||"")}</div></div><span class="kind">${esc(tx(m.safeguardClass||"Reduced safeguards"))}</span></div>
      <div class="tags"><span class="tag">${esc(m.params||"")}</span><span class="tag">${esc(m.format||"")}</span>${(m.tags2||[]).slice(0,5).map(x=>`<span class="tag">${esc(tx(x))}</span>`).join("")}</div>
      <p class="desc">${esc(desc)}</p>
      <div class="meta"><b>${esc(u.base)}</b><span>${esc(m.baseModel||"")}</span><b>${esc(u.type)}</b><span>${esc(tx(m.safeguardClass||""))}</span><b>${esc(u.size)}</b><span>${esc(`${m.params||""} · ${m.format||""}`)}</span><b>${esc(u.risk)}</b><span>${esc(risk)}</span><b>${esc(u.requirements)}</b><span>${esc(req)}</span></div>
      ${m.install?`<div class="code">${esc(m.install)}</div>`:""}${note?`<div class="note">${esc(note)}</div>`:""}
      <div class="actions"><a class="btn primary" href="${esc(m.source)}" target="_blank" rel="noopener">${esc(u.source)}</a>${m.install?`<button class="btn copy" data-copy="${encodeURIComponent(m.install)}">${esc(u.copy)}</button>`:""}</div></article>`;
  }
  function renderUncensored(){
    if(!MODELS.length)return;
    ensureTab();const u=ui();
    const tab=document.getElementById("tabUncensored");if(tab)tab.textContent=u.tab;
    const w=document.getElementById("uncensoredWarning");if(w)w.textContent=u.warning;
    const qel=document.getElementById("uncensoredQ");if(qel)qel.placeholder=u.placeholder;
    const q=(qel?.value||"").trim().toLowerCase();
    let rows=MODELS.filter(m=>(cls==="all"||classGroup(m)===cls)&&(size==="all"||sizeGroup(m)===size));
    if(q)rows=rows.filter(m=>[m.name,m.org,m.baseModel,m.safeguardClass,m.params,m.format,localField(m,"desc"),...(m.tags2||[])].join(" ").toLowerCase().includes(q));
    const g=document.getElementById("uncensoredGrid");if(g)g.innerHTML=rows.length?rows.map(uncensoredCard).join(""):`<div class="empty">${esc(t("noResults"))}</div>`;
    const s=document.getElementById("uncensoredStats");if(s)s.textContent=`${u.shown} ${rows.length} ${u.of} ${MODELS.length}`;
    chips();wireCopy();
  }
  async function apply141(){
    await waitForV14();
    const data=await json("data/v14.1-uncensored.json");MODELS=data.models||[];
    const names=new Set(DATA.models.map(x=>x.name));for(const m of MODELS){if(!names.has(m.name)){DATA.models.push(m);names.add(m.name)}}
    addNavigatorFilter();ensureTab();
    document.title="AI Ecosystem Catalog v14.1";const v=document.getElementById("versionText");if(v)v.textContent=VERSION[LANG]||VERSION.ru;
    initNavigator();initFilters();renderSummary();renderAll();renderUncensored();
  }
  const baseSetLanguage141=setLanguage;
  setLanguage=async function(code,opts={}){await baseSetLanguage141(code,opts);document.title="AI Ecosystem Catalog v14.1";const v=document.getElementById("versionText");if(v)v.textContent=VERSION[LANG]||VERSION.ru;renderUncensored()};
  apply141().catch(err=>console.error("v14.1 update failed",err));
})();
