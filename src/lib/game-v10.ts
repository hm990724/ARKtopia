import {
  AnimalId,
  Origin,
  Start,
  State,
  createGame,
  copy,
  cap,
  log,
  recalc,
  makeAnimal,
  specs,
  dailyWork,
  repair,
  extract,
  finish,
} from "./sim";
import {
  initialSecurity,
  nightlySecurity,
  type SecurityState,
} from "./security";

export type Gear = "flashlight" | "filter" | "scanner" | "medkit" | "cage";
export type RegionId =
  | "garden"
  | "conservatory"
  | "rail"
  | "archive"
  | "vault"
  | "tunnels";
export type IncidentId =
  | "echo"
  | "breach"
  | "blackout"
  | "spores"
  | "signal"
  | "visitor";
export type Incident = {
  id: IncidentId;
  title: string;
  desc: string;
  cause: string;
  options: [string, string, string];
};
export type Run = {
  region: RegionId;
  gear: Gear[];
  stage: number;
  integrity: number;
  exposure: number;
  loot: number;
  discovery: AnimalId | null;
  event: string;
  log: string[];
};
export type V10 = State & {
  infection: number;
  electricCells: number;
  flashlight: number;
  filters: number;
  threat: number;
  facility: number;
  clues: number;
  daysRested: number;
  encounters: number;
  dayEvents: number;
  pendingIncident: IncidentId | null;
  lastOutcome: string;
  run: Run | null;
  suppliesCollected: number;
  eventHistory: string[];
  security: SecurityState;
};
export const regions: {
  id: RegionId;
  name: string;
  desc: string;
  art: string;
  danger: number;
  reward: number;
  ap: number;
  power: number;
  unlocked: number;
  animals: AnimalId[];
}[] = [
  {
    id: "garden",
    name: "중앙 외곽",
    desc: "폐쇄된 매표소와 정원. 작은 개체의 흔적.",
    art: "gate",
    danger: 16,
    reward: 1,
    ap: 1,
    power: 9,
    unlocked: 1,
    animals: ["rabbit", "fox"],
  },
  {
    id: "conservatory",
    name: "온실 폐쇄동",
    desc: "축축한 식물과 감염 포자가 자라는 구역.",
    art: "sanctuary",
    danger: 31,
    reward: 2,
    ap: 2,
    power: 15,
    unlocked: 2,
    animals: ["deer", "otter", "crow"],
  },
  {
    id: "rail",
    name: "폐역 승강장",
    desc: "열차 아래에서 생체 신호가 잡힌다.",
    art: "wasteland",
    danger: 46,
    reward: 3,
    ap: 2,
    power: 19,
    unlocked: 3,
    animals: ["fox", "wolf", "lynx"],
  },
  {
    id: "archive",
    name: "관측소 기록실",
    desc: "위성 장비와 알아볼 수 없는 기록.",
    art: "laboratory",
    danger: 55,
    reward: 3,
    ap: 2,
    power: 23,
    unlocked: 5,
    animals: ["owl", "moth", "deer"],
  },
  {
    id: "vault",
    name: "B-3 밀폐 연구동",
    desc: "격리 실패 기록과 봉인된 생물 캡슐.",
    art: "laboratory",
    danger: 72,
    reward: 5,
    ap: 3,
    power: 30,
    unlocked: 9,
    animals: ["axolotl", "mutant"],
  },
  {
    id: "tunnels",
    name: "제0구역 통로",
    desc: "EVE의 기록에서 존재하지 않는 장소.",
    art: "wasteland",
    danger: 86,
    reward: 6,
    ap: 3,
    power: 37,
    unlocked: 14,
    animals: ["mutant"],
  },
];
export const gearData: { id: Gear; name: string; desc: string }[] = [
  {
    id: "flashlight",
    name: "수동 손전등",
    desc: "정전에도 탐사 가능 · 소모 전지 필요",
  },
  { id: "filter", name: "바이오필터", desc: "포자·감염 확률 감소 · 필터 1개" },
  {
    id: "scanner",
    name: "EVE 스캐너",
    desc: "위험 예측 개선 · 추가 전력 필요",
  },
  { id: "medkit", name: "응급 키트", desc: "현장 응급 처치 · 치료제 소모" },
  { id: "cage", name: "운송 케이지", desc: "구조 성공률 상승 · 부품 1개" },
];
export const incidentDefs: Record<IncidentId, Incident> = {
  echo: {
    id: "echo",
    title: "격리실에서 들린 노래",
    desc: "평소 울음소리만 내던 개체가 익숙한 박자로 울고 있다. EVE는 우연이라고 말한다.",
    cause: "개체와의 유대 또는 관찰 기록이 누적됨",
    options: [
      "소리를 녹음하고 행동을 관찰한다",
      "개체를 진정시키고 휴식시킨다",
      "오늘은 아무것도 하지 않는다",
    ],
  },
  breach: {
    id: "breach",
    title: "격리문 이상 진동",
    desc: "동물원 바깥에서 무언가 출입문을 두드린다. 안쪽의 동물들도 몸을 숨긴다.",
    cause: "외부 위협도 상승·격리 개체 증가",
    options: [
      "전력 22를 사용해 격리문 봉쇄",
      "동물부터 피신시킨다 (체력 12)",
      "함정을 감시하고 기록한다",
    ],
  },
  blackout: {
    id: "blackout",
    title: "전력망 이상",
    desc: "격리동의 불빛이 하나씩 꺼진다. 배터리 전압이 급격히 떨어졌다.",
    cause: "전력 부족·장비 가동 누적",
    options: [
      "부품 2개로 긴급 수리한다",
      "비필수 장비를 끄고 전력을 아낀다",
      "EVE에게 과부하 분석을 요청한다",
    ],
  },
  spores: {
    id: "spores",
    title: "붉은 포자 확산",
    desc: "외부에서 묻어 온 포자가 환기구에 침투했다. 방 안의 개체들이 기침을 시작한다.",
    cause: "높은 감염도·오염 지역 탐사",
    options: [
      "필터를 소모해 환기구 정화",
      "격리동을 봉쇄해 확산을 늦춘다",
      "자원을 아끼고 경과를 관찰한다",
    ],
  },
  signal: {
    id: "signal",
    title: "누군가의 비상 신호",
    desc: "정적 사이로 사람 목소리 같은 신호가 들린다. EVE의 음성 출력이 잠시 끊긴다.",
    cause: "기록 복원 또는 고위험 구역 발견",
    options: [
      "기록을 저장해 주파수를 분석한다",
      "위험을 감수하고 위치를 추적한다",
      "응답하지 않고 신호를 차단한다",
    ],
  },
  visitor: {
    id: "visitor",
    title: "정체불명의 방문자",
    desc: "외곽 카메라에 사람 키와 비슷한 그림자가 찍혔다. 그런데 얼굴을 식별할 수 없다.",
    cause: "장기간 시설 운영·외부 위협 누적",
    options: [
      "장비로 그림자를 추적한다",
      "격리문을 잠그고 상황을 기다린다",
      "EVE의 영상 기록을 대조한다",
    ],
  },
};
export function beginGame(origin: Origin, start: Start): V10 {
  const s = createGame(origin, start) as V10;
  Object.assign(s, {
    infection: start === "station" ? 14 : 3,
    electricCells: 2,
    flashlight: 86,
    filters: 2,
    threat: 17,
    facility: 86,
    clues: 0,
    daysRested: 0,
    encounters: 0,
    dayEvents: 0,
    pendingIncident: null,
    lastOutcome: "신호 연결 완료. 중앙 관리 구역이 열렸다.",
    run: null,
    suppliesCollected: 0,
    eventHistory: [],
    security: initialSecurity(),
  });
  s.credits = 925;
  s.power = 65;
  s.shield = 100;
  return s;
}
export function loadGame(raw: unknown): V10 | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as V10;
  if (!Array.isArray(s.animals) || !Number.isFinite(s.day)) return null;
  s.animals = s.animals.filter(
    (a) => !["dino", "specter"].includes(String(a.id)),
  );
  if (["dino", "specter", "chimera"].includes(String(s.pending)))
    s.pending = null;
  if (
    s.run &&
    ["dino", "specter", "chimera"].includes(String(s.run.discovery))
  ) {
    s.run.discovery = null;
  }
  return Object.assign(s, {
    infection: s.infection ?? Math.round((s.radiation || 0) / 2),
    electricCells: s.electricCells ?? 2,
    flashlight: s.flashlight ?? 85,
    filters: s.filters ?? 2,
    threat: s.threat ?? 17,
    facility: s.facility ?? 85,
    clues: s.clues ?? 0,
    daysRested: s.daysRested ?? 0,
    encounters: s.encounters ?? 0,
    dayEvents: s.dayEvents ?? 0,
    pendingIncident: s.pendingIncident ?? null,
    lastOutcome: s.lastOutcome ?? "",
    run: s.run ?? null,
    suppliesCollected: s.suppliesCollected ?? 0,
    eventHistory: s.eventHistory ?? [],
    security: s.security ?? initialSecurity(),
  });
}
export function summary(
  s: V10,
  title: string,
  msg: string,
  kind: "info" | "good" | "bad" | "mystery" = "info",
) {
  s.lastOutcome = msg;
  log(s, title, msg, kind);
  return s;
}
export function doBase(
  s: V10,
  type:
    | "rest"
    | "recharge"
    | "handsearch"
    | "eve"
    | "feed"
    | "repair"
    | "crank"
    | "decontam",
): V10 {
  const n = copy(s) as V10;
  if (n.phase !== "day" || n.ap < 1) return s;
  if (type === "rest") {
    n.ap--;
    n.hp = cap(n.hp + 15);
    n.stamina = cap(n.stamina + 32);
    n.mind = cap(n.mind + 10);
    n.daysRested++;
    n.threat = cap(n.threat + 3);
    return summary(
      n,
      "짧은 휴식",
      "휴식하며 체력과 정신을 회복했다. 그 사이 바깥의 움직임은 계속된다.",
      "good",
    );
  }
  if (type === "decontam") {
    if (n.filters < 1) return s;
    n.ap--;
    n.filters--;
    n.infection = cap(n.infection - 26);
    n.hp = cap(n.hp + 4);
    n.threat = cap(n.threat - 3);
    return summary(
      n,
      "제독실 가동",
      "바이오필터를 사용해 감염성 포자와 오염 흔적을 제거했다.",
      "good",
    );
  }
  if (type === "crank") {
    n.ap--;
    n.stamina = cap(n.stamina - 14);
    n.mind = cap(n.mind - 3);
    n.power = cap(n.power + 17);
    n.flashlight = cap(n.flashlight + 9);
    return summary(
      n,
      "수동 발전기 가동",
      "부품이 없어 발전기 크랭크를 직접 돌렸다. 체력이 소모되었지만 최소 전력이 확보됐다.",
      "good",
    );
  }
  if (type === "recharge") {
    if (n.parts < 1) return s;
    n.ap--;
    n.parts--;
    n.power = cap(n.power + (n.origin === "engineer" ? 37 : 28));
    n.flashlight = cap(n.flashlight + 12);
    return summary(
      n,
      "비상 발전기 가동",
      "부품을 소모해 발전기를 재가동했다. 격리실과 EVE 전력 공급이 회복된다.",
      "good",
    );
  }
  if (type === "handsearch") {
    if (n.flashlight < 16) return s;
    n.ap--;
    n.flashlight -= 16;
    n.stamina = cap(n.stamina - 9);
    n.food += Math.random() < 0.55 ? 1 : 0;
    n.parts += Math.random() < 0.55 ? 1 : 0;
    n.credits += 25;
    n.infection = cap(n.infection + Math.round(Math.random() * 7));
    n.threat = cap(n.threat + 4);
    return summary(
      n,
      "수동 물자 수색",
      "전력이 없어 수동 손전등으로 폐허를 뒤졌다. 적은 물자를 회수했지만 감염 위험이 늘었다.",
      "info",
    );
  }
  if (type === "eve") {
    if (n.power < 8 || n.eve < 10) return s;
    n.ap--;
    n.power -= 8;
    n.eve = cap(n.eve - 3);
    n.knowledge += 6;
    n.clues++;
    return summary(
      n,
      "EVE 분석",
      "EVE가 기존 기록의 모순을 한 줄 해독했다. 새로운 질문을 열 수 있다.",
      "mystery",
    );
  }
  if (type === "feed") {
    if (n.food < 1 || !n.animals.some((a) => a.alive)) return s;
    n.ap--;
    const alive = n.animals.filter((a) => a.alive);
    const count = Math.min(n.food, alive.length);
    n.food -= count;
    alive.slice(0, count).forEach((a) => {
      a.hp = cap(a.hp + 9);
      a.stress = cap(a.stress - 10);
      a.bond = cap(a.bond + 5);
    });
    return summary(
      n,
      "전체 급식",
      `${count}마리에게 먹이를 주었다. 격리실 안의 소리가 조금 잦아들었다.`,
      "good",
    );
  }
  if (n.parts < 1) return s;
  n.ap--;
  n.parts--;
  n.facility = cap(n.facility + 23);
  n.eve = cap(n.eve + 6);
  return summary(
    n,
    "시설 점검",
    "환기와 격리 장비를 정비했다. 다음 사고의 피해 위험이 감소한다.",
    "good",
  );
}
export function purchase(
  s: V10,
  kind: "food" | "med" | "parts" | "filter" | "battery" | "room" | "cage",
): V10 {
  const n = copy(s) as V10;
  const price = {
    food: 90,
    med: 145,
    parts: 115,
    filter: 170,
    battery: 120,
    room: 480,
    cage: 260,
  }[kind];
  if (n.credits < price) return s;
  n.credits -= price;
  if (kind === "food") n.food += 3;
  if (kind === "med") n.medicine += 2;
  if (kind === "parts") n.parts += 3;
  if (kind === "filter") n.filters += 2;
  if (kind === "battery") {
    n.electricCells += 2;
    n.flashlight = cap(n.flashlight + 35);
  }
  if (kind === "room") n.rooms++;
  if (kind === "cage") n.parts += 2;
  return summary(
    n,
    "보급 도착",
    `${price} CR로 ${kind} 보급품을 확보했다.`,
    "good",
  );
}
export function startRun(s: V10, region: RegionId, gear: Gear[]): V10 {
  const n = copy(s) as V10;
  const r = regions.find((r) => r.id === region)!;
  const scanner = gear.includes("scanner");
  const available = n.power >= r.power + (scanner ? 8 : 0);
  const manual = gear.includes("flashlight") && n.flashlight >= 20;
  if (
    n.phase !== "day" ||
    n.run ||
    n.ap < r.ap ||
    n.day < r.unlocked ||
    (!available && !manual)
  )
    return s;
  if (gear.includes("filter") && n.filters < 1) return s;
  if (gear.includes("medkit") && n.medicine < 1) return s;
  if (gear.includes("cage") && n.parts < 1) return s;
  n.ap -= r.ap;
  if (available) n.power -= r.power + (scanner ? 8 : 0);
  else n.flashlight = cap(n.flashlight - 25);
  if (gear.includes("filter")) n.filters--;
  if (gear.includes("medkit")) n.medicine--;
  if (gear.includes("cage")) n.parts--;
  const initialRisk =
    r.danger +
    (available ? 0 : 16) -
    (gear.includes("filter") ? 13 : 0) -
    (scanner ? 9 : 0);
  n.run = {
    region,
    gear,
    stage: 0,
    integrity: 100,
    exposure: 0,
    loot: 0,
    discovery: null,
    event: "",
    log: [
      available ? "EVE 탐사 통신 연결 완료" : "전력 부족. 수동 손전등으로 진입",
    ],
  };
  n.eventRisk = cap(n.eventRisk + 3);
  n.threat = cap(n.threat + 4);
  n.lastOutcome = `${r.name}에 진입했다. 초기 위험 추정 ${Math.max(5, initialRisk)}%.`;
  return n;
}
export type FieldScene = {
  title: string;
  description: string;
  hint: string;
  preferred: "careful" | "rush" | "gear";
  punished: "careful" | "rush" | "gear";
};
export const fieldScenes: Record<RegionId, FieldScene[]> = {
  garden: [
    {
      title: "무너진 매표소",
      description:
        "유리창 안에 물자 가방이 걸려 있습니다. 발소리에 반응하는 소리가 들립니다.",
      hint: "진입 전에 주변을 관찰하면 감염체의 이동 경로를 확인할 수 있습니다.",
      preferred: "careful",
      punished: "rush",
    },
    {
      title: "불안정한 철제 사다리",
      description:
        "상층 창고에 약품이 보이지만 사다리가 금방이라도 무너질 듯합니다.",
      hint: "장비를 고정하거나 신속하게 회수할지 선택해야 합니다.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "어둠 속 보급 상자",
      description: "시간이 흐를수록 알 수 없는 그림자가 가까워집니다.",
      hint: "오래 머무르는 것이 더 위험할 수 있습니다.",
      preferred: "rush",
      punished: "careful",
    },
  ],
  conservatory: [
    {
      title: "균사로 뒤덮인 온실",
      description:
        "공기 중 포자가 짙습니다. 생체 반응이 유리 너머에서 움직입니다.",
      hint: "장비를 활용하면 바이오필터의 효율을 높일 수 있습니다.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "잠든 동물의 흔적",
      description:
        "나뭇잎 아래 발자국이 남아 있습니다. 소리를 내면 사라질 수 있습니다.",
      hint: "천천히 접근하세요.",
      preferred: "careful",
      punished: "rush",
    },
    {
      title: "붕괴 중인 관수 장치",
      description: "물이 새고 있어 자료가 곧 유실됩니다.",
      hint: "빠르게 확보해야 합니다.",
      preferred: "rush",
      punished: "careful",
    },
  ],
  rail: [
    {
      title: "터널의 고장 난 경보",
      description: "열차 아래 진동이 점점 커집니다.",
      hint: "기다리는 것보다 신속한 진입이 유리합니다.",
      preferred: "rush",
      punished: "careful",
    },
    {
      title: "감염성 먼지층",
      description: "환기되지 않는 먼지가 계단을 덮고 있습니다.",
      hint: "스캐너나 필터 장비 사용을 고려하세요.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "플랫폼의 작은 발자국",
      description: "발자국이 두 개의 출구로 이어집니다.",
      hint: "주변을 관찰해야 안전한 출구를 구별할 수 있습니다.",
      preferred: "careful",
      punished: "rush",
    },
  ],
  archive: [
    {
      title: "오래된 암호 잠금장치",
      description: "관측 기록 저장 장치에 전력이 남아 있습니다.",
      hint: "기계를 분석하는 것이 최선입니다.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "흩어진 문서 상자",
      description: "바람이 불면 기록이 모두 흩어질 것 같습니다.",
      hint: "빠른 확보가 유리합니다.",
      preferred: "rush",
      punished: "careful",
    },
    {
      title: "불빛에 반응하는 감시기",
      description: "보안 센서가 느리게 회전합니다.",
      hint: "천천히 사각지대를 확인하세요.",
      preferred: "careful",
      punished: "rush",
    },
  ],
  vault: [
    {
      title: "봉인 캡슐 냉각 누출",
      description: "냉각액과 오염 물질이 동시에 새고 있습니다.",
      hint: "장비를 사용하면 직접 접촉하지 않을 수 있습니다.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "경보 직전의 수송실",
      description:
        "붉은 경고등이 점멸합니다. 문이 닫히기 전에 확보해야 합니다.",
      hint: "강행이 유리한 특수 상황입니다.",
      preferred: "rush",
      punished: "careful",
    },
    {
      title: "움직이지 않는 실험체",
      description: "작은 생물이 눈만 뜬 채 당신을 응시합니다.",
      hint: "조용히 접근해 반응을 관찰하세요.",
      preferred: "careful",
      punished: "rush",
    },
  ],
  tunnels: [
    {
      title: "파손된 바이오 차폐문",
      description: "닫히지 않는 문 사이로 감염성 안개가 흘러옵니다.",
      hint: "차폐 장비를 사용해야 합니다.",
      preferred: "gear",
      punished: "rush",
    },
    {
      title: "제000번 표지판",
      description:
        "복도의 비상등이 하나씩 꺼집니다. 뒤에서 발소리가 따라옵니다.",
      hint: "멈추지 말고 빠르게 통과하세요.",
      preferred: "rush",
      punished: "careful",
    },
    {
      title: "낯선 사람의 손자국",
      description:
        "유리에 손자국이 남아 있습니다. 크기가 당신의 손과 같습니다.",
      hint: "기록을 남기며 신중하게 조사하세요.",
      preferred: "careful",
      punished: "rush",
    },
  ],
};
export function currentFieldScene(run: Run): FieldScene {
  return fieldScenes[run.region][run.stage % 3];
}
export type RunChoice = "careful" | "rush" | "gear" | "retreat";
export function runStep(s: V10, choice: RunChoice, rand = Math.random()): V10 {
  if (!s.run) return s;
  const n = copy(s) as V10;
  const run = n.run!;
  const region = regions.find((r) => r.id === run.region)!;
  if (choice === "retreat") {
    n.run = null;
    n.lastOutcome = "물자를 포기하고 철수했다. 확보한 소량의 물자는 보존됐다.";
    n.credits += run.loot * 18;
    log(n, "긴급 철수", n.lastOutcome, "info");
    return n;
  }
  const scene = currentFieldScene(run);
  const tactic =
    choice === scene.preferred ? -20 : choice === scene.punished ? 19 : 0;
  const risk =
    region.danger +
    tactic +
    run.stage * 11 +
    run.exposure * 0.28 +
    n.infection * 0.25 +
    (100 - n.facility) * 0.13 -
    (run.gear.includes("filter") ? 12 : 0) -
    (run.gear.includes("scanner") ? 8 : 0) +
    (choice === "rush" ? 18 : choice === "gear" ? -20 : -8);
  const check = rand * 100;
  const success = check > risk;
  const gain = success
    ? (choice === "rush" ? 3 : choice === "gear" ? 2 : 2) * region.reward
    : Math.max(0, region.reward - 1);
  run.loot += gain;
  run.stage++;
  run.exposure += choice === "rush" ? 20 : choice === "gear" ? 7 : 12;
  run.integrity = cap(
    run.integrity - (success ? 6 : 22) - (choice === "rush" ? 8 : 0),
  );
  n.stamina = cap(n.stamina - (choice === "rush" ? 13 : 7));
  n.infection = cap(
    n.infection +
      (success ? 2 : 9) +
      Math.round(region.danger / 18) -
      (run.gear.includes("filter") ? 5 : 0),
  );
  n.threat = cap(n.threat + (success ? 2 : 6));
  if (choice === "gear") {
    if (n.flashlight >= 9) n.flashlight -= 9;
    else n.power = cap(n.power - 6);
  }
  if (!success) {
    n.hp = cap(n.hp - 5 - Math.round(region.danger / 20));
    n.mind = cap(n.mind - 5);
    n.facility = cap(n.facility - 2);
  }
  run.log.push(
    `${success ? "작전 성공" : "위험 발생"} · ${scene.title} · ${choice === scene.preferred ? "상황에 적합한 대응" : choice === scene.punished ? "잘못된 접근으로 위험 증가" : "기본 대응"}`,
  );
  run.event = run.log[run.log.length - 1];
  if (run.stage >= 3 || run.integrity <= 15 || n.hp <= 0) {
    n.parts += Math.max(0, Math.floor(run.loot / 3));
    n.food += Math.max(0, Math.floor(run.loot / 4));
    n.credits += run.loot * 24;
    n.suppliesCollected += run.loot;
    n.encounters++;
    let creature: AnimalId | null = null;
    const candidates = region.animals.filter(
      (id) =>
        !n.animals.some((a) => a.id === id && a.alive) &&
        specs.find((x) => x.id === id)!.unlock <= n.day,
    );
    if (success && candidates.length && rand > 0.3)
      creature = candidates[(n.day + run.stage) % candidates.length];
    n.run = null;
    if (creature) {
      n.pending = creature;
      summary(
        n,
        "미확인 개체 발견",
        `${specs.find((a) => a.id === creature)?.name}이(가) 발견됐다. 구조 여부를 판단해야 한다.`,
        "mystery",
      );
    } else
      summary(
        n,
        "탐사 종료",
        `물자 가치 ${run.loot}을 회수했다. 시설로 돌아왔으나 위협도와 감염도가 달라졌다.`,
        success ? "good" : "bad",
      );
    if (n.infection >= 60) n.eventRisk = cap(n.eventRisk + 14);
  } else n.lastOutcome = run.event;
  recalc(n);
  return n;
}
export function rescueChoice(
  s: V10,
  choice: "secure" | "treat" | "release",
  rand = Math.random(),
): V10 {
  if (!s.pending) return s;
  const n = copy(s) as V10;
  const id = n.pending!;
  const sp = specs.find((a) => a.id === id)!;
  n.pending = null;
  if (choice === "release") {
    n.trust = cap(n.trust + 3);
    return summary(
      n,
      "방생 선택",
      `${sp.name}를 현장에 남겨두었다. 그 선택이 훗날 어떤 결과를 낳을지 알 수 없다.`,
      "info",
    );
  }
  if (choice === "treat") {
    if (n.medicine < 1) return s;
    n.medicine--;
    n.trust = cap(n.trust + 6);
    n.clues++;
    return summary(
      n,
      "현장 치료",
      `${sp.name}를 치료했다. 멀어지는 발자국 곁에 이상한 행동 기록이 남았다.`,
      "good",
    );
  }
  if (n.animals.filter((a) => a.alive).length >= n.rooms)
    return summary(
      n,
      "격리실 부족",
      `${sp.name}를 안전하게 옮길 공간이 없어 현장에 남겨두었다.`,
      "bad",
    );
  const chance =
    60 +
    (n.origin === "medic" ? 11 : 0) +
    (n.medicine > 0 ? 6 : 0) -
    (n.infection > 45 ? 11 : 0);
  if (rand * 100 < chance) {
    const rooms = new Set(n.animals.filter((a) => a.alive).map((a) => a.room));
    let room = 1;
    while (rooms.has(room)) room++;
    n.animals.push(makeAnimal(id, room));
    n.lifeSaved++;
    n.trust = cap(n.trust + 4);
    n.eventRisk = cap(n.eventRisk + 4);
    return summary(
      n,
      "구조 완료",
      `${sp.name} 구조 성공. 이동 케이지의 문이 닫히고 격리실 ${room}번에 배정됐다.`,
      "good",
    );
  }
  n.hp = cap(n.hp - 7);
  n.threat = cap(n.threat + 8);
  return summary(
    n,
    "구조 실패",
    `${sp.name}가 수색망을 벗어났다. 공격을 피하는 과정에서 부상을 입었다.`,
    "bad",
  );
}
export function incidentWeight(s: V10) {
  return cap(
    7 +
      s.threat * 0.24 +
      s.infection * 0.19 +
      (100 - s.facility) * 0.2 +
      (100 - s.power) * 0.16 +
      s.animals.filter((a) => a.alive).length * 3 +
      Math.min(15, s.encounters),
  );
}
export function determineIncident(
  s: V10,
  rand = Math.random(),
): IncidentId | null {
  if (s.day < 2 || rand * 100 >= incidentWeight(s)) return null;
  const scores: [IncidentId, number][] = [
    ["breach", s.threat + 15],
    ["blackout", 100 - s.power + 12],
    ["spores", s.infection + 5],
    [
      "echo",
      s.animals.reduce((a, b) => a + b.bond + b.records * 5, 0) / 5 + 10,
    ],
    ["signal", s.knowledge / 3 + s.clues * 9],
    ["visitor", s.day > 7 ? s.day * 3 : 0],
  ];
  const sum = scores.reduce((v, [, w]) => v + Math.max(0, w), 0);
  let r = rand * sum;
  for (const [id, w] of scores) {
    r -= Math.max(0, w);
    if (r <= 0) return id;
  }
  return "breach";
}
export function resolveIncident(s: V10, option: number): V10 {
  if (!s.pendingIncident) return s;
  const n = copy(s) as V10;
  const id = n.pendingIncident!;
  n.pendingIncident = null;
  const def = incidentDefs[id];
  const valid = option >= 0 && option <= 2;
  if (!valid) return s;
  if (id === "breach") {
    if (option === 0) {
      if (n.power < 22) return s;
      n.power -= 22;
      n.threat = cap(n.threat - 24);
      n.facility = cap(n.facility + 2);
    }
    if (option === 1) {
      n.hp = cap(n.hp - 12);
      n.animals.forEach((a) => (a.stress = cap(a.stress + 6)));
      n.threat = cap(n.threat - 12);
    }
    if (option === 2) {
      n.knowledge += 8;
      n.facility = cap(n.facility - 15);
      n.threat = cap(n.threat + 6);
    }
  }
  if (id === "blackout") {
    if (option === 0) {
      if (n.parts < 2) return s;
      n.parts -= 2;
      n.power = cap(n.power + 18);
      n.facility = cap(n.facility + 22);
    }
    if (option === 1) {
      n.power = cap(n.power + 11);
      n.eve = cap(n.eve - 9);
    }
    if (option === 2) {
      n.power = cap(n.power - 5);
      n.knowledge += 7;
      n.eve = cap(n.eve - 12);
    }
  }
  if (id === "spores") {
    if (option === 0) {
      if (n.filters < 1) return s;
      n.filters--;
      n.infection = cap(n.infection - 21);
    }
    if (option === 1) {
      n.power = cap(n.power - 10);
      n.infection = cap(n.infection - 10);
      n.facility = cap(n.facility - 7);
    }
    if (option === 2) {
      n.infection = cap(n.infection + 16);
      n.animals.forEach((a) => (a.contamination = cap(a.contamination + 12)));
    }
  }
  if (id === "echo") {
    if (option === 0) {
      n.knowledge += 12;
      n.clues++;
      n.animals.forEach((a) => (a.stress = cap(a.stress + 4)));
    }
    if (option === 1) {
      n.trust = cap(n.trust + 8);
      n.animals.forEach((a) => (a.stress = cap(a.stress - 12)));
    }
    if (option === 2) {
      n.mind = cap(n.mind + 3);
    }
  }
  if (id === "signal" || id === "visitor") {
    if (option === 0) {
      n.knowledge += 13;
      n.clues++;
      n.eve = cap(n.eve - 5);
    }
    if (option === 1) {
      n.hp = cap(n.hp - 8);
      n.infection = cap(n.infection + 9);
      n.knowledge += 21;
      n.clues += 2;
      n.threat = cap(n.threat + 7);
    }
    if (option === 2) {
      n.threat = cap(n.threat - 12);
      n.trust = cap(n.trust - 4);
    }
  }
  n.eventHistory = [
    ...n.eventHistory,
    `${n.day}일차 ${def.title} · ${def.options[option]}`,
  ].slice(-30);
  n.lastEvent = def.title;
  n.threat = cap(n.threat - 4);
  return summary(
    n,
    def.title,
    `${def.options[option]} — 선택의 영향이 시설과 다음 날 상태에 남았다.`,
    option === 2 ? "bad" : "mystery",
  );
}
export function finishDay(
  s: V10,
  nightChoice: "shield" | "rest" | "analyze",
): V10 {
  const n = copy(s) as V10;
  if (n.phase !== "day" || n.pending || n.run || n.pendingIncident) return s;
  const charge = { shield: 22, rest: 5, analyze: 16 }[nightChoice];
  if (n.power < charge) return s;
  n.power -= charge;
  n.power = cap(n.power - 6);
  n.facility = cap(n.facility - (n.power < 20 ? 10 : 3));
  n.threat = cap(
    n.threat +
      (nightChoice === "shield" ? -13 : nightChoice === "rest" ? 4 : 7),
  );
  n.infection = cap(n.infection + (n.facility < 50 ? 7 : 2));
  if (nightChoice === "rest") {
    n.hp = cap(n.hp + 12);
    n.stamina = cap(n.stamina + 38);
    n.mind = cap(n.mind + 7);
  }
  if (nightChoice === "analyze") {
    n.knowledge += 11;
    n.clues++;
    n.eve = cap(n.eve - 5);
  }
  if (nightChoice === "shield") n.facility = cap(n.facility + 3);
  n.animals
    .filter((a) => a.alive)
    .forEach((a) => {
      if (n.food > 0) {
        n.food--;
        a.stress = cap(a.stress + 3);
      } else {
        a.hp = cap(a.hp - 9);
        a.stress = cap(a.stress + 14);
      }
      if (n.infection > 45) a.contamination = cap(a.contamination + 5);
      if (a.contamination > 65) a.hp = cap(a.hp - 7);
      if (a.hp <= 0) {
        a.alive = false;
        log(n, "격리 개체 사망", `${a.name}의 신호가 끊겼다.`, "bad");
      }
    });
  nightlySecurity(n);
  if (n.infection > 75) {
    n.hp = cap(n.hp - 10);
    n.eve = cap(n.eve - 3);
  }
  n.stamina = cap(n.stamina + 14);
  n.day++;
  n.ap = 4;
  n.dayEvents = 0;
  n.run = null;
  if (n.day >= 13 && n.knowledge >= 70 && n.clues >= 3 && !n.flags.humanTruth) {
    n.flags.humanTruth = true;
    log(
      n,
      "ARK 열람 권한",
      "기록을 검증한 결과 동물들에게 인간의 의식과 지식이 분산 보존됐음이 확인됐다.",
      "mystery",
    );
  }
  if (
    n.day >= 20 &&
    n.flags.humanTruth &&
    n.knowledge >= 145 &&
    n.clues >= 7 &&
    !n.flags.mirror
  ) {
    n.flags.mirror = true;
    log(
      n,
      "제000번 개체",
      "거울실의 바이탈 기록은 관리자의 신체가 인간이 아님을 가리킨다.",
      "mystery",
    );
  }
  if ((n.day >= 26 && n.flags.mirror) || n.day >= 38) n.phase = "finale";
  else {
    n.pendingIncident = determineIncident(n);
    n.phase = "day";
  }
  summary(
    n,
    "하루의 종료",
    `전력 ${n.power}%, 감염도 ${n.infection}%, 위협 ${n.threat}%. ${nightChoice === "shield" ? "방어막을 점검했다." : nightChoice === "rest" ? "충분한 휴식을 취했다." : "EVE가 기록을 재분석했다."}`,
    "info",
  );
  recalc(n);
  return n;
}
export { dailyWork, extract, finish };

