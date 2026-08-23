import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

export function buildVisualPlan(pack, outline = { sections: [] }) {
  const candidates = outline.sections.filter(section => section.visual_candidate === true);
  const candidateIds = candidates.map(section => section.section_id);
  const compatibleIds = candidates
    .filter(section => /WebKit|온디바이스|파싱|실행 위치|데이터 흐름|기존 경로/i.test(`${section.title} ${section.purpose}`))
    .map(section => section.section_id);
  const incompatibleIds = candidateIds.filter(id => !compatibleIds.includes(id));
  const decision = pack.evidence.find(item => item.type === "decision" && /WebKit|온디바이스|파싱/i.test(item.statement));
  const implementation = pack.evidence.find(item => item.type === "fact" && /WebKit|문서|파싱/i.test(item.statement));
  if (!decision || !implementation) {
    return {
      visuals: [],
      decisions: candidateIds.map(section_id => ({
        section_id,
        decision: "omit",
        diagram_id: null,
        reason: "필수 관계를 그릴 direct 또는 corroborated Evidence가 부족하다. 이 상태로는 publish candidate가 될 수 없다.",
      })),
    };
  }
  if (compatibleIds.length === 0) {
    return {
      visuals: [],
      decisions: candidateIds.map(section_id => ({
        section_id,
        decision: "omit",
        diagram_id: null,
        reason: "현재 renderer의 WebKit architecture와 다른 관계다. section 유형에 맞는 별도 diagram을 만들어야 한다.",
      })),
    };
  }
  const covered = compatibleIds;
  return {
    visuals: [{
      diagram_id: "D001",
      section_id: "S03",
      covers_section_ids: covered,
      purpose: "서버 파싱에서 iOS WebKit 온디바이스 처리로 바뀐 실행 위치를 비교한다.",
      type_hint: "architecture",
      evidence_ids: [decision.id, implementation.id],
      nodes: [
        { id: "web-document-before", label: "Web document", evidence_ids: [decision.id] },
        { id: "server-parser", label: "Server parser", evidence_ids: [decision.id] },
        { id: "web-document-after", label: "Web document", evidence_ids: [implementation.id] },
        { id: "webkit", label: "WebKit", evidence_ids: [decision.id, implementation.id] },
        { id: "ios-app", label: "iOS App", evidence_ids: [decision.id, implementation.id] }
      ],
      edges: [
        { from: "web-document-before", to: "server-parser", label: "before: parsing", evidence_ids: [decision.id] },
        { from: "web-document-after", to: "webkit", label: "reads document", evidence_ids: [implementation.id] },
        { from: "webkit", to: "ios-app", label: "local normalization", evidence_ids: [implementation.id] }
      ],
      excluded: ["Evidence에 없는 서버 컴포넌트 제거", "확인되지 않은 성능 개선 수치", "출처 없는 보안 경계"],
      formats: ["html", "svg", "png"]
    }],
    decisions: [
      ...covered.map(section_id => ({
        section_id,
        decision: "render",
        diagram_id: "D001",
        reason: "실행 위치와 데이터 흐름은 산문보다 architecture diagram이 더 빠르고 정확하다.",
      })),
      ...incompatibleIds.map(section_id => ({
        section_id,
        decision: "omit",
        diagram_id: null,
        reason: "WebKit architecture와 다른 관계이므로 section 유형에 맞는 별도 diagram이 필요하다.",
      })),
    ],
  };
}

function positions(nodes) {
  const before = nodes.filter(node => node.id.endsWith("before") || node.id === "server-parser");
  const after = nodes.filter(node => !before.includes(node));
  const map = new Map();
  for (const [laneIndex, lane] of [before, after].entries()) {
    const step = 780 / Math.max(lane.length, 1);
    lane.forEach((node, index) => map.set(node.id, { x: 90 + step * index + step / 2, y: laneIndex === 0 ? 220 : 420 }));
  }
  return map;
}

