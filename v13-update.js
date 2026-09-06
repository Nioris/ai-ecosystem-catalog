/* v13 release-data patch: Sep 6, 2026
 * Loads new model cards and updates stale entries without rebuilding the compressed base catalog.
 */
(()=>{
  const baseT13=t, baseTx13=tx, baseContent13=content;
  const VERSION={
    ru:"v13 · 6 сентября 2026.",
    en:"v13 · September 6, 2026.",
    zh:"v13 · 2026年9月6日。"
  };
  const TERM13={
    en:{
      "Новый":"New","Новый · rollout":"New · rollout","Ограниченный доступ":"Restricted access",
      "Экспериментальный":"Experimental","Обновление":"Update","Предыдущее поколение":"Previous generation",
      "Открытые веса":"Open weights"
    },
    zh:{
      "Новый":"新发布","Новый · rollout":"新发布 · 逐步开放","Ограниченный доступ":"受限访问",
      "Экспериментальный":"实验性","Обновление":"更新","Предыдущее поколение":"上一代",
      "Открытые веса":"开放权重"
    }
  };
  t=function(key){
    if(key==="version")return VERSION[LANG]||VERSION.ru;
    if(key==="title")return `AI Ecosystem Catalog v13`;
    return baseT13(key);
  };
  tx=function(value){
    const raw=String(value??"");
    return TERM13[LANG]?.[raw] ?? baseTx13(value);
  };
  content=function(x,field){
    const v=x?.i18n?.[LANG]?.[field];
    if(v!==undefined && v!==null && v!=="")return v;
    return baseContent13(x,field);
  };

  function waitForData(){
    return new Promise(resolve=>{
      const check=()=>{
        if(DATA?.taxonomy && Array.isArray(DATA.models) && DATA.models.length)resolve();
        else setTimeout(check,30);
      };
      check();
    });
  }
  function ensureHighlightStyles(){
    if(document.getElementById("v13Styles"))return;
    const s=document.createElement("style");
    s.id="v13Styles";
    s.textContent=`
      .releaseHub{margin:18px 0;padding:16px 18px}
      .releaseHub h2{margin:0 0 5px;font-size:18px}
      .releaseHub .muted{margin:0 0 10px}
      .releaseList{display:flex;gap:7px;flex-wrap:wrap}
      .releaseLink{display:inline-flex;gap:6px;align-items:center;padding:7px 10px;border:1px solid var(--line);border-radius:999px;background:var(--panel2);color:var(--text);text-decoration:none;font-size:12px}
      .releaseLink:hover{border-color:var(--accent);text-decoration:none}
      .releaseDate{color:var(--good);font-size:10px}
    `;
    document.head.appendChild(s);
  }
  function renderHighlights(data){
    ensureHighlightStyles();
    let el=document.getElementById("v13Highlights");
    if(!el){
      el=document.createElement("section");
      el.id="v13Highlights";
      el.className="hub releaseHub";
      const nav=document.querySelector(".navigator");
      nav?.parentNode?.insertBefore(el,nav);
    }
    const title=LANG==="zh"?"9 月新发布 / 重要更新":LANG==="en"?"September releases / important updates":"Релизы сентября / важные обновления";
    const note=LANG==="zh"?"已按官方来源复核。点击项目可打开原始发布页面。":LANG==="en"?"Checked against official sources. Open a chip to view the original release page.":"Проверено по официальным источникам. Нажмите на пункт, чтобы открыть исходный релиз.";
    el.innerHTML=`<h2>${esc(title)}</h2><p class="muted">${esc(note)}</p><div class="releaseList">${
      (data.highlights||[]).map(h=>`<a class="releaseLink" href="${esc(h.source)}" target="_blank" rel="noopener"><span class="releaseDate">${esc(h.date)}</span><b>${esc(h.name)}</b></a>`).join("")
    }</div>`;
  }

  let V13_DATA_PROMISE=null;
  async function loadV13Data(){
    if(V13_DATA_PROMISE)return V13_DATA_PROMISE;
    V13_DATA_PROMISE=(async()=>{
      const r=await fetch("data/v13-extra.b64");
      if(!r.ok)throw new Error(`data/v13-extra.b64: HTTP ${r.status}`);
      const encoded=(await r.text()).trim();
      const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
      const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      return JSON.parse(await new Response(stream).text());
    })();
    return V13_DATA_PROMISE;
  }

  async function applyV13(){
    await waitForData();
    const data=await loadV13Data();
    const allNames=new Set([...DATA.models,...DATA.tools].map(x=>x.name));
    for(const m of data.newModels||[]){
      if(!allNames.has(m.name)){DATA.models.push(m);allNames.add(m.name)}
    }
    for(const u of data.modelUpdates||[]){
      const x=[...DATA.models,...DATA.tools].find(z=>z.name===u.name);
      if(x)Object.assign(x,u.patch||{});
    }
    document.title="AI Ecosystem Catalog v13";
    const versionEl=document.getElementById("versionText");
    if(versionEl)versionEl.textContent=VERSION[LANG]||VERSION.ru;
    renderHighlights(data);
    initNavigator();initFilters();renderSummary();renderAll();
  }

  const baseSetLanguage13=setLanguage;
  setLanguage=async function(code,opts={}){
    await baseSetLanguage13(code,opts);
    const data=await loadV13Data();
    if(data)renderHighlights(data);
    const versionEl=document.getElementById("versionText");
    if(versionEl)versionEl.textContent=VERSION[LANG]||VERSION.ru;
    document.title="AI Ecosystem Catalog v13";
  };

  applyV13().catch(err=>console.error("v13 update failed",err));
})();
