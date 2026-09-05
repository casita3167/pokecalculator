(() => {
  const box = document.getElementById('defcalc');
  if (!box) return;

  // Keep the homepage clean: show the defense calculator only after pressing PICK.
  box.classList.add('defcalc-collapsed');
  const picker = document.createElement('div');
  picker.className = 'defcalc-picker';
  picker.innerHTML = `
    <button class="defcalc-pick-btn" type="button" aria-expanded="false" aria-controls="defcalc">
      <span class="defcalc-pick-main">PICK</span>
      <span class="defcalc-pick-sub">選取屬性</span>
      <span class="defcalc-pick-arrow">＋</span>
    </button>`;
  box.parentNode.insertBefore(picker, box);
  const pickBtn = picker.querySelector('.defcalc-pick-btn');
  const pickArrow = picker.querySelector('.defcalc-pick-arrow');
  pickBtn.addEventListener('click', () => {
    const opening = box.classList.contains('defcalc-collapsed');
    box.classList.toggle('defcalc-collapsed', !opening);
    picker.classList.toggle('open', opening);
    pickBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    pickArrow.textContent = opening ? '−' : '＋';
    if (opening) box.scrollIntoView({behavior:'smooth', block:'nearest'});
  });

  const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
  const ZH = {normal:'一般',fire:'火',water:'水',electric:'電',grass:'草',ice:'冰',fighting:'格鬥',poison:'毒',ground:'地面',flying:'飛行',psychic:'超能力',bug:'蟲',rock:'岩石',ghost:'幽靈',dragon:'龍',dark:'惡',steel:'鋼',fairy:'妖精'};
  const COLOR = {normal:'#828282',fire:'#E5623E',water:'#3199E1',electric:'#DFBC28',grass:'#429837',ice:'#47C9C8',fighting:'#E48F21',poison:'#9354CB',ground:'#A3733D',flying:'#75AACF',psychic:'#EA6C8D',bug:'#A09F27',rock:'#AAA482',ghost:'#6E4570',dragon:'#576FBC',dark:'#504647',steel:'#74AFCB',fairy:'#E08CE1'};
  const CHART = {
    normal:{rock:.5,ghost:0,steel:.5}, fire:{fire:.5,water:.5,grass:2,ice:2,bug:2,rock:.5,dragon:.5,steel:2}, water:{fire:2,water:.5,grass:.5,ground:2,rock:2,dragon:.5}, electric:{water:2,electric:.5,grass:.5,ground:0,flying:2,dragon:.5},
    grass:{fire:.5,water:2,grass:.5,poison:.5,ground:2,flying:.5,bug:.5,rock:2,dragon:.5,steel:.5}, ice:{fire:.5,water:.5,grass:2,ice:.5,ground:2,flying:2,dragon:2,steel:.5}, fighting:{normal:2,ice:2,poison:.5,flying:.5,psychic:.5,bug:.5,rock:2,ghost:0,dark:2,steel:2,fairy:.5},
    poison:{grass:2,poison:.5,ground:.5,rock:.5,ghost:.5,steel:0,fairy:2}, ground:{fire:2,electric:2,grass:.5,poison:2,flying:0,bug:.5,rock:2,steel:2}, flying:{electric:.5,grass:2,fighting:2,bug:2,rock:.5,steel:.5}, psychic:{fighting:2,poison:2,psychic:.5,dark:0,steel:.5},
    bug:{fire:.5,grass:2,fighting:.5,poison:.5,flying:.5,psychic:2,ghost:.5,dark:2,steel:.5,fairy:.5}, rock:{fire:2,ice:2,fighting:.5,ground:.5,flying:2,bug:2,steel:.5}, ghost:{normal:0,psychic:2,ghost:2,dark:.5}, dragon:{dragon:2,steel:.5,fairy:0}, dark:{fighting:.5,psychic:2,ghost:2,dark:.5,fairy:.5}, steel:{fire:.5,water:.5,electric:.5,ice:2,rock:2,steel:.5,fairy:2}, fairy:{fire:.5,fighting:2,poison:.5,dragon:2,dark:2,steel:.5}
  };

  const ABILITIES = [
    ['', '無特性修正'], ['levitate','飄浮｜地面無效'], ['eelevate','鰻鰻高升｜地面無效'], ['earth-eater','食土｜地面無效'], ['flash-fire','引火｜火無效'], ['well-baked-body','焦香之軀｜火無效'],
    ['water-absorb','儲水｜水無效'], ['storm-drain','引水｜水無效'], ['water-compaction','遇水凝固｜水無效'], ['volt-absorb','蓄電｜電無效'], ['motor-drive','電氣引擎｜電無效'], ['lightning-rod','避雷針｜電無效'], ['sap-sipper','食草｜草無效'],
    ['thick-fat','厚脂肪｜火、冰傷害減半'], ['heatproof','耐熱｜火傷害減半'], ['water-bubble','水泡｜火傷害減半'], ['dry-skin','乾燥皮膚｜水無效、火增傷'], ['purifying-salt','潔淨之鹽｜幽靈傷害減半'],
    ['filter','過濾｜效果絕佳傷害降低'], ['solid-rock','堅硬岩石｜效果絕佳傷害降低'], ['prism-armor','稜鏡裝甲｜效果絕佳傷害降低'], ['wonder-guard','神奇守護｜僅弱點屬性可造成傷害']
  ];

  const $ = id => document.getElementById(id);
  const type1 = $('def-type-1'), type2 = $('def-type-2'), ability = $('def-ability'), tera = $('def-tera');
  const opts = TYPES.map(t => `<option value="${t}">${ZH[t]}</option>`).join('');
  type1.innerHTML = opts;
  type2.innerHTML = '<option value="">無第二屬性</option>' + opts;
  ability.innerHTML = ABILITIES.map(([v,n]) => `<option value="${v}">${n}</option>`).join('');
  tera.innerHTML = '<option value="">不太晶化</option>' + TYPES.map(t => `<option value="${t}">太晶・${ZH[t]}</option>`).join('') + '<option value="stellar">太晶・星晶（防禦屬性不變）</option>';

  type1.value = 'normal'; type2.value = ''; ability.value = ''; tera.value = '';

  const rawMultiplier = (atk, defs) => defs.reduce((m,d) => m * ((CHART[atk] && CHART[atk][d] !== undefined) ? CHART[atk][d] : 1), 1);
  function applyAbility(atk, m, ab) {
    const immunity = {levitate:'ground',eelevate:'ground','earth-eater':'ground','flash-fire':'fire','well-baked-body':'fire','water-absorb':'water','storm-drain':'water','water-compaction':'water','volt-absorb':'electric','motor-drive':'electric','lightning-rod':'electric','sap-sipper':'grass'};
    if (immunity[ab] === atk) return 0;
    if (ab === 'thick-fat' && (atk === 'fire' || atk === 'ice')) m *= .5;
    if ((ab === 'heatproof' || ab === 'water-bubble') && atk === 'fire') m *= .5;
    if (ab === 'dry-skin') { if (atk === 'water') return 0; if (atk === 'fire') m *= 1.25; }
    if (ab === 'purifying-salt' && atk === 'ghost') m *= .5;
    if ((ab === 'filter' || ab === 'solid-rock' || ab === 'prism-armor') && m > 1) m *= .75;
    if (ab === 'wonder-guard' && m <= 1) return 0;
    return m;
  }
  function pretty(m) {
    const map = {0:'×0',0.125:'×⅛',0.25:'×¼',0.375:'×⅜',0.5:'×½',0.75:'×¾',1:'×1',1.25:'×1¼',1.5:'×1½',2:'×2',3:'×3',4:'×4'};
    return map[m] || `×${Math.round(m * 1000) / 1000}`;
  }
  const typeBadge = (t,label=ZH[t]) => `<span class="type-badge" style="background:${COLOR[t]}">${label}<span class="en">${t}</span></span>`;
  const resultChip = x => `<span class="defchip"><span class="defchip-dot" style="background:${COLOR[x.t]}"></span>${ZH[x.t]} <b>${pretty(x.m)}</b></span>`;

  function render() {
    if (type2.value === type1.value) type2.value = '';
    const original = [type1.value,type2.value].filter(Boolean);
    const tv = tera.value;
    const defensiveTypes = (tv && tv !== 'stellar') ? [tv] : original;
    const rows = TYPES.map(t => ({t, m:applyAbility(t, rawMultiplier(t, defensiveTypes), ability.value)}));
    const weak = rows.filter(x => x.m > 1).sort((a,b) => b.m-a.m);
    const resist = rows.filter(x => x.m > 0 && x.m < 1).sort((a,b) => a.m-b.m);
    const immune = rows.filter(x => x.m === 0);
    const put = (id,arr,msg) => $(id).innerHTML = arr.length ? arr.map(resultChip).join('') : `<span class="defcalc-empty">${msg}</span>`;
    put('def-weak',weak,'目前沒有屬性弱點。'); put('def-resist',resist,'目前沒有屬性抗性。'); put('def-immune',immune,'目前沒有屬性無效。');

    let summary = '<span class="defcalc-summary-label">目前防禦屬性</span>' + original.map(t => typeBadge(t)).join('');
    if (tv) {
      summary += '<span class="defcalc-arrow">→</span>';
      summary += tv === 'stellar' ? '<span class="type-badge tera-badge" style="background:#59516f">◇ 星晶<span class="en">stellar</span></span>' : typeBadge(tv,`◇ 太晶 ${ZH[tv]}`);
    }
    $('defcalc-summary').innerHTML = summary;
    $('defcalc-status').textContent = tv ? (tv === 'stellar' ? '星晶化・防禦不變' : `太晶化・${ZH[tv]}`) : (original.length === 2 ? '雙屬性' : '單屬性');

    const selected = ABILITIES.find(x => x[0] === ability.value);
    const abilityNote = ability.value ? `特性修正：${selected ? selected[1] : ability.value}。` : '';
    const teraNote = tv ? (tv === 'stellar' ? '星晶太晶不改變防禦屬性，因此仍以原始屬性組合計算。' : '一般太晶化後，防禦面改以單一太晶屬性計算。') : '';
    $('defcalc-note').innerHTML = `<strong>計算：</strong>雙屬性倍率相乘。${teraNote} ${abilityNote}`;
  }

  [type1,type2,ability,tera].forEach(el => el.addEventListener('change',render));
  render();
})();