export function renderSvg(diagram) {
  const width = 960;
  const height = 600;
  const nodeWidth = 170;
  const nodeHeight = 68;
  const pos = positions(diagram.nodes);
  const edges = diagram.edges.map((edge, index) => {
    const from = pos.get(edge.from);
    const to = pos.get(edge.to);
    const x1 = from.x + nodeWidth / 2;
    const x2 = to.x - nodeWidth / 2;
    const mid = (x1 + x2) / 2;
    return `<g data-edge-id="E${String(index + 1).padStart(3, "0")}" data-from="${escapeXml(edge.from)}" data-to="${escapeXml(edge.to)}" data-evidence-ids="${escapeXml(edge.evidence_ids.join(","))}"><path d="M ${x1} ${from.y} L ${x2} ${to.y}" class="edge" marker-end="url(#arrow)"/><rect x="${mid - 66}" y="${(from.y + to.y) / 2 - 16}" width="132" height="20" class="label-mask"/><text x="${mid}" y="${(from.y + to.y) / 2 - 2}" class="edge-label">${escapeXml(edge.label)}</text></g>`;
  }).join("\n");
  const nodes = diagram.nodes.map(node => {
    const p = pos.get(node.id);
    const focal = node.id === "webkit" ? " node-focal" : "";
    return `<g data-node-id="${escapeXml(node.id)}" data-evidence-ids="${escapeXml(node.evidence_ids.join(","))}"><rect x="${p.x - nodeWidth / 2}" y="${p.y - nodeHeight / 2}" width="${nodeWidth}" height="${nodeHeight}" rx="8" class="node${focal}"/><text x="${p.x}" y="${p.y + 5}" class="node-label">${escapeXml(node.label)}</text></g>`;
  }).join("\n");
  const titleId = `${diagram.diagram_id.toLowerCase()}-title`;
  const descId = `${diagram.diagram_id.toLowerCase()}-desc`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${titleId} ${descId}">
<title id="${titleId}">${escapeXml(diagram.purpose)}</title>
<desc id="${descId}">Evidence-backed architecture comparison of server parsing and iOS WebKit on-device processing.</desc>
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#363636"/></marker></defs>
<style>.paper{fill:#fff}.lane{fill:#f8f8f8;stroke:#dfdfdf}.lane-title{font:700 16px ui-sans-serif,system-ui;fill:#121212}.node{fill:#fff;stroke:#121212;stroke-width:1.5}.node-focal{fill:#e4f7a1}.node-label{font:600 14px ui-sans-serif,system-ui;fill:#121212;text-anchor:middle}.edge{fill:none;stroke:#363636;stroke-width:1.5}.edge-label{font:500 10px ui-monospace,monospace;fill:#363636;text-anchor:middle}.label-mask{fill:#fff}</style>
<rect width="960" height="600" class="paper"/><rect x="40" y="110" width="880" height="210" rx="8" class="lane"/><rect x="40" y="340" width="880" height="210" rx="8" class="lane"/><text x="64" y="145" class="lane-title">BEFORE · server parsing</text><text x="64" y="375" class="lane-title">AFTER · on-device WebKit</text>
${edges}
${nodes}
</svg>`;
}

const FONT = {
  "A":["01110","10001","10001","11111","10001","10001","10001"],"B":["11110","10001","10001","11110","10001","10001","11110"],"C":["01111","10000","10000","10000","10000","10000","01111"],"D":["11110","10001","10001","10001","10001","10001","11110"],"E":["11111","10000","10000","11110","10000","10000","11111"],"F":["11111","10000","10000","11110","10000","10000","10000"],"G":["01111","10000","10000","10111","10001","10001","01111"],"H":["10001","10001","10001","11111","10001","10001","10001"],"I":["11111","00100","00100","00100","00100","00100","11111"],"J":["00111","00010","00010","00010","10010","10010","01100"],"K":["10001","10010","10100","11000","10100","10010","10001"],"L":["10000","10000","10000","10000","10000","10000","11111"],"M":["10001","11011","10101","10101","10001","10001","10001"],"N":["10001","11001","10101","10011","10001","10001","10001"],"O":["01110","10001","10001","10001","10001","10001","01110"],"P":["11110","10001","10001","11110","10000","10000","10000"],"Q":["01110","10001","10001","10001","10101","10010","01101"],"R":["11110","10001","10001","11110","10100","10010","10001"],"S":["01111","10000","10000","01110","00001","00001","11110"],"T":["11111","00100","00100","00100","00100","00100","00100"],"U":["10001","10001","10001","10001","10001","10001","01110"],"V":["10001","10001","10001","10001","10001","01010","00100"],"W":["10001","10001","10001","10101","10101","10101","01010"],"X":["10001","10001","01010","00100","01010","10001","10001"],"Y":["10001","10001","01010","00100","00100","00100","00100"],"Z":["11111","00001","00010","00100","01000","10000","11111"],"0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],"2":["01110","10001","00001","00010","00100","01000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","10000","11110","00001","00001","11110"],"6":["01110","10000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00001","01110"],"-":["00000","00000","00000","11111","00000","00000","00000"]
};

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  return Buffer.concat([length, name, data, crc]);
}
function setPixel(buffer, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const i = (y * width + x) * 4; buffer[i]=color[0]; buffer[i+1]=color[1]; buffer[i+2]=color[2]; buffer[i+3]=255;
}
function rect(buffer,width,height,x,y,w,h,fill,stroke=[18,18,18]) {
  for(let yy=y;yy<y+h;yy++) for(let xx=x;xx<x+w;xx++) setPixel(buffer,width,height,xx,yy,fill);
  for(let xx=x;xx<x+w;xx++){setPixel(buffer,width,height,xx,y,stroke);setPixel(buffer,width,height,xx,y+h-1,stroke);} for(let yy=y;yy<y+h;yy++){setPixel(buffer,width,height,x,yy,stroke);setPixel(buffer,width,height,x+w-1,yy,stroke);}
}
function line(buffer,width,height,x0,y0,x1,y1,color=[54,54,54]) {
  let dx=Math.abs(x1-x0), sx=x0<x1?1:-1, dy=-Math.abs(y1-y0), sy=y0<y1?1:-1, err=dx+dy;
  for(;;){setPixel(buffer,width,height,x0,y0,color);if(x0===x1&&y0===y1)break;const e2=2*err;if(e2>=dy){err+=dy;x0+=sx;}if(e2<=dx){err+=dx;y0+=sy;}}
}
function text(buffer,width,height,value,x,y,scale=2,color=[18,18,18]) {
  let cursor=x; for(const char of String(value).toUpperCase()){if(char===" "){cursor+=4*scale;continue;}const glyph=FONT[char]??["11111","10001","00110","00100","00110","10001","11111"];for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(glyph[row][col]==="1")for(let sy=0;sy<scale;sy++)for(let sx=0;sx<scale;sx++)setPixel(buffer,width,height,cursor+col*scale+sx,y+row*scale+sy,color);cursor+=6*scale;}
}
function renderPng(diagram) {
  const width=960,height=600, rgba=Buffer.alloc(width*height*4,255), pos=positions(diagram.nodes), nw=170,nh=68;
  rect(rgba,width,height,40,110,880,210,[248,248,248],[223,223,223]);rect(rgba,width,height,40,340,880,210,[248,248,248],[223,223,223]);text(rgba,width,height,"BEFORE - SERVER PARSING",64,132,2);text(rgba,width,height,"AFTER - ON-DEVICE WEBKIT",64,362,2);
  for(const edge of diagram.edges){const a=pos.get(edge.from),b=pos.get(edge.to);line(rgba,width,height,Math.round(a.x+nw/2),Math.round(a.y),Math.round(b.x-nw/2),Math.round(b.y));}
  for(const node of diagram.nodes){const p=pos.get(node.id);rect(rgba,width,height,Math.round(p.x-nw/2),Math.round(p.y-nh/2),nw,nh,node.id==="webkit"?[228,247,161]:[255,255,255]);const tw=String(node.label).length*12;text(rgba,width,height,node.label,Math.round(p.x-tw/2),Math.round(p.y-7),2);}
  const raw=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++){raw[y*(width*4+1)]=0;rgba.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}

export function renderDiagram(diagram, outputDir) {
  const svg = renderSvg(diagram);
  const provenance = JSON.stringify({ diagram_id: diagram.diagram_id, nodes: diagram.nodes, edges: diagram.edges });
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeXml(diagram.purpose)}</title><style>body{margin:0;background:#fff;color:#121212;font-family:"Hanken Grotesk","Pretendard Variable",Pretendard,ui-sans-serif,system-ui,sans-serif}figure{margin:0;padding:24px}figcaption{margin-top:12px;color:#363636}</style></head><body><figure>${svg}<figcaption>${escapeXml(diagram.purpose)}</figcaption></figure><script id="diagram-provenance" type="application/json">${provenance.replaceAll("<","\\u003c")}</script></body></html>`;
  const base = join(outputDir, diagram.diagram_id.toLowerCase());
  writeFileSync(`${base}.html`, html, "utf8");
  writeFileSync(`${base}.svg`, svg, "utf8");
  writeFileSync(`${base}.png`, renderPng(diagram));
  return { html: `${base}.html`, svg: `${base}.svg`, png: `${base}.png`, ledger: JSON.parse(provenance) };
}

export function auditVisual(diagram, pack, renderedSvg = "") {
  const evidence = new Set(pack.evidence.map(item => item.id));
  const nodeIds = new Set(diagram.nodes.map(node => node.id));
  const unsupported_nodes = diagram.nodes.filter(node => !node.evidence_ids?.length || node.evidence_ids.some(id => !evidence.has(id))).map(node => node.id);
  const unsupported_edges = diagram.edges.filter(edge => !edge.evidence_ids?.length || edge.evidence_ids.some(id => !evidence.has(id)) || !nodeIds.has(edge.from) || !nodeIds.has(edge.to)).map(edge => `${edge.from}->${edge.to}`);
  const incorrect_labels = renderedSvg ? diagram.nodes.filter(node => !renderedSvg.includes(escapeXml(node.label))).map(node => node.id) : [];
  const missing_provenance = [
    ...diagram.nodes.filter(node => !renderedSvg.includes(`data-node-id="${node.id}"`)).map(node => node.id),
    ...diagram.edges.filter(edge => !renderedSvg.includes(`data-from="${edge.from}" data-to="${edge.to}"`)).map(edge => `${edge.from}->${edge.to}`),
  ];
  return { unsupported_nodes, unsupported_edges, incorrect_labels, missing_provenance };
}
