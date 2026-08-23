const TYPE_RULES = [
  {
    type: "state-machine",
    primary_axis: "states",
    patterns: [
      [/state\s*(machine|transition)|상태\s*(머신|전이)/i, 12, "상태 전이"],
      [/notdetermined|provisional|\blive\b|\bdead\b|granted|blocked/i, 10, "명시적 상태 값"],
      [/lifecycle|생명주기|상태|status/i, 3, "상태 수명"],
    ],
  },
  {
    type: "deployment",
    primary_axis: "deployment",
    patterns: [
      [/deployment|배포(?:되는|된|할)?\s*(위치|구조|경로)/i, 12, "배포 위치"],
      [/pod|namespace|container|cluster|host|\bruntime\b|실행\s*(환경|위치)/i, 8, "실행 환경"],
      [/DMG|ZIP|bundle|artifact|공증|설치\s*(위치|경로)/i, 6, "배포 산출물"],
    ],
  },
  {
    type: "flowchart",
    primary_axis: "decisions",
    patterns: [
      [/flowchart|의사결정\s*흐름/i, 12, "의사결정 흐름"],
      [/분기|조건|if\b|else\b|판정/i, 7, "조건 분기"],
      [/분류.*(유지|보류|재확인)|(유지|보류|재확인).*분류/i, 10, "처분 분류"],
    ],
  },
  {
    type: "sequence",
    primary_axis: "messages",
    patterns: [
      [/sequence|시퀀스/i, 12, "메시지 시퀀스"],
      [/요청.*응답|response.*request|actor.*message|메시지.*순서/i, 8, "시간순 메시지"],
    ],
  },
  {
    type: "timeline",
    primary_axis: "events",
    patterns: [
      [/timeline|타임라인|연대기/i, 12, "시간축"],
      [/날짜.*사건|사건.*날짜|시간순\s*사건/i, 8, "날짜별 사건"],
    ],
  },
  {
    type: "data-flow",
    primary_axis: "data-movement",
    patterns: [
      [/data\s*flow|데이터\s*(이동|흐름)/i, 12, "데이터 이동"],
      [/source.*(transform|store|sink)|입력.*(변환|저장|출력)/i, 9, "입력-변환-출력"],
      [/staging.*attachment|attachment.*(목록|상세)|read.*write|sync|동기화\s*흐름/i, 7, "저장·동기화 흐름"],
      [/research\s*pack.*evidence|source\s*expansion|claim\s*mapping/i, 7, "source에서 artifact로 변환"],
    ],
  },
  {
    type: "process",
    primary_axis: "stages",
    patterns: [
      [/process|프로세스|절차|workflow|work\s*flow/i, 10, "순차 절차"],
      [/단계|handoff|재제출|감사\s*(절차|흐름)|검증\s*단계/i, 7, "단계별 작업"],
      [/pipeline|파이프라인|gate|게이트/i, 4, "단계형 파이프라인"],
    ],
  },
  {
    type: "architecture",
    primary_axis: "components",
    patterns: [
      [/architecture|아키텍처|topology|토폴로지/i, 12, "컴포넌트 구조"],
      [/trust\s*boundary|신뢰\s*경계|위협\s*모델|SSRF/i, 10, "신뢰 경계"],
      [/component|service|컴포넌트|서비스|의존성|connection/i, 5, "컴포넌트 연결"],
    ],
  },
  {
    type: "dependency",
    primary_axis: "dependencies",
    patterns: [[/dependency|depends\s+on|의존성|의존\s*관계/i, 12, "의존 관계"]],
  },
  {
    type: "layer-stack",
    primary_axis: "layers",
    patterns: [[/layer\s*stack|계층|레이어|추상화\s*층/i, 12, "추상화 계층"]],
  },
  {
    type: "swimlane",
    primary_axis: "ownership",
    patterns: [[/swimlane|스윔레인|역할별|owner.*handoff|역할.*인계/i, 12, "역할별 인계"]],
  },
  {
    type: "fishbone",
    primary_axis: "causes",
    patterns: [[/fishbone|피시본|원인\s*분석|root\s*cause/i, 12, "원인 분석"]],
  },
  {
    type: "er",
    primary_axis: "entities",
    patterns: [[/entity\s*relationship|ER\s*diagram|엔티티|데이터\s*모델|schema\s*relation/i, 12, "데이터 모델"]],
  },
];

