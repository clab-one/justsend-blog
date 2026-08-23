import { readFileSync, writeFileSync } from "node:fs";

const ORDER = [
  "REQUESTED", "RESEARCHING", "EVIDENCE_READY", "OUTLINED", "DRAFTED",
  "VISUAL_PLANNED", "VISUAL_RENDERED", "HUMANIZED", "AUDITED", "READY_FOR_REVIEW",
];

export function transitionManifest(path, next, patch = {}) {
  const manifest = JSON.parse(readFileSync(path, "utf8"));
  const currentIndex = ORDER.indexOf(manifest.status);
  const nextIndex = ORDER.indexOf(next);
  const terminal = ["ACCEPTED", "REJECTED", "BLOCKED"];
  if (terminal.includes(next)) {
    if (next !== "BLOCKED" && manifest.status !== "READY_FOR_REVIEW") throw new Error(`${next} requires READY_FOR_REVIEW`);
  } else if (currentIndex < 0 || nextIndex !== currentIndex + 1) {
    throw new Error(`invalid state transition: ${manifest.status} -> ${next}`);
  }
  const updated = { ...manifest, ...patch, status: next };
  writeFileSync(path, `${JSON.stringify(updated, null, 2)}\n`, { mode: 0o600 });
  return updated;
}

export function chooseDocumentType(request, evidencePack) {
  if (request.document_type && request.document_type !== "auto") {
    return { type: request.document_type, reason: "사용자 요청에서 문서 유형을 명시했다." };
  }
  const types = new Set(evidencePack.evidence.map(item => item.type));
  if (types.has("failure")) return { type: "incident-review", reason: "실패와 대응 기록이 핵심 근거다." };
  if (types.has("decision") && (types.has("reason") || types.has("tradeoff"))) {
    return { type: "architecture-decision", reason: "결정과 이유를 함께 설명하는 근거 구성이기 때문이다." };
  }
  if (types.has("timeline-event") && types.has("result")) return { type: "engineering-story", reason: "변경 과정과 결과를 시간 흐름으로 설명할 수 있다." };
  return { type: "explanation", reason: "확인된 구조와 동작을 독자에게 설명하는 것이 주목적이다." };
}

function idsFor(pack, types) {
  return pack.evidence.filter(item => types.includes(item.type) && item.sensitivity !== "internal-review").map(item => item.id);
}

export function buildOutline(request, pack) {
  const sections = [
    {
      section_id: "S01",
      title: "왜 실행 위치를 바꿨나",
      purpose: "독자가 변경의 가치와 결정 이유를 먼저 이해하게 한다.",
      evidence_ids: idsFor(pack, ["decision", "reason"]),
      visual_candidate: false,
    },
    {
      section_id: "S02",
      title: "기존 경로가 만든 경계",
      purpose: "변경 전 데이터 흐름과 제약을 설명한다.",
      evidence_ids: idsFor(pack, ["reason", "failure", "tradeoff"]),
      visual_candidate: true,
    },
    {
      section_id: "S03",
      title: "WebKit 온디바이스 경로",
      purpose: "새 실행 위치와 데이터 흐름을 설명한다.",
      evidence_ids: idsFor(pack, ["decision", "fact", "result"]),
      visual_candidate: true,
    },
    {
      section_id: "S04",
      title: "확인된 범위와 남은 질문",
      purpose: "상충 기록과 확인하지 못한 효과를 숨기지 않는다.",
      evidence_ids: idsFor(pack, ["timeline-event", "open-question", "tradeoff"]),
      visual_candidate: false,
    },
  ].filter(section => section.evidence_ids.length > 0 || section.section_id === "S04");
  return { audience: request.audience, goal: request.goal, sections };
}

export function renderOutlineMarkdown(outline) {
  const lines = ["# 글 개요", "", `- 독자: ${outline.audience}`, `- 목표: ${outline.goal}`, ""];
  for (const section of outline.sections) {
    lines.push(`## ${section.section_id}. ${section.title}`, "", `- purpose: ${section.purpose}`, `- evidence_ids: ${section.evidence_ids.join(", ") || "없음"}`, `- visual_candidate: ${section.visual_candidate}`, "");
  }
  return `${lines.join("\n")}\n`;
}

function evidenceById(pack) {
  return new Map(pack.evidence.map(item => [item.id, item]));
}

export function renderTechnicalDraft({ request, pack, outline }) {
  const byId = evidenceById(pack);
  const title = pack.topic || "JustSend 기술 변경 기록";
  const lines = [
    "---",
    `title: "${title.replaceAll('"', '\\"')}"`,
    `audience: "${String(request.audience).replaceAll('"', '\\"')}"`,
    "status: technical-draft",
    "---",
    "",
    `# ${title}`,
    "",
    `${request.audience}가 변경의 이유와 구조적 차이를 판단할 수 있도록 확인된 작업 기록만 정리했다.`,
    "",
  ];
  for (const section of outline.sections) {
    lines.push(`## ${section.title}`, "");
    const items = section.evidence_ids.map(id => byId.get(id)).filter(Boolean).filter(item => item.sensitivity === "public-safe");
    if (items.length === 0) {
      if (section.section_id === "S04") lines.push("확인된 기록만으로 단정할 수 없는 항목은 출판 전에 추가 검증이 필요하다.", "");
      continue;
    }
    for (const item of items) {
      lines.push(item.statement, `<!-- evidence: ${item.id} -->`, "");
    }
    if (section.section_id === "S04" && pack.conflicts.length > 0) {
      lines.push(`서로 다른 기록 ${pack.conflicts.length}건이 같은 항목에 다른 값을 남겼다. 이 값은 확정 사실로 사용하지 않았다.`, "");
    }
  }
  return `${lines.join("\n").trim()}\n`;
}
