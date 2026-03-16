// =====================================================
//  플로우잉 — AI 브랜드 빌더 v2
//  캐릭터: ChaChа (플로우잉 마스코트)
//  의존성: npm install framer-motion
// =====================================================

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────
const MOODS = [
  { id: "bright", label: "Bright", sub: "밝고 깔끔", from: "#38BDF8", to: "#E0F2FE" },
  { id: "red", label: "Red", sub: "강렬·패셔너블", from: "#991B1B", to: "#FF244B" },
  { id: "cool", label: "Cool", sub: "차분·미래적", from: "#1D4ED8", to: "#7DD3FC" },
  { id: "warm", label: "Warm", sub: "따뜻·라이프", from: "#C2410C", to: "#FED7AA" },
  { id: "dark", label: "Moody", sub: "도도·시크", from: "#0F172A", to: "#475569" },
  { id: "dream", label: "Dream", sub: "몽환·부드러움", from: "#6D28D9", to: "#E9D5FF" },
  { id: "earth", label: "Earth", sub: "자연·유기적", from: "#3D2B1F", to: "#A8764E" },
  { id: "neon", label: "Neon", sub: "에너지·대담함", from: "#0D0D0D", to: "#39FF14" },
];

const PALETTE = [
  "#7B6EA6", "#C9B8E8", "#F2A07B", "#8DB87A", "#E8D5B7", "#A07855", "#C8A882",
  "#F5E642", "#ECEF8B", "#B8CC8A", "#4CAF50", "#D4A574",
  "#7F1D1D", "#991B1B", "#DC2626", "#EF4444", "#FF244B", "#FB7185", "#FDA4AF",
  "#C2410C", "#EA580C", "#F97316", "#FB923C", "#FDBA74", "#FED7AA",
  "#CA8A04", "#EAB308", "#FDE047", "#FEF08A",
  "#14532D", "#16A34A", "#22C55E", "#4ADE80", "#10B981", "#065F46",
  "#0D9488", "#14B8A6", "#2DD4BF", "#99F6E4",
  "#1E3A8A", "#1D4ED8", "#3B82F6", "#60A5FA", "#93C5FD", "#0EA5E9", "#7DD3FC",
  "#312E81", "#6D28D9", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD",
  "#BE185D", "#EC4899", "#F472B6", "#FBCFE8",
  "#0F172A", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1", "#F1F5F9",
  "#39FF14", "#FF00FF", "#00FFFF", "#FF6B35", "#FFFF00",
  "#D97706", "#F59E0B", "#FBBF24", "#FCD34D",
];

// 2026 트렌드 배지
const TREND_COLORS = ["#7B6EA6", "#F2A07B", "#C9B8E8", "#8DB87A"];