export const DIAGRAM_TYPES = TYPE_RULES.map(rule => rule.type);
export const RENDERED_TYPES = new Set(["architecture", "data-flow", "deployment", "flowchart", "process", "state-machine"]);

const AXIS_BY_TYPE = Object.fromEntries(TYPE_RULES.map(rule => [rule.type, rule.primary_axis]));

export function rendererForType(type) {
  if (!RENDERED_TYPES.has(type)) return null;
  return { id: `justsend-${type}-v1`, version: "1" };
}

function contextText({ purpose = "", sections = [], evidence = [] } = {}) {
  return [purpose, ...sections.flatMap(section => [section.title, section.purpose]), ...evidence.map(item => item.statement)]
    .filter(Boolean)
    .join(" \n ");
}

export function selectDiagramType(context = {}) {
  const text = contextText(context);
  const scored = TYPE_RULES.map(rule => {
    let score = 0;
    const signals = [];
    for (const [pattern, weight, label] of rule.patterns) {
      if (!pattern.test(text)) continue;
      score += weight;
      signals.push(label);
    }
    return { type: rule.type, primary_axis: rule.primary_axis, score, signals };
  }).sort((left, right) => right.score - left.score || TYPE_RULES.findIndex(rule => rule.type === left.type) - TYPE_RULES.findIndex(rule => rule.type === right.type));
  const selected = scored[0].score > 0 ? scored[0] : { type: "architecture", primary_axis: "components", score: 0, signals: ["명시 신호 없음"] };
  const considered = scored.slice(0, 3).map(candidate => ({
    type: candidate.type,
    score: candidate.score,
    rejected_because: candidate.type === selected.type
      ? null
      : `${selected.primary_axis} 축이 ${candidate.primary_axis} 축보다 독자의 핵심 질문을 직접 설명한다.`,
  }));
  return {
    type: selected.type,
    primary_axis: selected.primary_axis,
    rationale: `${selected.signals.join(", ")} 신호를 기준으로 ${selected.primary_axis} 축을 주된 읽기 경로로 선택했다.`,
    signals: selected.signals,
    considered,
    confidence: selected.score >= 10 ? "high" : selected.score >= 5 ? "medium" : "low",
  };
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

function rootAttributes(diagram) {
  return `data-diagram-type="${escapeXml(diagram.type)}" data-primary-axis="${escapeXml(diagram.selection.primary_axis)}" data-renderer-id="${escapeXml(diagram.renderer.id)}" data-renderer-version="${escapeXml(diagram.renderer.version)}"`;
}

function baseStyle() {
  return `<style>.paper{fill:#fff}.zone{fill:#f8f8f8;stroke:#c7c7c7;stroke-width:1}.zone-label{font:700 12px ui-sans-serif,system-ui;fill:#363636}.node{fill:#fff;stroke:#121212;stroke-width:1.2}.focal{fill:#e4f7a1}.node-label{font:600 12px ui-sans-serif,system-ui;fill:#121212;text-anchor:middle}.node-sub{font:500 8px ui-monospace,monospace;fill:#727272;text-anchor:middle}.edge{fill:none;stroke:#363636;stroke-width:1.2}.edge-label{font:500 8px ui-monospace,monospace;fill:#363636;text-anchor:middle}.label-mask{fill:#fff}.boundary{stroke:#121212;stroke-width:1.2;stroke-dasharray:6 4}.stage-number{font:700 10px ui-monospace,monospace;fill:#121212;text-anchor:middle}.title{font:700 20px ui-sans-serif,system-ui;fill:#121212}</style>`;
}

function svgShell(diagram, content, description) {
  const titleId = `${diagram.diagram_id.toLowerCase()}-title`;
  const descId = `${diagram.diagram_id.toLowerCase()}-desc`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 560" role="img" aria-labelledby="${titleId} ${descId}" ${rootAttributes(diagram)}>
<title id="${titleId}">${escapeXml(diagram.purpose)}</title><desc id="${descId}">${escapeXml(description)}</desc>
<defs><marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#363636"/></marker></defs>${baseStyle()}<rect width="960" height="560" class="paper"/><text x="48" y="48" class="title">${escapeXml(diagram.purpose)}</text>${content}</svg>`;
}

function horizontalLayout(nodes, { y = 280, width = 144 } = {}) {
  const gap = nodes.length <= 4 ? 64 : 32;
  const total = nodes.length * width + Math.max(0, nodes.length - 1) * gap;
  const start = Math.max(32, (960 - total) / 2);
  return new Map(nodes.map((node, index) => [node.id, { x: start + index * (width + gap), y, width, height: 72 }]));
}

function edgePath(from, to) {
  const x1 = from.x + from.width;
  const y1 = from.y + from.height / 2;
  const x2 = to.x;
  const y2 = to.y + to.height / 2;
  if (Math.abs(y1 - y2) < 1) return { d: `M ${x1} ${y1} H ${x2}`, labelX: (x1 + x2) / 2, labelY: y1 - 16 };
  const mid = Math.round((x1 + x2) / 8) * 4;
  return { d: `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`, labelX: (x1 + mid) / 2, labelY: y1 - 16 };
}

function edgeElement(edge, index, positions) {
  const from = positions.get(edge.from);
  const to = positions.get(edge.to);
  if (!from || !to) return "";
  const route = edgePath(from, to);
  const width = Math.max(64, Math.min(160, edge.label.length * 11 + 24));
  return `<g data-edge-id="E${String(index + 1).padStart(3, "0")}" data-from="${escapeXml(edge.from)}" data-to="${escapeXml(edge.to)}" data-edge-kind="${escapeXml(edge.kind)}" data-evidence-ids="${escapeXml(edge.evidence_ids.join(","))}"><path d="${route.d}" class="edge" marker-end="url(#arrow)"/><rect x="${route.labelX - width / 2}" y="${route.labelY - 12}" width="${width}" height="14" rx="3" class="label-mask"/><text x="${route.labelX}" y="${route.labelY - 2}" class="edge-label">${escapeXml(edge.label)}</text></g>`;
}

function nodeGroup(node, box, shape, body, focal = false) {
  return `<g data-node-id="${escapeXml(node.id)}" data-node-role="${escapeXml(node.role)}" data-shape="${shape}" data-evidence-ids="${escapeXml(node.evidence_ids.join(","))}"${node.container_id ? ` data-container-id="${escapeXml(node.container_id)}"` : ""}>${body}<text x="${box.x + box.width / 2}" y="${box.y + box.height / 2 + 4}" class="node-label">${escapeXml(node.label)}</text>${focal ? "" : ""}</g>`;
}

function renderDataFlow(diagram) {
  const positions = horizontalLayout(diagram.nodes, { y: 252, width: 136 });
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const nodes = diagram.nodes.map((node, index) => {
    const box = positions.get(node.id);
    if (["source", "sink"].includes(node.role)) {
      return nodeGroup(node, box, node.role, `<ellipse cx="${box.x + box.width / 2}" cy="${box.y + box.height / 2}" rx="${box.width / 2}" ry="${box.height / 2}" class="node${index === 1 ? " focal" : ""}"/>`);
    }
    if (node.role === "store") {
      return nodeGroup(node, box, "store", `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="18" class="node${index === 1 ? " focal" : ""}"/><path d="M ${box.x} ${box.y + 16} Q ${box.x + box.width / 2} ${box.y + 30} ${box.x + box.width} ${box.y + 16}" class="edge"/>`);
    }
    return nodeGroup(node, box, "transform", `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="8" class="node${index === 1 ? " focal" : ""}"/>`);
  }).join("");
  return svgShell(diagram, edges + nodes, "Source data moves through transformations and stores to a final sink.");
}

function renderProcess(diagram) {
  const positions = horizontalLayout(diagram.nodes, { y: 236, width: 144 });
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const nodes = diagram.nodes.map((node, index) => {
    const box = positions.get(node.id);
    const body = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="8" class="node${index === diagram.nodes.length - 1 ? " focal" : ""}"/><circle cx="${box.x + 18}" cy="${box.y + 18}" r="12" fill="#fff" stroke="#121212"/><text x="${box.x + 18}" y="${box.y + 22}" class="stage-number">${index + 1}</text>`;
    return nodeGroup(node, box, "stage", body);
  }).join("");
  return svgShell(diagram, edges + nodes, "Ordered stages show how work advances from entry to completion.");
}

function renderStateMachine(diagram) {
  const positions = horizontalLayout(diagram.nodes, { y: 244, width: 152 });
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const nodes = diagram.nodes.map((node, index) => {
    const box = positions.get(node.id);
    const body = `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="36" class="node${index === 1 ? " focal" : ""}"/>`;
    return nodeGroup(node, box, "state", body);
  }).join("");
  const first = positions.get(diagram.nodes[0]?.id);
  const initial = first ? `<circle cx="${first.x - 32}" cy="${first.y + 36}" r="7" fill="#121212"/><path d="M ${first.x - 24} ${first.y + 36} H ${first.x}" class="edge" marker-end="url(#arrow)"/>` : "";
  return svgShell(diagram, initial + edges + nodes, "States and guarded transitions describe the lifecycle of the subject.");
}

function renderFlowchart(diagram) {
  const decisions = diagram.nodes.filter(node => node.role === "decision");
  const start = diagram.nodes.find(node => node.role === "source" || node.role === "stage") ?? diagram.nodes[0];
  const outcomes = diagram.nodes.filter(node => node.role === "outcome" || node.role === "sink");
  const positions = new Map();
  if (start) positions.set(start.id, { x: 408, y: 96, width: 144, height: 64 });
  decisions.forEach((node, index) => positions.set(node.id, { x: 390, y: 208 + index * 116, width: 180, height: 80 }));
  const outcomeY = 408;
  const outcomeWidth = 144;
  const gap = 48;
  const total = outcomes.length * outcomeWidth + Math.max(0, outcomes.length - 1) * gap;
  outcomes.forEach((node, index) => positions.set(node.id, { x: (960 - total) / 2 + index * (outcomeWidth + gap), y: outcomeY, width: outcomeWidth, height: 64 }));
  for (const node of diagram.nodes) if (!positions.has(node.id)) positions.set(node.id, { x: 408, y: 96, width: 144, height: 64 });
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const nodes = diagram.nodes.map(node => {
    const box = positions.get(node.id);
    if (node.role === "decision") {
      const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
      return nodeGroup(node, box, "decision", `<polygon points="${cx},${box.y} ${box.x + box.width},${cy} ${cx},${box.y + box.height} ${box.x},${cy}" class="node focal"/>`);
    }
    return nodeGroup(node, box, node.role === "outcome" ? "outcome" : "start", `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="32" class="node"/>`);
  }).join("");
  return svgShell(diagram, edges + nodes, "A decision branches the input into explicit outcomes.");
}

function renderDeployment(diagram) {
  const zones = diagram.nodes.filter(node => node.role === "zone");
  const children = diagram.nodes.filter(node => node.role !== "zone");
  const zoneWidth = zones.length > 1 ? 400 : 840;
  const zoneGap = 40;
  const zoneStart = (960 - (zones.length * zoneWidth + Math.max(0, zones.length - 1) * zoneGap)) / 2;
  const positions = new Map();
  const zoneMarkup = zones.map((zone, index) => {
    const box = { x: zoneStart + index * (zoneWidth + zoneGap), y: 116, width: zoneWidth, height: 344 };
    positions.set(zone.id, box);
    return `<g data-node-id="${escapeXml(zone.id)}" data-node-role="zone" data-shape="zone" data-evidence-ids="${escapeXml(zone.evidence_ids.join(","))}"><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="10" class="zone"/><text x="${box.x + 16}" y="${box.y + 26}" class="zone-label">${escapeXml(zone.label)}</text></g>`;
  }).join("");
  const zoneChildren = new Map(zones.map(zone => [zone.id, children.filter(node => node.container_id === zone.id)]));
  for (const zone of zones) {
    const box = positions.get(zone.id); const items = zoneChildren.get(zone.id);
    items.forEach((node, index) => positions.set(node.id, { x: box.x + 32, y: box.y + 60 + index * 96, width: box.width - 64, height: 64 }));
  }
  children.filter(node => !positions.has(node.id)).forEach((node, index) => positions.set(node.id, { x: 72 + index * 176, y: 468, width: 144, height: 56 }));
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const childMarkup = children.map((node, index) => {
    const box = positions.get(node.id);
    return nodeGroup(node, box, node.role, `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="8" class="node${index === children.length - 1 ? " focal" : ""}"/>`);
  }).join("");
  return svgShell(diagram, edges + zoneMarkup + childMarkup, "Deployment zones contain signed artifacts and the runtimes that execute them.");
}

function renderArchitecture(diagram) {
  const boundary = diagram.nodes.find(node => node.role === "boundary");
  const components = diagram.nodes.filter(node => node.role !== "boundary");
  const positions = horizontalLayout(components, { y: 248, width: 144 });
  if (boundary) positions.set(boundary.id, { x: 472, y: 132, width: 16, height: 280 });
  const edges = diagram.edges.map((edge, index) => edgeElement(edge, index, positions)).join("");
  const nodes = components.map((node, index) => {
    const box = positions.get(node.id);
    return nodeGroup(node, box, node.role, `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="8" class="node${index === 1 ? " focal" : ""}"/>`);
  }).join("");
  const boundaryMarkup = boundary ? `<g data-node-id="${escapeXml(boundary.id)}" data-node-role="boundary" data-shape="boundary" data-evidence-ids="${escapeXml(boundary.evidence_ids.join(","))}"><line x1="480" y1="132" x2="480" y2="412" class="boundary"/><text x="496" y="152" class="node-sub">${escapeXml(boundary.label)}</text></g>` : "";
  return svgShell(diagram, edges + boundaryMarkup + nodes, "Components connect across an explicit trust or system boundary.");
}

const RENDERERS = {
  "architecture": renderArchitecture,
  "data-flow": renderDataFlow,
  "deployment": renderDeployment,
  "flowchart": renderFlowchart,
  "process": renderProcess,
  "state-machine": renderStateMachine,
};

export function renderTypedSvg(diagram) {
  const renderer = rendererForType(diagram.type);
  if (!renderer) throw new Error(`No registered renderer for optimal diagram type: ${diagram.type}`);
  if (diagram.renderer?.id !== renderer.id || String(diagram.renderer?.version) !== renderer.version) {
    throw new Error(`Renderer contract mismatch for ${diagram.type}: expected ${renderer.id}@${renderer.version}`);
  }
  return RENDERERS[diagram.type](diagram);
}

const TYPE_INVARIANTS = {
  "architecture": { requiredRoles: ["component"], minRoleCounts: { component: 2 }, edgeKinds: ["connects", "calls", "blocked"] },
  "data-flow": { requiredRoles: ["source", "sink"], minRoleCounts: { source: 1, sink: 1 }, edgeKinds: ["flow"] },
  "deployment": { requiredRoles: ["zone", "artifact", "runtime"], minRoleCounts: { zone: 1, artifact: 1, runtime: 1 }, edgeKinds: ["deploys", "runs-on", "connects"] },
  "flowchart": { requiredRoles: ["decision", "outcome"], minRoleCounts: { decision: 1, outcome: 2 }, edgeKinds: ["branch", "next"] },
  "process": { requiredRoles: ["stage"], minRoleCounts: { stage: 3 }, edgeKinds: ["next", "branch"] },
  "state-machine": { requiredRoles: ["state"], minRoleCounts: { state: 2 }, edgeKinds: ["transition"] },
};

function roleCounts(nodes) {
  const counts = {};
  for (const node of nodes) counts[node.role] = (counts[node.role] ?? 0) + 1;
  return counts;
}

function coveredSections(diagram, outline) {
  const ids = new Set(diagram.covers_section_ids ?? [diagram.section_id]);
  return (outline?.sections ?? []).filter(section => ids.has(section.section_id));
}

function referencedEvidence(diagram, pack) {
  const ids = new Set(diagram.evidence_ids ?? []);
  return (pack?.evidence ?? []).filter(item => ids.has(item.id));
}

export function auditDiagramType(diagram, renderedSvg, { outline, evidencePack } = {}) {
  const incorrect_type_selection = [];
  const renderer_contract_mismatch = [];
  const type_invariant_violations = [];
  const selection = selectDiagramType({
    purpose: diagram.purpose,
    sections: coveredSections(diagram, outline),
    evidence: referencedEvidence(diagram, evidencePack),
  });
  if (diagram.type !== selection.type) incorrect_type_selection.push({ selected: diagram.type, expected: selection.type, rationale: selection.rationale });
  if (diagram.selection?.primary_axis !== AXIS_BY_TYPE[diagram.type]) incorrect_type_selection.push({ selected_axis: diagram.selection?.primary_axis, expected_axis: AXIS_BY_TYPE[diagram.type] });
  const expectedRenderer = rendererForType(diagram.type);
  if (!expectedRenderer) renderer_contract_mismatch.push({ type: diagram.type, reason: "no-registered-renderer" });
  else if (diagram.renderer?.id !== expectedRenderer.id || String(diagram.renderer?.version) !== expectedRenderer.version) renderer_contract_mismatch.push({ expected: expectedRenderer, actual: diagram.renderer ?? null });
  if (renderedSvg) {
    for (const [key, value] of [["data-diagram-type", diagram.type], ["data-primary-axis", diagram.selection?.primary_axis], ["data-renderer-id", expectedRenderer?.id], ["data-renderer-version", expectedRenderer?.version]]) {
      if (!value || !renderedSvg.includes(`${key}="${escapeXml(value)}"`)) renderer_contract_mismatch.push({ attribute: key, expected: value ?? null });
    }
  }
  const invariant = TYPE_INVARIANTS[diagram.type];
  if (!invariant) type_invariant_violations.push(`${diagram.type}:unsupported-invariant`);
  else {
    const counts = roleCounts(diagram.nodes ?? []);
    for (const [role, minimum] of Object.entries(invariant.minRoleCounts)) if ((counts[role] ?? 0) < minimum) type_invariant_violations.push(`${diagram.type}:role:${role}<${minimum}`);
    for (const edge of diagram.edges ?? []) if (!invariant.edgeKinds.includes(edge.kind)) type_invariant_violations.push(`${diagram.type}:edge-kind:${edge.kind}`);
    if (diagram.type === "data-flow" && !(diagram.nodes ?? []).some(node => ["transform", "store"].includes(node.role))) type_invariant_violations.push("data-flow:missing-transform-or-store");
    if (diagram.type === "deployment") {
      const zones = new Set((diagram.nodes ?? []).filter(node => node.role === "zone").map(node => node.id));
      for (const node of (diagram.nodes ?? []).filter(node => ["artifact", "runtime"].includes(node.role))) if (!zones.has(node.container_id)) type_invariant_violations.push(`deployment:uncontained:${node.id}`);
    }
    if (diagram.selection?.semantic_pattern === "secure-paved-road" && !(diagram.nodes ?? []).some(node => node.role === "boundary")) type_invariant_violations.push("architecture:missing-trust-boundary");
  }
  if (renderedSvg) {
    for (const node of diagram.nodes ?? []) {
      if (!renderedSvg.includes(`data-node-id="${escapeXml(node.id)}" data-node-role="${escapeXml(node.role)}"`)) type_invariant_violations.push(`${diagram.type}:rendered-role:${node.id}`);
    }
    for (const edge of diagram.edges ?? []) {
      if (!renderedSvg.includes(`data-from="${escapeXml(edge.from)}" data-to="${escapeXml(edge.to)}" data-edge-kind="${escapeXml(edge.kind)}"`)) type_invariant_violations.push(`${diagram.type}:rendered-edge-kind:${edge.from}->${edge.to}`);
    }
    const shapeRequirements = { "state-machine": "data-shape=\"state\"", "flowchart": "data-shape=\"decision\"", "deployment": "data-shape=\"zone\"" };
    const requiredShape = shapeRequirements[diagram.type];
    if (requiredShape && !renderedSvg.includes(requiredShape)) type_invariant_violations.push(`${diagram.type}:missing-rendered-shape`);
  }
  return { incorrect_type_selection, renderer_contract_mismatch, type_invariant_violations, recommended: selection };
}
