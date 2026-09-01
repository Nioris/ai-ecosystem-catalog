/* v12.2 guided-filter fix.
 * - uses token-aware keyword matching instead of raw substring includes()
 * - makes profession/task selectors cascade in both directions
 * - shows live result counts and removable active filters
 */
(()=>{
  const baseT12=t;
  t=function(key){
    const value=baseT12(key);
    if(key==="version")return String(value).replace(/v12(?:\.1)?/i,"v12.2");
    if(key==="title")return String(value).replace(/v12(?:\.1)?/i,"v12.2");
    return value;
  };

  const PROF_TASKS={
    "game-dev":["html-game","sprite","game-ui","game-vfx","3d-asset","animation","image","video-gen","music","tts","coding-agent","local-llm","skills-mcp"],
    "frontend":["html-game","game-ui","image","coding-agent","browser","skills-mcp","local-llm"],
    "backend":["coding-agent","local-llm","agent-memory","browser","skills-mcp","docs","research"],
    "ai-engineer":["local-llm","coding-agent","agent-memory","skills-mcp","browser","docs","asr","tts","image","video-gen","research"],
    "devops":["local-llm","coding-agent","agent-memory","browser","skills-mcp","research"],
    "data-research":["docs","research","agent-memory","local-llm","asr","coding-agent"],
    "uiux":["game-ui","image","sprite","3d-asset","video-gen"],
    "2d-artist":["sprite","game-ui","image","game-vfx","animation","3d-asset"],
    "3d-artist":["3d-asset","animation","game-vfx","image","video-gen"],
    "animator":["animation","game-vfx","video-gen","video-fix","3d-asset","tts"],
    "video":["video-gen","video-fix","tts","asr","music","image","animation"],
    "music":["music","tts","asr","video-gen"],
    "voice":["tts","asr","video-gen","music"],
    "writer":["novel","research","docs","tts","image","local-llm"],
    "marketing":["image","video-gen","video-fix","music","tts","research","docs"],
    "office":["docs","research","agent-memory","asr","tts","local-llm"]
  };

  function norm(s){return String(s??"").toLowerCase().normalize("NFKC")}
  function reEsc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}
  function keywordHitText(text,keyword){
    const h=norm(text),k=norm(keyword).trim();if(!k)return false;
    const left=/^[a-z0-9]/.test(k)?"(^|[^a-z0-9])":"";
    const right=/[a-z0-9]$/.test(k)?"($|[^a-z0-9])":"";
    try{return new RegExp(left+reEsc(k)+right,"i").test(h)}catch(e){return h.includes(k)}
  }
  function matchAny(x,keywords=[]){const h=hay(x);return(keywords||[]).some(k=>keywordHitText(h,k))}
  function matchScore(x,keywords=[]){const h=hay(x);return(keywords||[]).reduce((n,k)=>n+(keywordHitText(h,k)?1:0),0)}

  keywordScore=function(x,keywords=[]){return matchScore(x,keywords)};
  roleTaskMatch=function(x){
    let score=0;
    if(state.profession){
      const p=DATA.taxonomy.professions.find(z=>z.id===state.profession),s=matchScore(x,p?.keywords||[]);
      if(!s)return-1;score+=s*3;
    }
    if(state.task){
      const q=DATA.taxonomy.tasks.find(z=>z.id===state.task),s=matchScore(x,q?.keywords||[]);
      if(!s)return-1;score+=s*5;
    }
    return score;
  };
  quickMatch=function(x){
    for(const id of state.quick){
      const f=DATA.taxonomy.quickFilters.find(z=>z.id===id);
      if(f&&!matchAny(x,f.match||[]))return false;
    }
    return true;
  };

  function compatibleProfession(p,task){return!task||(PROF_TASKS[p.id]||[]).includes(task)}
  function compatibleTask(task,profession){return!profession||(PROF_TASKS[profession]||[]).includes(task.id)}
  function currentRoleRows(){return[...DATA.models,...DATA.tools].filter(x=>roleTaskMatch(x)>=0)}
  function quickCount(filter){
    const selected=[...state.quick].filter(id=>id!==filter.id);
    return currentRoleRows().filter(x=>{
      for(const id of selected){const f=DATA.taxonomy.quickFilters.find(z=>z.id===id);if(f&&!matchAny(x,f.match||[]))return false}
      return matchAny(x,filter.match||[]);
    }).length;
  }

  initNavigator=function(){
    const p=$("#profession"),q=$("#task");
    const profs=DATA.taxonomy.professions.filter(x=>compatibleProfession(x,state.task));
    const tasks=DATA.taxonomy.tasks.filter(x=>compatibleTask(x,state.profession));
    p.innerHTML=`<option value="">${esc(t("allProfessions"))}</option>`+profs.map(x=>`<option value="${esc(x.id)}">${esc(professionLabel(x))}</option>`).join("");
    q.innerHTML=`<option value="">${esc(t("allTasks"))}</option>`+tasks.map(x=>`<option value="${esc(x.id)}">${esc(taskLabel(x))}</option>`).join("");
    p.value=state.profession;q.value=state.task;
    p.onchange=()=>{
      state.profession=p.value;
      if(state.profession&&state.task&&!(PROF_TASKS[state.profession]||[]).includes(state.task))state.task="";
      initNavigator();renderAll();
    };
    q.onchange=()=>{
      state.task=q.value;
      if(state.profession&&state.task&&!(PROF_TASKS[state.profession]||[]).includes(state.task))state.profession="";
      initNavigator();renderAll();
    };
    $("#quickFilters").innerHTML=DATA.taxonomy.quickFilters.map(x=>`<button class="chip ${state.quick.has(x.id)?"active":""}" data-id="${esc(x.id)}">${esc(quickLabel(x))} <small>${quickCount(x)}</small></button>`).join("");
    $("#quickFilters").querySelectorAll("button").forEach(b=>b.onclick=()=>{const id=b.dataset.id;state.quick.has(id)?state.quick.delete(id):state.quick.add(id);initNavigator();renderAll()});
    $("#recipes").innerHTML=DATA.recipes.map(r=>{const lr=L.recipes?.[r.name]||r;return`<button class="recipe" data-p="${esc(r.profession)}" data-t="${esc(r.task)}"><b>${esc(lr.name||r.name)}</b><small>${esc(lr.note||r.note)}</small></button>`}).join("");
    $("#recipes").querySelectorAll("button").forEach(b=>b.onclick=()=>{state.profession=b.dataset.p;state.task=b.dataset.t;initNavigator();activateTab("catalog");renderAll();window.scrollTo({top:document.querySelector(".tabs").offsetTop-10,behavior:"smooth"})});
    $("#clearNavigator").onclick=()=>{state.profession="";state.task="";state.quick.clear();state.kind="Все";initNavigator();initFilters();renderAll()};
    renderActiveFilters();
  };

  function activeLabels(){
    const out=[];
    if(state.profession){const p=DATA.taxonomy.professions.find(x=>x.id===state.profession);if(p)out.push({type:"profession",id:p.id,label:professionLabel(p)})}
    if(state.task){const q=DATA.taxonomy.tasks.find(x=>x.id===state.task);if(q)out.push({type:"task",id:q.id,label:taskLabel(q)})}
    for(const id of state.quick){const f=DATA.taxonomy.quickFilters.find(x=>x.id===id);if(f)out.push({type:"quick",id,label:quickLabel(f)})}
    if(state.kind!=="Все")out.push({type:"kind",id:state.kind,label:tx(state.kind)});
    return out;
  }
  function ensureActiveBar(){
    let el=$("#activeFilters");if(el)return el;
    el=document.createElement("div");el.id="activeFilters";el.className="filters activeFilters";
    const stats=$("#catalogStats");stats.parentNode.insertBefore(el,stats);
    return el;
  }
  function renderActiveFilters(){
    if(!DATA.taxonomy)return;
    const el=ensureActiveBar(),rows=activeLabels();
    el.innerHTML=rows.map(r=>`<button class="chip active" data-type="${esc(r.type)}" data-id="${esc(r.id)}">${esc(r.label)} ×</button>`).join("");
    el.style.display=rows.length?"flex":"none";
    el.querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const type=b.dataset.type,id=b.dataset.id;
      if(type==="profession")state.profession="";
      if(type==="task")state.task="";
      if(type==="quick")state.quick.delete(id);
      if(type==="kind")state.kind="Все";
      initNavigator();initFilters();renderAll();
    });
  }

  const baseRenderCatalog12=renderCatalog;
  renderCatalog=function(){
    baseRenderCatalog12();renderActiveFilters();
    const labels=activeLabels().map(x=>x.label);
    if(labels.length)$("#catalogStats").textContent+=` · ${labels.join(" → ")}`;
  };

  renderSummary=function(){
    const all=[...DATA.models,...DATA.tools],q=$("#catalogQ")?.value?.trim()||"";
    const current=all.map(x=>({x,score:roleTaskMatch(x)})).filter(z=>z.score>=0&&(state.kind==="Все"||(z.x.kind||"Модель")===state.kind)&&quickMatch(z.x)&&queryMatch(z.x,q)).length;
    const guided=!!(state.profession||state.task||state.quick.size||state.kind!=="Все"||q);
    const vals=[
      guided?`${t("shown")} ${current} ${t("of")} ${all.length}`:`${all.length} ${t("cards")}`,
      `${DATA.models.length} ${t("models")}`,
      `${DATA.tools.length} ${t("tools")}`,
      `${DATA.paid.length} ${t("paid")}`,
      `${DATA.repos.length} ${t("github")}`,
      `${DATA.radar.length} ${t("radar")}`
    ];
    $("#summary").innerHTML=vals.map((x,i)=>`<span class="pill ${guided&&i===0?"resultPill":""}"><b>${esc(x)}</b></span>`).join("");
  };

  const baseRenderAll12=renderAll;
  renderAll=function(){baseRenderAll12();renderSummary();renderActiveFilters()};
})();
