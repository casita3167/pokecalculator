from pathlib import Path

path = Path('pokecalcu/index.html')
s = path.read_text(encoding='utf-8')

# Remove selection control from browse cards, while keeping detail-page team analysis.
s = s.replace('d.className="pcard"+(on?" selected":""); d.tabIndex=0; d.setAttribute("role","button");', 'd.className="pcard"; d.tabIndex=0; d.setAttribute("role","button");')
s = s.replace('d.innerHTML=`<span class="pick${on?" on":""}" data-pickkey="${key}" role="checkbox" aria-checked="${on}" aria-label="加入隊伍分析" tabindex="0"></span><img loading="lazy" src="${primary}" alt="${e.z}" ${imageFallbackAttrs(candidates)}>`;', 'd.innerHTML=`<img loading="lazy" src="${primary}" alt="${e.z}" ${imageFallbackAttrs(candidates)}>`;')
s = s.replace('\n    const pickEl=d.querySelector(".pick");\n    pickEl.addEventListener("click",ev=>{ ev.stopPropagation(); toggleTeamEntry(e); });', '')

panel = '''
  <section class="defcalc" id="defcalc" aria-labelledby="defcalc-title">
    <div class="defcalc-head">
      <div>
        <div class="defcalc-kicker">TYPE DEFENSE LAB</div>
        <h2 id="defcalc-title">屬性防禦分析</h2>
        <p>選擇原始屬性、特性與太晶屬性，即時查看目前組合的弱點、抗性與無效屬性。</p>
      </div>
      <div class="defcalc-status" id="defcalc-status">單屬性</div>
    </div>
    <div class="defcalc-controls">
      <label class="defcalc-field"><span>屬性 1</span><select id="def-type-1" aria-label="第一屬性"></select></label>
      <label class="defcalc-field"><span>屬性 2</span><select id="def-type-2" aria-label="第二屬性"></select></label>
      <label class="defcalc-field"><span>特性</span><select id="def-ability" aria-label="防禦特性"></select></label>
      <label class="defcalc-field"><span>太晶化</span><select id="def-tera" aria-label="太晶屬性"></select></label>
    </div>
    <div class="defcalc-summary" id="defcalc-summary"></div>
    <div class="defcalc-results">
      <div class="defcalc-group"><div class="defcalc-group-title"><span>弱點</span><small>WEAKNESS</small></div><div class="defcalc-chips" id="def-weak"></div></div>
      <div class="defcalc-group"><div class="defcalc-group-title"><span>抗性</span><small>RESISTANCE</small></div><div class="defcalc-chips" id="def-resist"></div></div>
      <div class="defcalc-group"><div class="defcalc-group-title"><span>無效</span><small>IMMUNITY</small></div><div class="defcalc-chips" id="def-immune"></div></div>
    </div>
    <div class="defcalc-note" id="defcalc-note"></div>
  </section>
'''

if 'id="defcalc"' not in s:
    anchor = '  <div id="result"></div>'
    if anchor not in s:
        raise SystemExit('result anchor not found')
    s = s.replace(anchor, panel + '\n' + anchor, 1)

if 'href="defcalc.css"' not in s:
    s = s.replace('</head>', '  <link rel="stylesheet" href="defcalc.css">\n</head>', 1)
if 'src="defcalc.js"' not in s:
    s = s.replace('</body>', '  <script src="defcalc.js"></script>\n</body>', 1)

path.write_text(s, encoding='utf-8')
print('updated pokecalcu/index.html')
