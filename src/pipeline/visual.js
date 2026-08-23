import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { auditDiagramType, renderTypedSvg, rendererForType, selectDiagramType } from "./visual-contract.js";

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

export function buildVisualPlan(pack, outline = { sections: [] }, { specs = [] } = {}) {
  const candidates = outline.sections.filter(section => section.visual_candidate === true);
  const candidateIds = new Set(candidates.map(section => section.section_id));
  const evidence = new Map(pack.evidence.map(item => [item.id, item]));
  const visuals = [];
  const decisions = [];
  const covered = new Set();
  for (const [index, spec] of specs.entries()) {
    const covers = [...new Set(spec.covers_section_ids ?? [spec.section_id])];
    const invalid = covers.filter(sectionId => !candidateIds.has(sectionId));
    if (invalid.length > 0) throw new Error(`visual spec covers non-candidate sections: ${invalid.join(", ")}`);
    const sections = candidates.filter(section => covers.includes(section.section_id));
    const evidenceIds = [...new Set([
      ...(spec.evidence_ids ?? []),
      ...(spec.nodes ?? []).flatMap(node => node.evidence_ids ?? []),
      ...(spec.edges ?? []).flatMap(edge => edge.evidence_ids ?? []),
    ])];
    const missingEvidence = evidenceIds.filter(id => !evidence.has(id));
    if (missingEvidence.length > 0) throw new Error(`visual spec references unknown Evidence: ${missingEvidence.join(", ")}`);
    const selection = selectDiagramType({ purpose: spec.purpose, sections, evidence: evidenceIds.map(id => evidence.get(id)) });
    const renderer = rendererForType(selection.type);
    if (!renderer) {
      for (const sectionId of covers) {
        covered.add(sectionId);
        decisions.push({
          section_id: sectionId,
          decision: "omit",
          diagram_id: null,
          reason: `최적 유형 ${selection.type}을 선택했지만 등록된 renderer가 없다. 차선 유형으로 바꾸지 말고 renderer를 준비해야 한다.`,
        });
      }
      continue;
    }
    const diagramId = spec.diagram_id ?? `D${String(index + 1).padStart(3, "0")}`;
    const diagram = {
      diagram_id: diagramId,
      section_id: covers[0],
      covers_section_ids: covers,
      purpose: spec.purpose,
      type: selection.type,
      selection: { ...selection, semantic_pattern: spec.semantic_pattern ?? null },
      renderer,
      evidence_ids: evidenceIds,
      nodes: spec.nodes ?? [],
      edges: spec.edges ?? [],
      excluded: spec.excluded ?? [],
      formats: spec.formats ?? ["html", "svg", "png"],
    };
    visuals.push(diagram);
    for (const sectionId of covers) {
      covered.add(sectionId);
      decisions.push({
        section_id: sectionId,
        decision: "render",
        diagram_id: diagramId,
        reason: `${selection.rationale} 이 section의 주된 관계를 가장 직접적으로 설명한다.`,
      });
    }
  }
  for (const { section_id } of candidates) {
    if (covered.has(section_id)) continue;
    decisions.push({
      section_id,
      decision: "omit",
      diagram_id: null,
      reason: "candidate를 설명할 semantic visual spec이 없다. 임의 generic diagram을 만들지 말고 node role·edge kind와 Evidence를 먼저 확정해야 한다.",
    });
  }
  decisions.sort((left, right) => left.section_id.localeCompare(right.section_id));
  return { visuals, decisions };
}