// 색상별 보색/유사색 팔레트 추천 (Pinterest 섹션용)
function getColorPalette(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  const hDeg = h * 360;
  // hsl → hex 변환
  const hsl2hex = (hh, ss, ll) => {
    const hk = hh / 360; const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss; const p = 2 * ll - q;
    const hue2rgb = (p2, q2, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p2 + (q2 - p2) * 6 * t; if (t < 1 / 2) return q2; if (t < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t) * 6; return p2; };
    const rr = Math.round(hue2rgb(p, q, hk + 1 / 3) * 255);
    const gg = Math.round(hue2rgb(p, q, hk) * 255);
    const bb = Math.round(hue2rgb(p, q, hk - 1 / 3) * 255);
    return '#' + [rr, gg, bb].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  // 유사색 2개 + 보색 + 명도 변형 2개 = 총 6개
  return [
    hex,
    hsl2hex((hDeg + 30) % 360, Math.min(s + 0.1, 1), Math.min(l + 0.1, 0.9)),
    hsl2hex((hDeg + 60) % 360, s, l),
    hsl2hex((hDeg + 180) % 360, s, l),                 // 보색
    hsl2hex(hDeg, s, Math.max(l - 0.2, 0.1)),          // 어두운 버전
    hsl2hex(hDeg, Math.max(s - 0.2, 0), Math.min(l + 0.25, 0.95)), // 밝은 버전
  ];
}

// AI 추천 키워드 브랜드명 40개
const BRAND_KEYWORDS = [
  "플로우잉", "Fluent", "Float", "Fluxe", "Flo Studio",
  // 감성 스타트업
  "Aven", "Lunera", "Solenne", "Aureline", "Serein",
  "Velour", "Brume", "Eclair", "Ivoire", "Opaline",
  // 주니어 디자이너 감성
  "Pétale", "Mirelle", "Celeste", "Avelune", "Quintis",
  "Noire Lab", "Rêverie", "Marelle", "Ambroise", "Florent",
  // 취준생/브랜드 느낌
  "Lumis", "Veloura", "Roselle", "Elnor", "Brume Co.",
  "Eclair Lab", "Serein Co.", "Aven Atelier", "Solenne Lab", "Aureline Studio",
  // 트렌디
  "Studio F", "F.Lab", "Fuse", "Fade", "Frame Co.",
];

const SLOGANS = {
  bright: ["밝은 인상으로 오래 남는 브랜드.", "가볍지만 또렷한 브랜드의 시작.", "더 선명하게, 더 아름답게."],
  red: ["강한 인상을 우아하게 남기다.", "시선을 사로잡는 존재감.", "한 번 보면 기억되는 브랜드."],
  cool: ["차분함 안에 선명한 감각.", "정제된 무드의 기준.", "깔끔하고 미래적인 브랜드."],
  warm: ["따뜻한 무드로 오래 남는 이름.", "부드럽고 감각적인 시작.", "편안하지만 세련된 결."],
  dark: ["조용하지만 강한 브랜드 무드.", "시크한 존재감을 담다.", "어둠 속의 선명한 매력."],
  dream: ["몽환적인 감각으로 흐르는 브랜드.", "부드럽고 신비로운 인상.", "가볍게 떠오르지만 오래 남아."],
  earth: ["자연에서 온 브랜드의 감각.", "땅처럼 단단하고 따뜻한 무드.", "유기적이고 진정성 있는 이름."],
  neon: ["규칙을 깨는 브랜드의 에너지.", "어둠 속에서 빛나는 존재감.", "대담하게, 선명하게."],
};

const QUESTIONS = [
  { q: "브랜드를 한 문장으로 설명하면?", ph: "예: 감각적인 여성 뷰티 브랜드" },
  { q: "어떤 분위기를 전달하고 싶어?", ph: "예: 따뜻하고 고급스러운 느낌" },
  { q: "기억되고 싶은 핵심 키워드는?", ph: "예: 자연, 지속가능, 미니멀" },
];

const CHACHA_CHEER = {
  0: ["좋아! 브랜드 스토리가 시작되는 순간이야.", "그 문장 하나가 모든 걸 결정할 수 있어!", "짧아도 괜찮아 — 핵심만 담아봐.", "이 답변이 나중에 슬로건이 될 수도 있어!"],
  1: ["분위기가 잡히면 컬러가 자연스럽게 따라와.", "솔직하게 쓸수록 더 감각적인 브랜드가 나와.", "이 느낌, 내가 딱 맞는 컬러 찾아줄게.", "'따뜻함'인지 '차가움'인지만 알아도 충분해!"],
  2: ["키워드 하나가 브랜드 DNA가 돼.", "떠오르는 단어 그냥 던져봐 — 내가 정리해줄게.", "이 키워드로 로고 방향이 결정돼. 중요해!", "3개까지 써도 좋아. 내가 골라줄게."],
};

// 색상 선택 시 ChaChа 대화형 멘트
const COLOR_CHAT = [
  "나도 이 색 좋아해! 🎨 너는 어떤 색이 더 끌려?",
  "오, 이 컬러 감각 있는데? 퍼스널 컬러 같아!",
  "이 색이랑 어울리는 색 더 골라봐 — 같이 맞춰볼게!",
  "이 톤이 네 브랜드에 딱일 것 같아. 계속 탐색해봐 👀",
  "너에게 맞는 컬러를 더 골라봐, 퍼스널 컬러 맞춰줄게!",
  "이 색으로 시작하면 브랜드 방향이 보여. 멋진데?",
  "오 이거 2026 트렌드 컬러랑 잘 어울려! 감각적이야 ✨",
];

const MOOD_TIPS = {
  bright: ["이 파란 계열이 네 브랜드에 더 잘 맞을 것 같아!", "밝은 톤은 신뢰감을 줘. 이 컬러 어때?"],
  red: ["레드는 강렬하지만 — 버건디가 더 세련될 수 있어.", "패션 브랜드라면 딥레드가 진짜 좋아."],
  cool: ["차가운 블루 계열이 미래적인 느낌을 만들어줘.", "이 네이비 + 시안 조합 꽤 감각적인데?"],
  warm: ["따뜻한 어스톤이 이 무드랑 딱이야!", "테라코타나 모카 계열 어때? 2026 트렌드야."],
  dark: ["모노크롬에 포인트 하나만. 이 딥슬레이트 어때?", "다크 톤은 골드 포인트랑 진짜 잘 어울려."],
  dream: ["라벤더랑 로즈 계열이 이 무드에 완벽해.", "몽환적인 퍼플 딱 네 색이야!"],
  earth: ["2026 트렌드 어스톤! 지금 이게 핫해.", "유기적 톤은 진정성 있는 브랜드에 딱이야."],
  neon: ["네온 컬러는 다크 배경이랑 써야 진짜 살아나.", "이 전기 그린 — 대담하지만 기억에 남아."],
};

const RESULT_LINES = [
  "이거 괜찮다 👀 진짜로.",
  "너랑 어울릴 것 같아!",
  "너 센스 좋은데?",
  "취준생도, 스타트업도 이 브랜드면 설득력 있어!",
  "주니어 디자이너 포트폴리오에 바로 써도 되겠는데?",
  "이 컬러 조합, 내가 봐도 세련됐어. 잘 골랐어!",
  "브랜드 느낌 제대로 살아났다. 이대로 가봐 🚀",
  "이 조합이면 클라이언트도 고개 끄덕일 듯!",
];

// 로고 12종 — 모두 'F' 이니셜 고정
const LOGO_SHAPES = [
  { id: "Circle", shape: "circle" },
  { id: "Square", shape: "square" },
  { id: "Wave", shape: "wave" },
  { id: "Diamond", shape: "diamond" },
  { id: "Capsule", shape: "capsule" },
  { id: "Frame", shape: "frame" },
  { id: "Octagon", shape: "octagon" },
  { id: "Pill", shape: "pill" },
  { id: "Ring", shape: "ring" },
  { id: "Arch", shape: "arch" },
  { id: "Rect", shape: "rect" },
  { id: "Aura", shape: "aura" },
];

// ─────────────────────────────────────────────────────
//  유틸
// ─────────────────────────────────────────────────────
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────────────
//  사운드
// ─────────────────────────────────────────────────────
function _audioPlay(notes, closeSec = 1.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    notes.forEach(([freq, type, startT, dur, vol = 0.15]) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startT);
      gain.gain.setValueAtTime(vol, ctx.currentTime + startT);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startT + dur);
      osc.start(ctx.currentTime + startT);
      osc.stop(ctx.currentTime + startT + dur + 0.05);
    });
    setTimeout(() => ctx.close(), closeSec * 1000);
  } catch {
    // ignore audio context errors (e.g., autoplay restrictions)
  }
}
function playColorSound(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let hue = 0; const d = max - min;
  if (d > 0) { if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60; else if (max === g) hue = ((b - r) / d + 2) * 60; else hue = ((r - g) / d + 4) * 60; }
  const l = (max + min) / 2;
  const freq = 300 + (hue / 360) * 500, bright = 0.7 + l * 0.6;
  _audioPlay([[freq, "sine", 0, 0.09, 0.13 * bright], [freq * 1.25, "sine", 0.07, 0.12, 0.09 * bright]], 0.5);
}
function playMoodSound(id) {
  const map = { bright: [[880, "sine", 0, 0.1, 0.13], [1100, "sine", 0.08, 0.13, 0.11], [1320, "sine", 0.16, 0.16, 0.10]], red: [[220, "sawtooth", 0, 0.12, 0.11], [196, "sawtooth", 0.1, 0.18, 0.09]], cool: [[528, "sine", 0, 0.15, 0.11], [660, "sine", 0.12, 0.15, 0.09], [792, "sine", 0.24, 0.2, 0.08]], warm: [[440, "sine", 0, 0.13, 0.12], [550, "sine", 0.1, 0.16, 0.10]], dark: [[110, "sine", 0, 0.25, 0.12], [138, "sine", 0.15, 0.3, 0.08]], dream: [[659, "sine", 0, 0.12, 0.10], [784, "sine", 0.1, 0.14, 0.09], [988, "sine", 0.2, 0.18, 0.08]], earth: [[330, "triangle", 0, 0.15, 0.12], [262, "triangle", 0.12, 0.2, 0.09]], neon: [[880, "square", 0, 0.07, 0.10], [1320, "square", 0.06, 0.07, 0.09], [1760, "square", 0.12, 0.1, 0.10]] };
  const n = map[id]; if (n) _audioPlay(n, 0.8);
}
function playFanfare() {
  _audioPlay([[392, "square", 0, 0.10, 0.12], [523, "square", 0.10, 0.10, 0.12], [659, "square", 0.20, 0.10, 0.12], [784, "square", 0.30, 0.10, 0.12], [1047, "sine", 0.40, 0.35, 0.14], [784, "sine", 0.42, 0.30, 0.07]], 2);
}

