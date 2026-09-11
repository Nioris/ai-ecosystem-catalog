/* v14 update: Sep 11, 2026 — Unity agent stack + new models/tools */
(()=>{
  const baseT14=t, baseTx14=tx;
  const VERSION={ru:"v14 · 11 сентября 2026.",en:"v14 · September 11, 2026.",zh:"v14 · 2026年9月11日。"};
  const TERMS={
    en:{"Game Engine AI":"Game Engine AI","Open Beta":"Open Beta"},
    zh:{"Game Engine AI":"游戏引擎 AI","Open Beta":"公开测试","Предыдущее поколение":"上一代"}
  };
  t=function(key){if(key==="version")return VERSION[LANG]||VERSION.ru;if(key==="title")return"AI Ecosystem Catalog v14";return baseT14(key)};
  tx=function(value){const raw=String(value??"");return TERMS[LANG]?.[raw]??baseTx14(value)};

  function waitForBase(){
    return new Promise(resolve=>{
      const started=Date.now();
      const tick=()=>{
        const ready=DATA?.taxonomy&&Array.isArray(DATA.models)&&DATA.models.length>0;
        const v13Done=DATA.models.some(x=>/Astra/i.test(x.name))||Date.now()-started>3500;
        if(ready&&v13Done)resolve(); else setTimeout(tick,40);
      };tick();
    });
  }
  let P=null;
  async function loadV14(){if(!P)P=json("data/v14-extra.json");return P}

  function addUnique(arr,item,key="name"){
    if(!arr.some(x=>x[key]===item[key]))arr.push(item);
  }
  function applyTranslations(data){
    const repoI18n={
      "Unity-Technologies/unity-agent-plugin":{
        en:{purpose:"Official Unity skills/plugin integrations for Claude Code, Codex and Grok, with Unity CLI/MCP live Editor workflows.",note:"First-party Unity repository; plugin announced Sep 9, 2026."},
        zh:{purpose:"Unity 官方面向 Claude Code、Codex 和 Grok 的 Skills/插件集成，并结合 Unity CLI/MCP 实现实时 Editor 工作流。",note:"Unity 第一方仓库，插件于 2026年9月9日发布。"}
      },
      "openai/tunnel-client":{
        en:{purpose:"Securely connects private/localhost MCP servers to ChatGPT, Codex, Responses API and AgentKit without a public inbound endpoint.",note:"Apache-2.0; outbound-only tunnel architecture."},
        zh:{purpose:"无需公网入站 endpoint，即可安全连接 private/localhost MCP Server 到 ChatGPT、Codex、Responses API 和 AgentKit。",note:"Apache-2.0；仅出站 Tunnel 架构。"}
      }
    };
    for(const r of data.repoAdditions||[])r.i18n=repoI18n[r.slug]||r.i18n;
    const radarI18n={
      "Unity Agent Plugin":{
        en:{why:"The first official Unity plugin for coding agents: skills + CLI + MCP/live Editor control.",risk:"The agent can change scenes, assets and C# in the Editor; use version control and approvals for sensitive operations."},
        zh:{why:"首个 Unity 官方 coding agent 插件：Skills + CLI + MCP / 实时 Editor 控制。",risk:"Agent 可以修改场景、Assets 和 C#；敏感操作应配合版本控制和人工确认。"}
      },
      "OpenAI Secure MCP Tunnel":{
        en:{why:"New official way to connect private MCP endpoints to ChatGPT/Codex without running a public server.",risk:"Requires careful tunnel/API credential handling and a correct network/permission model."},
        zh:{why:"新的官方方式，可将私有 MCP endpoint 连接到 ChatGPT/Codex，而无需运行公网服务器。",risk:"需要妥善管理 tunnel/API 凭据以及网络和权限模型。"}
      }
    };
    for(const r of data.radarAdditions||[])r.i18n=radarI18n[r.name]||r.i18n;
  }
  function renderV14Highlights(data){
    const old=document.getElementById("v13Highlights");if(old)old.style.display="none";
    let el=document.getElementById("v14Highlights");
    if(!el){el=document.createElement("section");el.id="v14Highlights";el.className="hub releaseHub";const nav=document.querySelector(".navigator");nav?.parentNode?.insertBefore(el,nav)}
    const title=LANG==="zh"?"9 月 11 日更新 / Unity Agent":LANG==="en"?"Sep 11 refresh / Unity agent stack":"Обновление 11 сентября / Unity agent stack";
    const note=LANG==="zh"?"新增 Unity Agent 工具链、DeepSeek V4.1 Flash、Qwen Max 更新及新的 MCP/Agent 工具。":LANG==="en"?"Unity agent tooling, DeepSeek V4.1 Flash, Qwen Max update and new MCP/agent tools.":"Добавлены Unity agent-инструменты, DeepSeek V4.1 Flash, Qwen Max и новые MCP/agent проекты.";
    el.innerHTML=`<h2>${esc(title)}</h2><p class="muted">${esc(note)}</p><div class="releaseList">${(data.highlights||[]).map(h=>`<a class="releaseLink" href="${esc(h.source)}" target="_blank" rel="noopener"><span class="releaseDate">${esc(h.date)}</span><b>${esc(h.name)}</b></a>`).join("")}</div>`;
  }
  async function applyV14(){
    await waitForBase();const data=await loadV14();applyTranslations(data);
    const names=new Set([...DATA.models,...DATA.tools].map(x=>x.name));
    for(const m of data.newModels||[]){if(!names.has(m.name)){DATA.models.push(m);names.add(m.name)}}
    for(const x of data.newTools||[]){if(!names.has(x.name)){DATA.tools.push(x);names.add(x.name)}else{const cur=[...DATA.models,...DATA.tools].find(z=>z.name===x.name);if(cur)Object.assign(cur,x)}}
    for(const u of data.modelUpdates||[]){const x=[...DATA.models,...DATA.tools].find(z=>z.name===u.name);if(x)Object.assign(x,u.patch||{})}
    for(const r of data.repoAdditions||[])addUnique(DATA.repos,r,"slug");
    for(const r of data.radarAdditions||[])addUnique(DATA.radar,r,"name");
    document.title="AI Ecosystem Catalog v14";const v=document.getElementById("versionText");if(v)v.textContent=VERSION[LANG]||VERSION.ru;
    renderV14Highlights(data);initNavigator();initFilters();renderSummary();renderAll();
  }
  const baseSetLanguage14=setLanguage;
  setLanguage=async function(code,opts={}){await baseSetLanguage14(code,opts);const data=await loadV14();renderV14Highlights(data);document.title="AI Ecosystem Catalog v14";const v=document.getElementById("versionText");if(v)v.textContent=VERSION[LANG]||VERSION.ru;renderAll()};
  applyV14().catch(err=>console.error("v14 update failed",err));
})();