export function renderSvg(diagram) {
  return renderTypedSvg(diagram);
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
  const width=960,height=560,rgba=Buffer.alloc(width*height*4,255),boxes=new Map();
  const visible=diagram.nodes.filter(node=>node.role!=="boundary"&&node.role!=="zone");
  const horizontal=(nodes,y=250,w=136)=>{const gap=nodes.length<=4?64:32,total=nodes.length*w+Math.max(0,nodes.length-1)*gap,start=(width-total)/2;nodes.forEach((node,index)=>boxes.set(node.id,{x:Math.round(start+index*(w+gap)),y,w,h:72}));};
  if(diagram.type==="flowchart"){
    const start=diagram.nodes.find(node=>node.role==="source"||node.role==="stage")??diagram.nodes[0],decision=diagram.nodes.find(node=>node.role==="decision"),outcomes=diagram.nodes.filter(node=>node.role==="outcome"||node.role==="sink");
    if(start)boxes.set(start.id,{x:408,y:96,w:144,h:64});if(decision)boxes.set(decision.id,{x:390,y:208,w:180,h:80});const total=outcomes.length*144+Math.max(0,outcomes.length-1)*48;outcomes.forEach((node,index)=>boxes.set(node.id,{x:(width-total)/2+index*192,y:408,w:144,h:64}));
  }else if(diagram.type==="deployment"){
    const zones=diagram.nodes.filter(node=>node.role==="zone"),zoneW=zones.length>1?400:840,start=(width-(zones.length*zoneW+Math.max(0,zones.length-1)*40))/2;
    zones.forEach((zone,index)=>{const box={x:start+index*(zoneW+40),y:116,w:zoneW,h:344};boxes.set(zone.id,box);rect(rgba,width,height,box.x,box.y,box.w,box.h,[248,248,248],[199,199,199]);text(rgba,width,height,zone.label,box.x+16,box.y+18,1);const children=diagram.nodes.filter(node=>node.container_id===zone.id);children.forEach((node,at)=>boxes.set(node.id,{x:box.x+32,y:box.y+60+at*96,w:box.w-64,h:64}));});
  }else horizontal(visible,diagram.type==="state-machine"?244:252,diagram.type==="state-machine"?152:136);
  if(diagram.type==="architecture"&&diagram.nodes.some(node=>node.role==="boundary")){for(let y=132;y<=412;y+=8)line(rgba,width,height,480,y,480,Math.min(y+4,412));}
  for(const edge of diagram.edges){const a=boxes.get(edge.from),b=boxes.get(edge.to);if(!a||!b)continue;const x1=a.x+a.w,y1=a.y+a.h/2,x2=b.x,y2=b.y+b.h/2,mid=Math.round((x1+x2)/2);line(rgba,width,height,Math.round(x1),Math.round(y1),mid,Math.round(y1));line(rgba,width,height,mid,Math.round(y1),mid,Math.round(y2));line(rgba,width,height,mid,Math.round(y2),Math.round(x2),Math.round(y2));}
  for(const node of visible){const box=boxes.get(node.id);if(!box)continue;const focal=["transform","decision","runtime"].includes(node.role)?[228,247,161]:[255,255,255];if(diagram.type==="flowchart"&&node.role==="decision"){const cx=box.x+box.w/2,cy=box.y+box.h/2;line(rgba,width,height,cx,box.y,box.x+box.w,cy);line(rgba,width,height,box.x+box.w,cy,cx,box.y+box.h);line(rgba,width,height,cx,box.y+box.h,box.x,cy);line(rgba,width,height,box.x,cy,cx,box.y);}else if(diagram.type==="state-machine"){const radius=Math.round(box.h/2);for(let yy=-radius;yy<=radius;yy++)for(let xx=-Math.round(box.w/2);xx<=Math.round(box.w/2);xx++){const dx=Math.max(Math.abs(xx)-box.w/2+radius,0),dy=Math.max(Math.abs(yy)-radius,0);if(dx*dx+dy*dy<=radius*radius)setPixel(rgba,width,height,Math.round(box.x+box.w/2+xx),Math.round(box.y+box.h/2+yy),focal);} }else rect(rgba,width,height,Math.round(box.x),Math.round(box.y),Math.round(box.w),Math.round(box.h),focal);const tw=Math.min(box.w-16,String(node.label).length*12);text(rgba,width,height,node.label,Math.round(box.x+(box.w-tw)/2),Math.round(box.y+box.h/2-7),2);}
  const raw=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++){raw[y*(width*4+1)]=0;rgba.copy(raw,y*(width*4+1)+1,y*width*4,(y+1)*width*4);}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}

export function renderDiagram(diagram, outputDir) {
  const svg = renderSvg(diagram);
  const provenance = JSON.stringify({ diagram_id: diagram.diagram_id, type: diagram.type, selection: diagram.selection, renderer: diagram.renderer, nodes: diagram.nodes, edges: diagram.edges });
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeXml(diagram.purpose)}</title><style>body{margin:0;background:#fff;color:#121212;font-family:"Hanken Grotesk","Pretendard Variable",Pretendard,ui-sans-serif,system-ui,sans-serif}figure{margin:0;padding:24px}figcaption{margin-top:12px;color:#363636}</style></head><body><figure>${svg}<figcaption>${escapeXml(diagram.purpose)}</figcaption></figure><template id="diagram-provenance" data-diagram-provenance>${provenance.replaceAll("<","\\u003c")}</template></body></html>`;
  const base = join(outputDir, diagram.diagram_id.toLowerCase());
  writeFileSync(`${base}.html`, html, "utf8");
  writeFileSync(`${base}.svg`, svg, "utf8");
  writeFileSync(`${base}.png`, renderPng(diagram));
  return { html: `${base}.html`, svg: `${base}.svg`, png: `${base}.png`, ledger: JSON.parse(provenance) };
}

export function auditVisual(diagram, pack, renderedSvg = "", { outline } = {}) {
  const evidence = new Set(pack.evidence.map(item => item.id));
  const nodeIds = new Set(diagram.nodes.map(node => node.id));
  const unsupported_nodes = diagram.nodes.filter(node => !node.evidence_ids?.length || node.evidence_ids.some(id => !evidence.has(id))).map(node => node.id);
  const unsupported_edges = diagram.edges.filter(edge => !edge.evidence_ids?.length || edge.evidence_ids.some(id => !evidence.has(id)) || !nodeIds.has(edge.from) || !nodeIds.has(edge.to)).map(edge => `${edge.from}->${edge.to}`);
  const incorrect_labels = renderedSvg ? diagram.nodes.filter(node => !renderedSvg.includes(escapeXml(node.label))).map(node => node.id) : [];
  const missing_provenance = [
    ...diagram.nodes.filter(node => !renderedSvg.includes(`data-node-id="${node.id}"`)).map(node => node.id),
    ...diagram.edges.filter(edge => !renderedSvg.includes(`data-from="${edge.from}" data-to="${edge.to}"`)).map(edge => `${edge.from}->${edge.to}`),
  ];
  const typeContract = auditDiagramType(diagram, renderedSvg, { outline, evidencePack: pack });
  return { unsupported_nodes, unsupported_edges, incorrect_labels, missing_provenance, ...typeContract };
}
