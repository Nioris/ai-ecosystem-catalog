/* v12.1 runtime localization safety layer.
 * Loaded after app.js. It prevents Russian source text from leaking into EN/ZH
 * when a card does not yet have a hand-written locale override.
 */
(()=>{
  const CYR2=/[А-Яа-яЁё]/;
  const baseT=t, baseTx=tx, baseContent=content;

  const TERMS={
    en:{
      "Мультимодальные":"Multimodal","Зрение/OCR":"Vision / OCR","Текст":"Text","Кодинг":"Coding","Романы":"Novels",
      "Картинки":"Images","Озвучка":"Voice / TTS","Музыка":"Music","Распознавание речи":"Speech recognition","Русский":"Russian",
      "Агенты":"Agents","Песни":"Songs","Вокал":"Vocals","Инструменты":"Tools","Документы":"Documents","Анимация":"Animation",
      "Персонажи":"Characters","Карты":"Maps","Спрайты":"Sprites","Иконки":"Icons","Оружие":"Weapons","Текстуры":"Textures",
      "Окружение":"Environments","Бесплатно":"Free","Платный":"Paid","Локальные модели":"Local models","Серверный":"Server",
      "Мультимодальная":"Multimodal","Код":"Code","Изображение":"Image","Голос":"Voice","Генерация":"Generation","Редактирование":"Editing",
      "Обучение":"Training","Память":"Memory","Поиск":"Search","Дизайн":"Design","Сервер/Workstation":"Server / Workstation",
      "Workstation/Сервер":"Workstation / Server","Дом/Сервер":"Home / Server","Облако/API":"Cloud / API","Облако/API only":"Cloud / API only"
    },
    zh:{
      "Мультимодальные":"多模态","Зрение/OCR":"视觉 / OCR","Текст":"文本","Кодинг":"编程","Романы":"小说",
      "Картинки":"图像","Озвучка":"配音 / TTS","Музыка":"音乐","Распознавание речи":"语音识别","Русский":"俄语",
      "Агенты":"Agent","Песни":"歌曲","Вокал":"人声","Инструменты":"工具","Документы":"文档","Анимация":"动画",
      "Персонажи":"角色","Карты":"地图","Спрайты":"精灵","Иконки":"图标","Оружие":"武器","Текстуры":"纹理",
      "Окружение":"环境","Бесплатно":"免费","Платный":"付费","Локальные модели":"本地模型","Серверный":"服务器",
      "Мультимодальная":"多模态","Код":"代码","Изображение":"图像","Голос":"语音","Генерация":"生成","Редактирование":"编辑",
      "Обучение":"训练","Память":"记忆","Поиск":"搜索","Дизайн":"设计","Сервер/Workstation":"服务器 / 工作站",
      "Workstation/Сервер":"工作站 / 服务器","Дом/Сервер":"家用 / 服务器","Облако/API":"云端 / API","Облако/API only":"仅云端 / API"
    }
  };

  const WORDS={
    en:[
      ["Мультимодальные","Multimodal"],["Мультимодальная","Multimodal"],["Распознавание речи","Speech recognition"],
      ["Открытые веса","Open weights"],["Зрение","Vision"],["Картинки","Images"],["Изображения","Images"],["Изображение","Image"],
      ["Озвучка","Voice / TTS"],["Кодинг","Coding"],["Романы","Novels"],["Агенты","Agents"],["Инструменты","Tools"],
      ["Документы","Documents"],["Персонажи","Characters"],["Текстуры","Textures"],["Анимация","Animation"],["Спрайты","Sprites"],
      ["Иконки","Icons"],["Оружие","Weapons"],["Окружение","Environments"],["Музыка","Music"],["Песни","Songs"],["Вокал","Vocals"],
      ["Текст","Text"],["Русский","Russian"],["Локально","Local"],["Облако","Cloud"],["Серверный","Server"],["Сервер","Server"],
      ["Дом","Home"],["Модель","Model"],["Платный","Paid"],["Бесплатно","Free"],["Генерация","Generation"],["Редактирование","Editing"],
      ["Обучение","Training"],["Память","Memory"],["Поиск","Search"],["Дизайн","Design"]
    ],
    zh:[
      ["Мультимодальные","多模态"],["Мультимодальная","多模态"],["Распознавание речи","语音识别"],
      ["Открытые веса","开放权重"],["Зрение","视觉"],["Картинки","图像"],["Изображения","图像"],["Изображение","图像"],
      ["Озвучка","配音 / TTS"],["Кодинг","编程"],["Романы","小说"],["Агенты","Agent"],["Инструменты","工具"],
      ["Документы","文档"],["Персонажи","角色"],["Текстуры","纹理"],["Анимация","动画"],["Спрайты","精灵"],
      ["Иконки","图标"],["Оружие","武器"],["Окружение","环境"],["Музыка","音乐"],["Песни","歌曲"],["Вокал","人声"],
      ["Текст","文本"],["Русский","俄语"],["Локально","本地"],["Облако","云端"],["Серверный","服务器"],["Сервер","服务器"],
      ["Дом","家用"],["Модель","模型"],["Платный","付费"],["Бесплатно","免费"],["Генерация","生成"],["Редактирование","编辑"],
      ["Обучение","训练"],["Память","记忆"],["Поиск","搜索"],["Дизайн","设计"]
    ]
  };

  function replaceKnown(s){
    let out=String(s??"");
    for(const [a,b] of (WORDS[LANG]||[]))out=out.split(a).join(b);
    return out;
  }
  function translatedTerm(value){
    const raw=String(value??"");
    let out=baseTx(raw);
    if(LANG==="ru"||!CYR2.test(out))return out;
    out=TERMS[LANG]?.[raw]||replaceKnown(out);
    if(!CYR2.test(out))return out;
    return LANG==="zh"?"其他":"Other";
  }
  tx=translatedTerm;

  function tagsFor(x){
    const vals=(x.tags2||x.cats||[]).map(v=>translatedTerm(v)).filter(v=>v&&v!=="Other"&&v!=="其他");
    return [...new Set(vals)].slice(0,6);
  }
  function techHints(raw){
    const s=String(raw||"");
    const re=/(?:\d+(?:[.,]\d+)?\s*(?:ГБ|GB)\s*(?:VRAM|RAM)?|RTX\s*\d+|B300|H100|H200|A100|CUDA(?:\s*\d+(?:\.\d+)?)?|NVIDIA|AMD|Apple Silicon|CPU|GPU|VRAM|RAM|Linux|Windows|macOS|Docker|Python|Node\.js|GGUF|vLLM|SGLang|ComfyUI|Ollama|llama\.cpp)/gi;
    const vals=(s.match(re)||[]).map(v=>v.replace(/ГБ/gi,"GB").replace(/\s+/g," ").trim());
    return [...new Set(vals)].slice(0,8);
  }
  function licenseHints(raw){
    const s=String(raw||"");
    const re=/(MIT|Apache\s*2\.0|CC\s*BY(?:-NC|-SA|-NC-SA)?\s*4\.0|CC0|GPL(?:v?\d)?|AGPL(?:v?\d)?|Unlicense|Community License|Gemma(?: license)?|Stability(?: license)?)/gi;
    return [...new Set((s.match(re)||[]))].slice(0,3);
  }
  function genericDesc(x){
    const kind=translatedTerm(x.kind||"Модель"), tags=tagsFor(x), org=x.org?String(x.org):"";
    if(LANG==="zh")return tags.length?`${x.name} 是${org?` ${org} `:""}的${kind}，主要面向${tags.join("、")}等任务。`:`${x.name} 是${org?` ${org} `:""}的${kind}。请查看官方来源了解完整能力。`;
    return tags.length?`${x.name}${org?` by ${org}`:""} is a ${kind.toLowerCase()} focused on ${tags.join(", ")}.`:`${x.name}${org?` by ${org}`:""} is a ${kind.toLowerCase()}. See the official source for full capabilities.`;
  }
  function genericRequirements(x,raw){
    const s=String(raw||""), hints=techHints(s), locality=translatedTerm(x.locality||"");
    const cloud=/облак|только облако|cloud|api only/i.test(`${x.locality||""} ${s}`);
    const server=/сервер|multi[- ]?gpu|hgx|dgx|b300|h100|h200|a100/i.test(`${x.locality||""} ${s}`);
    let msg;
    if(LANG==="zh")msg=cloud?"云端 / API 服务；本地不需要 GPU。":server?"建议使用服务器级或多 GPU 环境；具体显存需求请查看官方说明。":"可本地运行；实际内存与显存需求取决于精度、量化和上下文长度。";
    else msg=cloud?"Cloud / API service; no local GPU is required.":server?"A server-class or multi-GPU setup is recommended; see the official source for exact memory requirements.":"Local deployment is supported; actual RAM/VRAM needs depend on precision, quantization and context length.";
    if(hints.length)msg+=LANG==="zh"?` 相关技术/硬件：${hints.join("、")}。`:` Detected stack/hardware: ${hints.join(", ")}.`;
    if(locality&&!msg.toLowerCase().includes(String(locality).toLowerCase()))msg+=LANG==="zh"?` 模式：${locality}。`:` Mode: ${locality}.`;
    return msg;
  }
  function genericNote(x,raw){
    const licenses=licenseHints(raw), ru=/русск/i.test(String(raw||""));
    if(LANG==="zh")return `${licenses.length?`许可证线索：${licenses.join("、")}。`:""}${ru?"支持俄语。":""}请以官方 model card / README 为准确认最新许可证、限制和部署细节。`;
    return `${licenses.length?`License hints: ${licenses.join(", ")}. `:""}${ru?"Russian is supported. ":""}Check the official model card / README for current licensing, limits and deployment details.`;
  }
  function genericPurpose(x){
    const cat=translatedTerm(x.category||x.kind||""), tags=tagsFor(x);
    if(LANG==="zh")return `${x.name}${cat?`：${cat}`:""}${tags.length?`，用于${tags.join("、")}`:""}。`;
    return `${x.name}${cat?`: ${cat}`:""}${tags.length?` for ${tags.join(", ")}`:""}.`;
  }
  function genericField(x,field,raw){
    if(field==="desc")return genericDesc(x);
    if(field==="requirements"||field==="hw")return genericRequirements(x,raw);
    if(field==="note")return genericNote(x,raw);
    if(field==="purpose"||field==="why")return genericPurpose(x);
    if(field==="risk")return LANG==="zh"?"安装或连接前请查看官方 README / SECURITY，并限制 Agent、MCP 和凭证权限。":"Review the official README / SECURITY before installation or connection, and restrict agent, MCP and credential permissions.";
    if(field==="free")return /бесплат/i.test(String(raw||""))?(LANG==="zh"?"提供免费层或免费额度；当前限制请查看价格页。":"A free tier or free credits are available; see the pricing page for current limits."):(LANG==="zh"?"免费额度以当前价格页为准。":"See the current pricing page for free-tier availability.");
    if(field==="billing")return LANG==="zh"?"订阅、点数或按量计费；以当前价格页为准。":"Subscription, credits or usage-based billing; see current pricing.";
    if(field==="commercial")return LANG==="zh"?"商业使用前请核对当前服务条款和所选模型许可证。":"Check the current service terms and selected model license before commercial use.";
    return LANG==="zh"?"详情请查看官方来源。":"See the official source for details.";
  }
  content=function(x,field){
    const value=baseContent(x,field);
    if(LANG==="ru"||!CYR2.test(String(value??"")))return value;
    return genericField(x,field,value);
  };
  fallbackFor=function(){return false};

  function safeLoose(value,type="text"){
    let s=String(value??"");
    if(LANG==="ru"||!CYR2.test(s))return s;
    if(type==="date"){
      const d=s.match(/\d{1,4}[.\/-]\d{1,2}[.\/-]\d{1,4}/)?.[0]||s.match(/\d{4}-\d{2}-\d{2}/)?.[0]||"";
      return d?(LANG==="zh"?`已验证 ${d}`:`verified ${d}`):(LANG==="zh"?"已验证":"verified");
    }
    if(type==="runtime"){
      const hints=techHints(s);return hints.length?hints.join(" / "):(LANG==="zh"?"请查看官方运行说明":"See official runtime instructions");
    }
    if(type==="price"){
      s=s.replace(/мес\.?/gi,LANG==="zh"?"月":"mo").replace(/год\.?/gi,LANG==="zh"?"年":"yr");
      s=replaceKnown(s);if(!CYR2.test(s))return s;
      const money=s.match(/(?:\$|€|¥)\s*\d+(?:[.,]\d+)?(?:\s*[-–]\s*(?:\$|€|¥)?\d+(?:[.,]\d+)?)?/g)||[];
      return money.length?money.join(" · "):(LANG==="zh"?"请查看当前价格":"See current pricing");
    }
    s=replaceKnown(s);return CYR2.test(s)?(LANG==="zh"?"请查看官方来源":"See official source"):s;
  }

  // Re-render cards with safe localized fallbacks for every visible field.
  mainCard=function(x){
    const tags=(x.tags2||x.cats||[]).slice(0,8),desc=content(x,"desc"),req=content(x,"requirements")||content(x,"hw"),note=content(x,"note");
    return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.org)} · ${esc(safeLoose(x.updated||"","date"))}</div></div><span class="kind">${esc(tx(x.kind||"Модель"))}</span></div>
    <div class="tags">${tags.map(v=>`<span class="tag">${esc(tx(v))}</span>`).join("")}<span class="tag">${esc(tx(x.status||""))}</span><span class="tag">${esc(tx(x.locality||""))}</span></div>
    <p class="desc">${esc(desc)}</p><div class="meta"><b>${esc(t("requirements"))}</b><span>${esc(req)}</span>${x.run?`<b>${esc(t("runtime"))}</b><span>${esc(safeLoose(x.run,"runtime"))}</span>`:""}</div>
    ${x.install?`<div class="code">${esc(x.install)}</div>`:""}${note?`<div class="note">${esc(note)}</div>`:""}<div class="actions"><a class="btn primary" href="${esc(x.source)}" target="_blank" rel="noopener">${esc(t("source"))}</a>${x.install?`<button class="btn copy" data-copy="${encodeURIComponent(x.install)}">${esc(t("copy"))}</button>`:""}</div></article>`;
  };
  paidCard=function(x){
    const purpose=content(x,"purpose"),note=content(x,"note");
    return `<article class="card"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(tx(x.category))} · ${esc(safeLoose(x.checked||"","date"))}</div></div><p class="desc">${esc(purpose)}</p><div class="price">${esc(safeLoose(x.price,"price"))}</div><div class="meta"><b>${esc(t("free"))}</b><span>${esc(content(x,"free"))}</span><b>${esc(t("billing"))}</b><span>${esc(content(x,"billing"))}</span><b>${esc(t("commercial"))}</b><span>${esc(content(x,"commercial"))}</span></div>${note?`<div class="note">${esc(note)}</div>`:""}<div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">${esc(t("service"))}</a><a class="btn" href="${esc(x.pricing_url)}" target="_blank">${esc(t("pricing"))}</a></div></article>`;
  };
  repoCard=function(x){
    const [grade,label,cls]=health(x),purpose=content(x,"purpose"),note=content(x,"note");
    return `<article class="card"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(x.slug)}</div></div><span class="health ${cls}">${esc(grade)} · ${esc(label)}</span></div><div class="tags">${x.stars?`<span class="tag stars">★ ${fmtStars(x.stars)}</span>`:""}${x.forks?`<span class="tag">${esc(t("forks"))} ${fmtStars(x.forks)}</span>`:""}${x.license?`<span class="tag">${esc(x.license)}</span>`:""}${x.pushed?`<span class="tag">${esc(t("push"))} ${esc(x.pushed)}</span>`:""}${x.verified?`<span class="tag">✓ ${esc(tx(x.verified))}</span>`:""}</div><p class="desc">${esc(purpose)}</p><div class="code">${esc(x.clone)}</div>${note?`<div class="note">${esc(note)}</div>`:""}<div class="actions"><a class="btn primary" href="${esc(x.url)}" target="_blank">GitHub ↗</a><button class="btn copy" data-copy="${encodeURIComponent(x.clone)}">${esc(t("clone"))}</button></div></article>`;
  };
  radarCard=function(x){
    const why=content(x,"why"),risk=content(x,"risk");
    return `<article class="radar"><div class="head"><div><div class="title">${esc(x.name)}</div><div class="org">${esc(tx(x.type))} · ${esc(tx(x.source))}</div></div><span class="tag">${esc(tx(x.status))}</span></div><p>${esc(why)}</p>${x.stars?`<div class="tags"><span class="tag">★ ${fmtStars(x.stars)}</span><span class="tag">${esc(t("checked"))} ${esc(safeLoose(x.checked,"date"))}</span></div>`:""}<div class="radarRisk"><b>${esc(t("risk"))}</b> ${esc(risk)}</div><div class="actions" style="margin-top:10px"><a class="btn primary" href="${esc(x.url)}" target="_blank">${esc(t("open"))}</a></div></article>`;
  };

  t=function(key){
    if(key==="version")return LANG==="zh"?"v12.1 · 2026年9月1日。":LANG==="en"?"v12.1 · September 1, 2026.":"v12.1 · 1 сентября 2026.";
    if(key==="title")return `AI Ecosystem Catalog v12.1`;
    return baseT(key);
  };
})();