// Non-destructive sample synthesis: donors remain alive, but the attempt strains them.
export function synthesize(
  s: V10,
  first: AnimalId,
  second: AnimalId,
  rand = Math.random(),
): V10 {
  const a = s.animals.find((x) => x.id === first && x.alive),
    b = s.animals.find((x) => x.id === second && x.alive);
  if (
    !a ||
    !b ||
    first === second ||
    ["mutant", "chimera"].includes(first) ||
    ["mutant", "chimera"].includes(second) ||
    s.animals.some((x) => x.id === "chimera" && x.alive) ||
    s.phase !== "day" ||
    s.ap < 2 ||
    s.power < 18 ||
    s.parts < 2 ||
    s.knowledge < 25 ||
    s.animals.filter((x) => x.alive).length >= s.rooms
  )
    return s;
  const n = copy(s) as V10;
  const donorA = n.animals.find((x) => x.id === first)!,
    donorB = n.animals.find((x) => x.id === second)!;
  n.ap -= 2;
  n.power -= 18;
  n.parts -= 2;
  n.knowledge -= 25;
  const chance = Math.min(
    0.84,
    Math.max(
      0.22,
      0.36 +
        (a.bond + b.bond) / 450 -
        (a.stress + b.stress) / 500 +
        n.facility / 450,
    ),
  );
  const success = rand < chance;
  donorA.stress = cap(donorA.stress + (success ? 8 : 16));
  donorB.stress = cap(donorB.stress + (success ? 8 : 16));
  if (success) {
    const species: AnimalId = "chimera";
    if (n.animals.some((x) => x.id === species && x.alive)) {
      n.knowledge += 10;
      n.clues++;
      return summary(
        n,
        "합성 패턴 중복",
        "기존 개체와 같은 복합 신호가 확인됐습니다. 중복 개체 대신 지식 단서를 기록했습니다.",
        "mystery",
      );
    }
    const rooms = new Set(n.animals.filter((x) => x.alive).map((x) => x.room));
    let room = 1;
    while (rooms.has(room)) room++;
    n.animals.push(makeAnimal(species, room));
    n.lifeSaved++;
    n.eventRisk = cap(n.eventRisk + 9);
    return summary(
      n,
      "세포·기억 합성 성공",
      `${donorA.name}와 ${donorB.name}의 보존 샘플에서 ${specs.find((x) => x.id === species)?.name}가 태어났습니다. 두 공여 개체의 스트레스도 증가했습니다.`,
      "good",
    );
  }
  n.facility = cap(n.facility - 8);
  n.infection = cap(n.infection + 6);
  n.eve = cap(n.eve - 5);
  return summary(
    n,
    "세포·기억 합성 실패",
    `합성 배양이 불안정해 중단됐습니다. ${donorA.name}와 ${donorB.name}의 스트레스가 높아지고 시설 오염이 증가했습니다.`,
    "bad",
  );
}
