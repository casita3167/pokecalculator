from pathlib import Path
p=Path('pokecalcu/index.html')
s=p.read_text(encoding='utf-8')
s=s.replace('    pickEl.addEventListener("keydown",ev=>{ if(ev.key==="Enter"||ev.key===" "){ ev.preventDefault(); ev.stopPropagation(); toggleTeamEntry(e); } });\n','')
p.write_text(s,encoding='utf-8')