// ─────────────────────────────────────────────────────
//  공통 스타일
// ─────────────────────────────────────────────────────
const S = {
  card: { background: "white", borderRadius: 20, padding: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  inp: { width: "100%", borderRadius: 10, border: "1.5px solid #e5e7eb", padding: "9px 12px", fontSize: 13, background: "#fafafa", color: "#111", boxSizing: "border-box" },
  ta: { width: "100%", borderRadius: 12, border: "1.5px solid #e5e7eb", padding: "12px 14px", fontSize: 14, minHeight: 120, background: "#fafafa", color: "#111", resize: "vertical", boxSizing: "border-box" },
  btnP: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "11px 16px", marginTop: 10, background: "#0F172A", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer" },
  btnS: { padding: "7px 14px", background: "white", border: "1.5px solid #e5e7eb", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#374151" },
};
function Lbl({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", color: "#9ca3af", textTransform: "uppercase", marginBottom: 5 }}>{children}</div>;
}

// ─────────────────────────────────────────────────────
//  CHACHA SVG 캐릭터
//  콘셉트: 작은 노트북 들고 다니는 주니어 디자이너 고양이
//  — 둥근 얼굴, 큰 눈, 옆구리에 색상 팔레트 패치
//  — 무드에 따라 넥타이/귀 색상 변함
// ─────────────────────────────────────────────────────
function ChaChа({ mood, state: st = "idle", size = 120 }) {
  const m = MOODS.find(x => x.id === mood) || MOODS[0];
  const accent = m.from === "0F172A" ? m.to : m.from;

  const anims = {
    idle: { y: [0, -6, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
    thinking: { rotate: [-4, 4, -4], transition: { duration: 1.3, repeat: Infinity } },
    success: { scale: [1, 1.08, 1, 1.04, 1], transition: { duration: 0.85, repeat: Infinity } },
    sparkle: { y: [0, -8, 0], rotate: [0, -3, 3, 0], transition: { duration: 1.5, repeat: Infinity } },
    wave: { rotate: [0, 5, -5, 5, 0], transition: { duration: 1.8, repeat: Infinity } },
  };

  const isThink = st === "thinking";
  const isSuccess = st === "success";
  const isHappy = st === "success" || st === "sparkle" || st === "wave";
  const gid = `cc-${mood}-${st}`;

  return (
    <motion.div animate={anims[st] || anims.idle}
      style={{ display: "inline-block", filter: "drop-shadow(0 8px 22px rgba(0,0,0,0.18))" }}>
      <svg width={size} height={size} viewBox="0 0 160 170">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={m.from} />
            <stop offset="100%" stopColor={m.to} />
          </linearGradient>
        </defs>

        {/* 그림자 */}
        <ellipse cx="80" cy="162" rx="38" ry="7" fill="rgba(0,0,0,0.11)" />

        {/* ── 몸통 (둥근 후드티 느낌) ── */}
        <ellipse cx="80" cy="112" rx="40" ry="38" fill="#F5F0EA" />
        {/* 후드티 무드 컬러 */}
        <ellipse cx="80" cy="118" rx="40" ry="32" fill={`url(#${gid})`} opacity="0.18" />
        {/* 포켓 */}
        <rect x="62" y="120" width="36" height="22" rx="8" fill="white" opacity="0.5" />
        {/* 포켓 색상 팔레트 점 (주니어 디자이너) */}
        {["#FF244B", "#F5E642", "#39FF14", "#0EA5E9", "#A78BFA"].map((c, i) => (
          <circle key={i} cx={68 + i * 6} cy="132" r="2.2" fill={c} />
        ))}

        {/* ── 왼팔 ── */}
        <ellipse cx="44" cy="118" rx="10" ry="14" fill="#F0EBE3" transform="rotate(-15 44 118)" />
        {/* ── 오른팔 (wave 상태에서 흔들기) ── */}
        <motion.g
          animate={st === "wave" ? { rotate: [0, 28, 0, 28, 0] } : {}}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ transformOrigin: "116px 105px" }}>
          <ellipse cx="116" cy="118" rx="10" ry="14" fill="#F0EBE3" transform="rotate(15 116 118)" />
          {/* 노트북 들고 있음 */}
          {st === "thinking" && (
            <rect x="106" y="120" width="22" height="16" rx="3" fill="#1E293B" opacity="0.85" />
          )}
        </motion.g>

        {/* ── 다리 ── */}
        <ellipse cx="65" cy="148" rx="11" ry="8" fill="#F0EBE3" />
        <ellipse cx="95" cy="148" rx="11" ry="8" fill="#F0EBE3" />

        {/* ── 머리 ── */}
        <circle cx="80" cy="72" r="34" fill="#F5F0EA" />

        {/* ── 고양이 귀 ── */}
        <polygon points="50,44 42,20 62,38" fill="#F5F0EA" />
        <polygon points="50,44 46,26 60,38" fill={m.from} opacity="0.7" />
        <polygon points="110,44 118,20 98,38" fill="#F5F0EA" />
        <polygon points="110,44 114,26 100,38" fill={m.from} opacity="0.7" />

        {/* ── 뺨 홍조 ── */}
        <ellipse cx="62" cy="82" rx="9" ry="5" fill="#FFBDBD" opacity="0.45" />
        <ellipse cx="98" cy="82" rx="9" ry="5" fill="#FFBDBD" opacity="0.45" />

        {/* ── 눈 ── */}
        {isThink ? (
          <>
            <path d="M64 68 Q70 63 76 68" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M84 68 Q90 63 96 68" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* 생각 말풍선 */}
            <circle cx="100" cy="42" r="5" fill="white" stroke="#ddd" strokeWidth="1" />
            <circle cx="110" cy="32" r="7" fill="white" stroke="#ddd" strokeWidth="1" />
            <text x="107" y="36" fontSize="7" textAnchor="middle" fill="#888">?</text>
          </>
        ) : isSuccess ? (
          <>
            <path d="M64 68 Q70 74 76 68" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M84 68 Q90 74 96 68" stroke="#333" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* 큰 눈 — 취준생 특유의 초롱초롱함 */}
            <circle cx="70" cy="70" r="9" fill="#1a1a1a" />
            <circle cx="90" cy="70" r="9" fill="#1a1a1a" />
            <circle cx="70" cy="70" r="5.5" fill="#3a2a1a" />
            <circle cx="90" cy="70" r="5.5" fill="#3a2a1a" />
            <circle cx="73" cy="67" r="3" fill="white" opacity="0.9" />
            <circle cx="93" cy="67" r="3" fill="white" opacity="0.9" />
            <circle cx="67" cy="73" r="1.2" fill="white" opacity="0.5" />
            <circle cx="87" cy="73" r="1.2" fill="white" opacity="0.5" />
          </>
        )}

        {/* ── 코 ── */}
        <ellipse cx="80" cy="79" rx="4" ry="3" fill="#E8A0A0" />

        {/* ── 입 ── */}
        {isHappy
          ? <path d="M72 85 Q80 93 88 85" stroke="#c87070" strokeWidth="2" strokeLinecap="round" fill="none" />
          : <path d="M74 85 Q80 90 86 85" stroke="#c87070" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        }

        {/* ── 넥타이 / 스카프 (무드 컬러 포인트) ── */}
        <path d="M76 97 L80 88 L84 97 L80 110 Z" fill={accent} opacity="0.85" />
        <ellipse cx="80" cy="97" rx="5" ry="3.5" fill={accent} />

        {/* ── 상태별 액세서리 ── */}
        {st === "sparkle" && (<><text x="108" y="36" fontSize="18">✨</text><text x="24" y="44" fontSize="14">⭐</text></>)}
        {st === "success" && <text x="108" y="34" fontSize="18">🎉</text>}
        {st === "wave" && <text x="116" y="62" fontSize="16">👋</text>}

        {/* ── 노트북 (idle/sparkle 상태에선 옆구리에) ── */}
        {(st === "idle" || st === "sparkle") && (
          <>
            <rect x="104" y="122" width="22" height="16" rx="3" fill="#1E293B" opacity="0.75" />
            <rect x="105" y="123" width="20" height="10" rx="2" fill="#38BDF8" opacity="0.3" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
//  말풍선
// ─────────────────────────────────────────────────────
function SpeechBubble({ text, color = "#6D28D9" }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{ position: "relative", background: color, color: "white", borderRadius: 18, padding: "12px 18px", fontSize: 13, fontWeight: 700, lineHeight: 1.55, maxWidth: 250, whiteSpace: "pre-line", textAlign: "center" }}>
      {text}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -10, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `10px solid ${color}` }} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
//  온보딩
// ─────────────────────────────────────────────────────
function OnboardingScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const bubbles = [
    "안녕! 나는 ChaChа야 🐱\n플로우잉 브랜드 디렉터야!",
    "취준생이든, 스타트업이든\n딱 맞는 브랜드 만들어줄게.",
    "준비됐어? 같이 시작해보자! 🚀",
  ];
  const stars = useMemo(() => Array.from({ length: 32 }, (_, i) => ({ left: `${(i * 37 + 13) % 100}%`, top: `${(i * 61 + 7) % 100}%`, size: i % 3 === 0 ? 3 : 2, dur: 2 + (i % 3), delay: (i % 4) * 0.8 })), []);

  useEffect(() => {
    if (step < 2) { const t = setTimeout(() => setStep(s => s + 1), 2300); return () => clearTimeout(t); }
  }, [step]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#312E81 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, padding: 32, position: "relative", overflow: "hidden" }}>
      {stars.map((s, i) => (
        <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          style={{ position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size, borderRadius: "50%", background: "white", pointerEvents: "none" }} />
      ))}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: "white", letterSpacing: "-0.02em" }}>플로우잉</div>
      </motion.div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div key={step}><SpeechBubble text={bubbles[step]} color="#6D28D9" /></motion.div>
        </AnimatePresence>
        <ChaChа mood="dream" state={step === 2 ? "wave" : "idle"} size={155} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40, padding: "7px 18px", color: "white", fontSize: 12, fontWeight: 700 }}>
          ChaChа · 브랜드 디렉터
        </motion.div>
      </div>
      <AnimatePresence>
        {step >= 2 && (
          <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={onStart}
            style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3)", color: "white", border: "none", borderRadius: 14, padding: "14px 44px", fontSize: 15, fontWeight: 800, cursor: "pointer", zIndex: 1 }}>
            브랜드 만들기 시작 →
          </motion.button>
        )}
      </AnimatePresence>
      <button onClick={onStart} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", zIndex: 1 }}>건너뛰기</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  로고 SVG (항상 "F" 이니셜)
// ─────────────────────────────────────────────────────
function LogoSVG({ shape, color, uid }) {
  const gid = `lg-${uid}`;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      {shape === "square" && <rect x="3" y="3" width="46" height="46" rx="13" fill={`url(#${gid})`} />}
      {shape === "capsule" && <rect x="2" y="16" width="48" height="20" rx="10" fill={`url(#${gid})`} />}
      {shape === "wave" && <path d="M5 18C12 7 22 7 28 18C34 29 44 29 48 18V38C40 48 30 48 24 38C18 28 12 28 5 38Z" fill={`url(#${gid})`} />}
      {shape === "circle" && <circle cx="26" cy="26" r="22" fill={`url(#${gid})`} />}
      {shape === "frame" && <rect x="4" y="4" width="44" height="44" rx="10" fill="none" stroke={`url(#${gid})`} strokeWidth="5" />}
      {shape === "pill" && <rect x="2" y="14" width="48" height="24" rx="12" fill={`url(#${gid})`} />}
      {shape === "diamond" && <polygon points="26,2 50,26 26,50 2,26" fill={`url(#${gid})`} />}
      {shape === "octagon" && <polygon points="16,3 36,3 49,16 49,36 36,49 16,49 3,36 3,16" fill={`url(#${gid})`} />}
      {shape === "rect" && <rect x="3" y="10" width="46" height="32" rx="5" fill={`url(#${gid})`} />}
      {shape === "ring" && <><circle cx="26" cy="26" r="22" fill={`url(#${gid})`} /><circle cx="26" cy="26" r="13" fill="white" /></>}
      {shape === "arch" && <path d="M4 42 Q4 5 26 5 Q48 5 48 42 Z" fill={`url(#${gid})`} />}
      {shape === "aura" && <><circle cx="26" cy="26" r="22" fill={color} opacity="0.18" /><circle cx="26" cy="26" r="16" fill={color} opacity="0.35" /><circle cx="26" cy="26" r="10" fill={`url(#${gid})`} /></>}
      <text x="26" y="30" textAnchor="middle" dominantBaseline="central"
        fontSize={shape === "aura" ? "9" : shape === "ring" ? "10" : "13"}
        fontWeight="900" fill={shape === "frame" ? color : "white"} fontFamily="Georgia,serif">
        F
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────
//  컬러 팔레트 보드 (고른 색 기반으로 자동 생성)
// ─────────────────────────────────────────────────────
function ColorPaletteBoard({ color }) {
  const palette = useMemo(() => getColorPalette(color), [color]);

  return (
    <div>
      {/* 메인 팔레트 스트립 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {palette.map((c, i) => (
          <div key={i} style={{ flex: 1, height: 56, borderRadius: 10, background: c, position: "relative" }}>
            {i === 0 && <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", fontSize: 8, color: "white", fontWeight: 800, opacity: 0.9, letterSpacing: "0.05em", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>MAIN</div>}
          </div>
        ))}
      </div>
      {/* 무드 기반 조합 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, height: 140 }}>
        <div style={{ background: `linear-gradient(160deg,${palette[0]},${palette[4]})`, borderRadius: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ background: palette[1], borderRadius: 10, flex: 1 }} />
          <div style={{ background: palette[3], borderRadius: 10, flex: 1 }} />
        </div>
        <div style={{ background: `linear-gradient(135deg,${palette[2]},${palette[5]})`, borderRadius: 14 }} />
      </div>
      {/* 색상 헥스 표시 */}
      <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
        {palette.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#f9fafb", borderRadius: 8, padding: "3px 8px" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: c, border: "1px solid #e5e7eb" }} />
            <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace" }}>{c.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  사이드 패널
// ─────────────────────────────────────────────────────
function SidePanel({ mood, setMood, color, setColor, name, setName, keyword, setKeyword, onStart, lastColorChat }) {
  const tip = useMemo(() => pick(MOOD_TIPS[mood] || MOOD_TIPS.bright), [mood]);
  const displayMsg = lastColorChat || tip;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ChaChа 미니 + 말풍선 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ChaChа mood={mood} state="sparkle" size={54} />
        <AnimatePresence mode="wait">
          <motion.div key={displayMsg} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            style={{ background: "#0F172A", color: "white", borderRadius: "12px 12px 12px 3px", padding: "9px 12px", fontSize: 11, fontWeight: 600, lineHeight: 1.5, flex: 1 }}>
            {displayMsg}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 무드 */}
      <div>
        <Lbl>추천 무드</Lbl>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
          {MOODS.map(m => (
            <button key={m.id} onClick={() => { setMood(m.id); playMoodSound(m.id); }}
              style={{ border: `2px solid ${mood === m.id ? "#111" : "transparent"}`, borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "none", padding: 0, transition: "all 0.15s", transform: mood === m.id ? "scale(1.03)" : "scale(1)" }}>
              <div style={{ height: 34, background: `linear-gradient(135deg,${m.from},${m.to})` }} />
              <div style={{ padding: "4px 7px", background: "#fff", textAlign: "left" }}>
                <div style={{ fontSize: 10, fontWeight: 800 }}>{m.label}</div>
                <div style={{ fontSize: 9, color: "#888" }}>{m.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 컬러 팔레트 */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Lbl>추천 색상</Lbl>
          <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace" }}>{color}</span>
        </div>
        {/* 2026 트렌드 배지 */}
        <div style={{ display: "flex", gap: 5, marginBottom: 7, alignItems: "center" }}>
          {TREND_COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); playColorSound(c); }} aria-label={`트렌드 ${c}`}
              style={{ width: 20, height: 20, borderRadius: 5, background: c, border: color === c ? "2.5px solid #111" : "1.5px solid transparent", cursor: "pointer" }} />
          ))}
          <span style={{ fontSize: 9, color: "#6D28D9", fontWeight: 800 }}>2026 트렌드</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: 3 }}>
          {PALETTE.map(c => (
            <button key={c} aria-label={`컬러 ${c}`}
              onClick={() => { setColor(c); playColorSound(c); }}
              style={{ aspectRatio: "1", borderRadius: 5, background: c, border: color === c ? "2.5px solid #111" : "1.5px solid transparent", cursor: "pointer", transition: "transform 0.1s", transform: color === c ? "scale(1.3)" : "scale(1)", outline: "none" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <div style={{ width: 28, height: 16, borderRadius: 4, background: color, border: "1px solid #e5e7eb" }} />
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: `linear-gradient(90deg,${color},#fff)` }} />
        </div>
      </div>

      {/* 입력 */}
      <div>
        <Lbl>브랜드 정보</Lbl>
        <input placeholder="브랜드 이름" value={name} onChange={e => setName(e.target.value)} style={{ ...S.inp, marginTop: 5 }} />
        <input placeholder="핵심 키워드" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ ...S.inp, marginTop: 7 }} />
        <button onClick={onStart} style={S.btnP}>ChaChа에게 질문받기 →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
//  질문 플로우
// ─────────────────────────────────────────────────────
function QuestionFlow({ mood, onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [cheerIdx, setCheerIdx] = useState(0);
  const cheers = CHACHA_CHEER[step] || CHACHA_CHEER[0];
  const cheer = cheers[cheerIdx % cheers.length];
  useEffect(() => { const t = setInterval(() => setCheerIdx(i => i + 1), 4000); return () => clearInterval(t); }, [step]);
  const update = v => { const n = [...answers]; n[step] = v; setAnswers(n); };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ ...S.card, background: "linear-gradient(135deg,#0F172A,#1E1B4B)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <ChaChа mood={mood} state="thinking" size={90} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>ChaChа Coach</div>
            <AnimatePresence mode="wait">
              <motion.div key={cheer} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ fontSize: 14, fontWeight: 800, color: "white", marginTop: 6, lineHeight: 1.5 }}>
                {cheer}
              </motion.div>
            </AnimatePresence>
            <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
              {QUESTIONS.map((_, i) => (
                <div key={i} style={{ height: 3, flex: i === step ? 3 : 1, borderRadius: 2, transition: "all 0.4s", background: i < step ? "#6D28D9" : i === step ? "#A78BFA" : "rgba(255,255,255,0.15)" }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{step + 1} / {QUESTIONS.length}</div>
          </div>
        </div>
      </div>
      <div style={S.card}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "#9ca3af", textTransform: "uppercase" }}>QUESTION {step + 1}</div>
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 10, marginBottom: 14, color: "#0F172A" }}>{QUESTIONS[step].q}</div>
        <textarea value={answers[step]} onChange={e => update(e.target.value)} placeholder={QUESTIONS[step].ph} style={S.ta} />
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} style={{ ...S.btnS, opacity: step === 0 ? 0.35 : 1 }}>← 이전</button>
          {step < QUESTIONS.length - 1
            ? <button onClick={() => setStep(s => s + 1)} style={{ ...S.btnP, marginTop: 0, width: "auto", padding: "10px 20px" }}>다음 →</button>
            : <button onClick={() => { playFanfare(); onDone(answers); }} style={{ ...S.btnP, marginTop: 0, width: "auto", padding: "10px 20px", background: "#6D28D9" }}>결과 보기 ✦</button>
          }
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
//  결과 뷰
// ─────────────────────────────────────────────────────
function ResultView({ mood, color, name, seed }) {
  const slogans = SLOGANS[mood] || SLOGANS.bright;
  const resultLine = useMemo(() => RESULT_LINES[seed % RESULT_LINES.length], [seed]);

  // 키워드 기반 40가지 브랜드명
  const brandNames = useMemo(() => {
    const base = name.trim() || "플로우잉";
    const rest = [...BRAND_KEYWORDS].filter(n => n !== base).sort(() => Math.sin(seed * 7 + 1) - 0.3).slice(0, 39);
    return [base, ...rest];
  }, [name, seed]);

  const downloadPNG = useCallback(() => {
    const cv = document.createElement("canvas"); cv.width = 800; cv.height = 800;
    const ctx = cv.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 800, 800); g.addColorStop(0, color); g.addColorStop(1, "#0F172A");
    ctx.fillStyle = g; ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(0, 0, 800, 800, 80); else ctx.rect(0, 0, 800, 800); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.beginPath(); ctx.arc(400, 400, 350, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "white"; ctx.textAlign = "center"; ctx.font = "bold 260px Georgia,serif"; ctx.fillText("F", 400, 500);
    const a = document.createElement("a"); a.download = `${name || "flowing"}_logo.png`; a.href = cv.toDataURL(); a.click();
    cv.width = 0; cv.height = 0;
  }, [color, name]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ChaChа 한마디 */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 14 }}>
        <ChaChа mood={mood} state="success" size={74} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#9ca3af", textTransform: "uppercase", fontWeight: 700 }}>ChaChа 한마디</div>
          <AnimatePresence mode="wait">
            <motion.div key={resultLine} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 4, lineHeight: 1.5 }}>
              {resultLine}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 히어로 프리뷰 */}
      <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }}
        style={{ borderRadius: 22, padding: "32px 24px", background: `linear-gradient(135deg,${color} 0%,#0F172A 100%)`, textAlign: "center", color: "white" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", opacity: 0.55, textTransform: "uppercase" }}>AI Brand Preview</div>
        <div style={{ fontSize: 38, fontWeight: 900, marginTop: 6 }}>{brandNames[0]}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 7 }}>{slogans[0]}</div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <LogoSVG shape="circle" color={color} uid="hero" />
        </div>
      </motion.div>

      {/* 컬러 팔레트 보드 (고른 색 기반 자동 추천) */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>컬러 팔레트 추천</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>선택한 색 기반으로 자동 생성</div>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: 8, background: color, border: "1px solid #e5e7eb" }} />
        </div>
        <ColorPaletteBoard color={color} />
      </div>

      {/* AI 추천 키워드 브랜드명 40가지 */}
      <div style={S.card}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>AI가 추천하는 키워드 브랜드명</div>
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{brandNames.length}가지 · 새로고침으로 변경</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {brandNames.map((n, i) => (
            <motion.span key={n} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.015 }}
              style={{
                display: "inline-block", padding: "5px 12px", borderRadius: 20, fontSize: 11,
                background: i === 0 ? color : "#f3f4f6",
                color: i === 0 ? "white" : "#374151",
                fontWeight: i === 0 ? 800 : 600,
                border: i === 0 ? "none" : "1px solid #e5e7eb"
              }}>
              {n}
            </motion.span>
          ))}
        </div>
      </div>

      {/* 슬로건 */}
      <div style={S.card}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>브랜드 슬로건</div>
        {slogans.map((s, i) => (
          <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: "#f9fafb", borderRadius: 11, padding: "11px 14px", marginBottom: 7, fontSize: 13, color: "#374151", borderLeft: `3px solid ${color}` }}>
            {s}
          </motion.div>
        ))}
      </div>

      {/* AI 로고 12가지 — 모두 F, 색상 반영 */}
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>AI 로고 12가지</div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>색상 변경 시 실시간 반영</div>
          </div>
          <ChaChа mood={mood} state="sparkle" size={42} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {LOGO_SHAPES.map((ls, i) => (
            <motion.div key={ls.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ borderRadius: 13, border: "1px solid #f0f0f0", padding: "10px 8px", background: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
              <LogoSVG shape={ls.shape} color={color} uid={`${ls.id}-${i}-${seed}`} />
              <div>
                <div style={{ fontSize: 9, color: "#9ca3af" }}>F · 플로우잉</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <button onClick={downloadPNG} style={{ ...S.btnP, fontSize: 14, padding: "14px 20px" }}>↓ 로고 PNG 다운로드</button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────
//  루트 앱
// ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("onboarding");
  const [view, setView] = useState("result");
  const [mood, setMood] = useState("dream");
  const [name, setName] = useState("플로우잉");
  const [color, setColor] = useState("#7B6EA6");
  const [keyword, setKeyword] = useState("");
  const [seed, setSeed] = useState(0);
  const [colorChat, setColorChat] = useState("");
  const chatTimer = useRef(null);

  // 색상 클릭 시 대화형 멘트
  const handleColor = useCallback((c) => {
    setColor(c);
    playColorSound(c);
    setColorChat(pick(COLOR_CHAT));
    clearTimeout(chatTimer.current);
    chatTimer.current = setTimeout(() => setColorChat(""), 4000);
  }, []);

  if (screen === "onboarding") return <OnboardingScreen onStart={() => setScreen("main")} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f1f5f9;font-family:'Nunito',system-ui,sans-serif}
        button{font-family:inherit}
        input,textarea{font-family:inherit}
        input:focus,textarea:focus{outline:2px solid #6D28D9;border-color:transparent!important}
        button:focus-visible{outline:2px solid #6D28D9;outline-offset:2px}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>
      <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "16px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          {/* 헤더 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif" }}>F</span>
              </div>
              <div style={{ fontSize: 17, fontWeight: 900, color: "#0F172A", fontFamily: "Georgia,serif" }}>플로우잉</div>
              <div style={{ fontSize: 9, color: "#9ca3af", letterSpacing: "0.12em", fontWeight: 700 }}>AI BRAND BUILDER</div>
            </div>
          </div>
          <button onClick={() => setSeed(s => s + 1)} style={S.btnS}>↻ 새로고침</button>
        </div>

        {/* 그리드 */}
        <div style={{ display: "grid", gridTemplateColumns: "268px 1fr", gap: 16, alignItems: "start" }}>
          <div style={{ ...S.card, position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
            <SidePanel
              mood={mood} setMood={setMood}
              color={color} setColor={handleColor}
              name={name} setName={setName}
              keyword={keyword} setKeyword={setKeyword}
              onStart={() => setView("questions")}
              lastColorChat={colorChat}
            />
          </div>
          <AnimatePresence mode="wait">
            {view === "questions"
              ? <motion.div key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <QuestionFlow mood={mood} onDone={ans => { setKeyword(ans[2] || keyword); setView("result"); }} />
              </motion.div>
              : <motion.div key={`r-${seed}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResultView mood={mood} color={color} name={name || "플로우잉"} seed={seed} />
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
