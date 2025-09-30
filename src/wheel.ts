type SpinResult = {
  winner: string;
  at: string;
};

const $ = <T extends Element>(sel: string) => document.querySelector(sel) as T;

const yearEl = $("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Spinner implementation
const canvas = $("#wheelCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");
const entriesEl = $("#entries") as HTMLTextAreaElement;
const spinBtn = $("#spinBtn");
const resetBtn = $("#resetBtn");
const errorEl = $("#error") as HTMLParagraphElement;
const historyEl = $("#history") as HTMLUListElement;

let entries: string[] = [];
let isSpinning = false;

function parseEntries(input: string): string[] {
  return input
    .split(/,|\n|\r/) // commas or new lines
    .map(s => s.trim())
    .filter(Boolean);
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pastelFromIndex(i: number): string {
  const hues = [340, 350, 0, 10, 20, 330, 300, 280, 25, 15, 5, 355];
  const h = hues[i % hues.length];
  return `hsl(${h} 80% 80%)`;
}

function drawWheel(items: string[], rotation = 0): void {
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const radius = Math.min(width, height) / 2 - 16;
  const centerX = width / 2;
  const centerY = height / 2;

  const sliceAngle = (Math.PI * 2) / Math.max(items.length, 1);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  items.forEach((label, i) => {
    const start = i * sliceAngle;
    const end = start + sliceAngle;

    // Slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = pastelFromIndex(i);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text
    ctx.save();
    ctx.rotate(start + sliceAngle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#4a2a10";
    ctx.font = "700 16px Fredoka, system-ui";
    ctx.translate(radius - 10, 6);
    const maxChars = 22;
    const text = label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
    ctx.fillText(text, 0, 0);
    ctx.restore();
  });

  // Center hub
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.fillStyle = "#ff86b0";
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();

  ctx.restore();
}

function setError(msg: string | null): void {
  if (!errorEl) return;
  if (msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  } else {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
}

function persistEntries(list: string[]): void {
  try {
    localStorage.setItem("rpb.entries", JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to persist entries", e);
  }
}

function loadEntries(): string[] {
  try {
    const raw = localStorage.getItem("rpb.entries");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to read entries", e);
    return [];
  }
}

function addHistory(result: SpinResult): void {
  if (!historyEl) return;
  const li = document.createElement("li");
  li.textContent = `${result.at}: ${result.winner}`;
  historyEl.prepend(li);
}

function celebrate(): void {
  const conf = document.createElement("canvas");
  conf.className = "confetti";
  conf.width = innerWidth;
  conf.height = innerHeight;
  document.body.appendChild(conf);
  const cctx = conf.getContext("2d");
  if (!cctx) return;
  const dots = Array.from({ length: 160 }, () => ({
    x: Math.random() * innerWidth,
    y: -20 - Math.random() * innerHeight,
    r: 3 + Math.random() * 4,
    s: 2 + Math.random() * 3,
    color: pastelFromIndex(Math.floor(Math.random() * 12))
  }));
  let t = 0;
  const tick = () => {
    t += 1;
    cctx.clearRect(0, 0, conf.width, conf.height);
    dots.forEach(d => {
      d.y += d.s;
      d.x += Math.sin((d.y + t) / 20);
      cctx.fillStyle = d.color;
      cctx.beginPath();
      cctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      cctx.fill();
    });
    if (t < 240) requestAnimationFrame(tick); else conf.remove();
  };
  tick();
}

let currentRotation = 0;
let lastEntryCount = 0;

function spin(): void {
  if (isSpinning) return;
  entries = parseEntries(entriesEl.value);
  entries = shuffleArray(entries);
  if (entries.length < 2) {
    setError("Please enter at least two entries (comma or newline separated).");
    return;
  }
  setError(null);
  persistEntries(entries);

  // Reset rotation for each spin to ensure consistent behavior
  currentRotation = 0;
  lastEntryCount = entries.length;

  isSpinning = true;
  const slice = (Math.PI * 2) / entries.length;
  const targetIndex = Math.floor(Math.random() * entries.length);
  const targetAngle = slice * targetIndex + slice / 2; // center of slice
  const spins = 6 + Math.floor(Math.random() * 4); // full rotations
  const finalRotation = spins * Math.PI * 2 - targetAngle;

  const durationMs = 4200;
  const start = performance.now();
  const startRot = 0;

  const animate = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const easeOut = 1 - Math.pow(1 - t, 3);
    currentRotation = startRot + easeOut * (finalRotation - startRot);
    drawWheel(entries, currentRotation);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      const winner = entries[targetIndex];
      const result: SpinResult = { winner, at: new Date().toLocaleString() };
      addHistory(result);
      celebrate();
      console.info("Spin result", result);
      isSpinning = false;
    }
  };
  requestAnimationFrame(animate);
}

function resetWheel(): void {
  currentRotation = 0;
  const parsed = parseEntries(entriesEl.value);
  lastEntryCount = parsed.length;
  drawWheel(parsed, currentRotation);
}

function init(): void {
  const saved = loadEntries();
  if (saved.length) entriesEl.value = saved.join(", ");
  drawWheel(parseEntries(entriesEl.value));
  spinBtn?.addEventListener("click", () => {
    try { spin(); } catch (e) { console.error("Spin failed", e); setError("Unexpected error while spinning."); isSpinning = false; }
  });
  resetBtn?.addEventListener("click", () => {
    try { resetWheel(); } catch (e) { console.error("Reset failed", e); }
  });
  entriesEl.addEventListener("input", () => {
    const parsed = parseEntries(entriesEl.value);
    // Reset rotation if entry count changes during input
    if (parsed.length !== lastEntryCount && !isSpinning) {
      currentRotation = 0;
      lastEntryCount = parsed.length;
    }
    drawWheel(parsed, currentRotation);
  });
}

init();
