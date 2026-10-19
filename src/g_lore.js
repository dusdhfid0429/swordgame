// ================= 문파의 유래: 어디까지가 역사이고 어디부터 소설·한국 무협인가 =================
// 사용자 요청(2026-10-19, 리뷰라마 「무협 웹툰 속 문파와 세가」 분석 뒤 "적용해"): 영상의 색 구분(역사·중국 소설·한국 무협)을 문파 창에 붙인다. 글은 data/lore.json
const LORE_KIND=GD.LORE_KIND,SECT_LORE=GD.SECT_LORE;
function sectLoreHtml(id){const l=SECT_LORE[id];if(!l||!l.length)return '';
  return `<details class="lore"><summary>유래</summary>${l.map(([k,t])=>{const K=LORE_KIND[k];return `<p class="note"><b style="color:${K.c}">${K.n}</b> ${t}</p>`}).join('')}</details>`}
