// ================= 용어 눌러서 풀이 (v219, 개선 계획 3절 · 동훈님 2026-11-01) =================
// 무협 용어는 없애지 않고, 창 안에 나온 용어를 금빛 점선으로 표시해 누르면 두 줄 풀이를 띄운다.
// 한 번 본 용어는 무림록 첫 화면의 '강호 용어'에 쌓인다(G.glos, 저장 칸의 모든 생에 이어진다). 풀이는 data/glossary.json (GLOSS)
const GLOSS=GD.GLOSS,GL_KEYS=Object.keys(GLOSS.terms).sort((a,b)=>b.length-a.length);
// 한 글자 용어(벽)는 앞 글자가 한글이면 고르지 않는다 (절벽·석벽)
const GL_RE=new RegExp(GL_KEYS.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).map(k=>k.length===1?`(?<![가-힣])${k}`:k).join('|'),'g');
// 창 본문에서 용어를 찾아 감싼다. 단추·입력·탭 안은 건드리지 않는다(누르면 단추가 눌리므로). 한 창에서 같은 용어는 처음 한 번만
function glossMark(root){if(!root)return;const seen=new Set(),tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    const p=n.parentElement;if(!p||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;return p.closest(GLOSS.skip)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  const nodes=[];while(tw.nextNode())nodes.push(tw.currentNode);let left=GLOSS.max;
  for(const n of nodes){if(left<=0)break;const s=n.nodeValue;GL_RE.lastIndex=0;let m,last=0,frag=null;
    while((m=GL_RE.exec(s))&&left>0){const k=m[0];if(seen.has(k))continue;seen.add(k);left--;
      frag=frag||document.createDocumentFragment();frag.appendChild(document.createTextNode(s.slice(last,m.index)));
      const sp=document.createElement('span');sp.className='term';sp.dataset.term=k;sp.textContent=k;sp.setAttribute('role','button');sp.tabIndex=0;frag.appendChild(sp);last=m.index+k.length}
    if(frag){frag.appendChild(document.createTextNode(s.slice(last)));n.parentNode.replaceChild(frag,n)}}}
hook('panelDrawn',()=>glossMark($('wbody')));
// 풀이 말풍선: 누른 용어 아래(화면 아래쪽이면 위)에 띄운다. 다른 곳을 누르면 닫힌다
const GTIP=document.createElement('div');GTIP.className='gtip';GTIP.hidden=true;GTIP.setAttribute('role','tooltip');document.body.appendChild(GTIP);
function glossShow(el){const k=el.dataset.term,t=GLOSS.terms[k];if(!t)return;
  G.glos=G.glos||{};const fresh=!G.glos[k];G.glos[k]=1;
  GTIP.innerHTML=`<b>${esc(k)}</b>${fresh?' <small>무림록에 실림</small>':''}<p>${esc(t)}</p>`;GTIP.hidden=false;
  const r=el.getBoundingClientRect(),w=Math.min(300,innerWidth-24);GTIP.style.width=w+'px';
  GTIP.style.left=clamp(r.left+r.width/2-w/2,12,innerWidth-w-12)+'px';
  const h=GTIP.offsetHeight;GTIP.style.top=(r.bottom+h+12<innerHeight?r.bottom+6:Math.max(8,r.top-h-6))+'px'}
const glossHide=()=>{GTIP.hidden=true};
addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.term');if(t){e.stopPropagation();e.preventDefault();glossShow(t);return}if(!GTIP.hidden)glossHide()},true);
addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&document.activeElement&&document.activeElement.classList.contains('term')){e.preventDefault();glossShow(document.activeElement)}else if(e.key==='Escape')glossHide()});
hook('panelOpen',glossHide);
// 무림록 첫 화면 끝: 한 번 본 강호 용어
function glossBook(){const ks=GL_KEYS.filter(k=>G.glos&&G.glos[k]).sort();
  return `<div class="card"><h4>강호 용어 <small class="dim">${ks.length}/${GL_KEYS.length} · 창 안의 금빛 점선 글자를 누르면 실린다</small></h4>${ks.length?ks.map(k=>`<p><b class="gold">${esc(k)}</b> <span class="note">${esc(GLOSS.terms[k])}</span></p>`).join(''):'<p class="dim">아직 실린 용어가 없다.</p>'}</div>`}
hook('npcDlg',c=>{if(c.n&&c.n.id==='lore'&&!c.n.sect&&typeof c.html==='string'&&!c.html.includes('강호 용어'))c.html+=glossBook()});
