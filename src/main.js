import * as THREE from "three";
import "./styles.css";

const regions = [
  {
    name: "Northern",
    short: "N",
    color: 0x54a6ff,
    x: -0.55,
    z: -1.22,
    capacity: 118420,
    generation: 850,
    transmission: 184210,
    transform: 612300,
    mix: { Thermal: 44500, Hydro: 20520, Nuclear: 1620, RES: 51780 },
  },
  {
    name: "Western",
    short: "W",
    color: 0xffba4a,
    x: -1.18,
    z: 0.05,
    capacity: 151260,
    generation: 1010,
    transmission: 231500,
    transform: 734800,
    mix: { Thermal: 69300, Hydro: 8660, Nuclear: 3200, RES: 70100 },
  },
  {
    name: "Southern",
    short: "S",
    color: 0x5ee3a1,
    x: -0.25,
    z: 1.26,
    capacity: 136740,
    generation: 914,
    transmission: 205430,
    transform: 681200,
    mix: { Thermal: 48600, Hydro: 14620, Nuclear: 4120, RES: 69400 },
  },
  {
    name: "Eastern",
    short: "E",
    color: 0xff6b6b,
    x: 0.95,
    z: -0.05,
    capacity: 77720,
    generation: 538,
    transmission: 126900,
    transform: 389600,
    mix: { Thermal: 57980, Hydro: 7280, Nuclear: 0, RES: 12460 },
  },
  {
    name: "North Eastern",
    short: "NE",
    color: 0xb783ff,
    x: 1.42,
    z: -0.95,
    capacity: 12140,
    generation: 74,
    transmission: 36580,
    transform: 93400,
    mix: { Thermal: 2090, Hydro: 4870, Nuclear: 0, RES: 5180 },
  },
];

const history = [
  { year: "2010", value: 173626 },
  { year: "2013", value: 223343 },
  { year: "2016", value: 302833 },
  { year: "2019", value: 356100 },
  { year: "2022", value: 399497 },
  { year: "2026", value: 496280 },
];

const energyColors = {
  Thermal: "#ff8a54",
  Hydro: "#4db6ff",
  Nuclear: "#d7cc59",
  RES: "#56d88f",
};

const total = (items, key) => items.reduce((sum, item) => sum + item[key], 0);
const sumMix = (items) =>
  items.reduce((acc, item) => {
    Object.entries(item.mix).forEach(([key, value]) => {
      acc[key] = (acc[key] || 0) + value;
    });
    return acc;
  }, {});

const sample = {
  capacity: total(regions, "capacity"),
  generation: total(regions, "generation"),
  transmission: total(regions, "transmission"),
  transform: total(regions, "transform"),
};

const canvas = document.querySelector("#power-scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x081926, 6, 13);

const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
camera.position.set(0, 4.2, 6.2);
camera.lookAt(0, 0, 0);

const group = new THREE.Group();
group.rotation.x = -0.16;
scene.add(group);

const ambient = new THREE.HemisphereLight(0xcfefff, 0x07111d, 2.4);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 2.8);
sun.position.set(-2.8, 5, 3.5);
sun.castShadow = true;
scene.add(sun);

const fill = new THREE.PointLight(0x4ac8ff, 30, 9);
fill.position.set(2.4, 1.5, 2.2);
scene.add(fill);

const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x15374b,
  metalness: 0.18,
  roughness: 0.48,
});
const gridMaterial = new THREE.MeshStandardMaterial({
  color: 0x0b2534,
  metalness: 0.15,
  roughness: 0.6,
});

const platform = new THREE.Mesh(
  new THREE.CylinderGeometry(2.9, 3.15, 0.16, 96),
  baseMaterial,
);
platform.position.y = -0.16;
platform.receiveShadow = true;
group.add(platform);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(3.04, 0.018, 8, 160),
  new THREE.MeshBasicMaterial({ color: 0x5dd5ff, transparent: true, opacity: 0.48 }),
);
ring.rotation.x = Math.PI / 2;
ring.position.y = -0.05;
group.add(ring);

const bars = [];
const rayTargets = [];
const labelSprites = [];

function makeLabel(text, color) {
  const size = 256;
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = size;
  labelCanvas.height = size / 2;
  const ctx = labelCanvas.getContext("2d");
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = "rgba(4, 19, 30, 0.72)";
  ctx.roundRect(12, 16, 232, 92, 18);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 42px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 62);
  const texture = new THREE.CanvasTexture(labelCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(0.62, 0.31, 1);
  return sprite;
}

function inIndiaSilhouette(x, z) {
  const y = z;
  const west = -0.65 - 0.32 * Math.cos((y + 0.2) * 2.2) - (y > 0.8 ? 0.28 : 0);
  const east = 0.75 + 0.24 * Math.sin((y + 1.4) * 1.8) + (y < -0.65 ? 0.5 : 0);
  const taper = Math.max(0, Math.abs(y) - 0.2) * 0.12;
  return x > west + taper && x < east - taper && y > -1.55 && y < 1.55;
}

for (let z = -1.55; z <= 1.55; z += 0.18) {
  for (let x = -1.65; x <= 1.65; x += 0.18) {
    const offsetX = x + (Math.round((z + 1.55) / 0.18) % 2) * 0.09;
    if (!inIndiaSilhouette(offsetX, z)) continue;
    const height = 0.025 + Math.random() * 0.035;
    const cell = new THREE.Mesh(new THREE.BoxGeometry(0.13, height, 0.13), gridMaterial.clone());
    cell.position.set(offsetX, height / 2, z);
    cell.receiveShadow = true;
    group.add(cell);
  }
}

regions.forEach((region) => {
  const height = 0.42 + region.capacity / 115000;
  const material = new THREE.MeshStandardMaterial({
    color: region.color,
    emissive: region.color,
    emissiveIntensity: 0.16,
    metalness: 0.28,
    roughness: 0.34,
  });
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, height, 8), material);
  bar.position.set(region.x, height / 2 + 0.04, region.z);
  bar.castShadow = true;
  bar.userData.region = region;
  group.add(bar);
  bars.push(bar);
  rayTargets.push(bar);

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 16),
    new THREE.MeshStandardMaterial({
      color: region.color,
      emissive: region.color,
      emissiveIntensity: 0.38,
      roughness: 0.28,
    }),
  );
  cap.position.set(region.x, height + 0.14, region.z);
  cap.userData.region = region;
  group.add(cap);
  rayTargets.push(cap);

  const label = makeLabel(region.short, `#${region.color.toString(16).padStart(6, "0")}`);
  label.position.set(region.x, height + 0.55, region.z);
  label.userData.region = region;
  group.add(label);
  labelSprites.push(label);
});

function makeArc(start, end, color) {
  const mid = start.clone().lerp(end, 0.5);
  mid.y += 0.85 + start.distanceTo(end) * 0.25;
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  const points = curve.getPoints(56);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.52 }),
  );
}

const hub = new THREE.Vector3(0.1, 0.42, -0.05);
regions.forEach((region) => {
  const point = new THREE.Vector3(region.x, 0.5, region.z);
  group.add(makeArc(hub, point, region.color));
});

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let hovered = null;
let selected = "all";

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function animateValue(el, target, suffix = "") {
  const start = Number(el.dataset.value || 0);
  const duration = 520;
  const begin = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - begin) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = Math.round(start + (target - start) * eased);
    el.textContent = `${formatNumber(value)}${suffix}`;
    el.dataset.value = String(value);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function dataForSelection() {
  if (selected === "all") return { label: "National Load View", regions, mix: sumMix(regions), ...sample };
  const region = regions.find((item) => item.name === selected);
  return { label: `${region.name} Regional View`, regions: [region], mix: region.mix, ...region };
}

function renderEnergy(mix) {
  const container = document.querySelector("#energy-list");
  const max = Math.max(...Object.values(mix));
  container.innerHTML = "";
  Object.entries(mix).forEach(([name, value]) => {
    const row = document.createElement("article");
    row.className = "energy-row";
    row.innerHTML = `
      <div>
        <span class="swatch" style="background:${energyColors[name]}"></span>
        <strong>${name}</strong>
      </div>
      <b>${formatNumber(value)} MW</b>
      <span class="track"><i style="width:${Math.max(8, (value / max) * 100)}%; background:${energyColors[name]}"></i></span>
      <button type="button" aria-label="View ${name} capacity">View</button>
    `;
    container.appendChild(row);
  });
}

function renderHistory() {
  const container = document.querySelector("#history-chart");
  const max = Math.max(...history.map((item) => item.value));
  container.innerHTML = "";
  history.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "history-bar";
    bar.style.height = `${28 + (item.value / max) * 112}px`;
    bar.innerHTML = `<span>${formatNumber(item.value)}</span><b>${item.year}</b>`;
    container.appendChild(bar);
  });
}

function updateDashboard() {
  const data = dataForSelection();
  document.querySelector("#region-title").textContent = data.label;
  animateValue(document.querySelector("#metric-capacity"), data.capacity);
  animateValue(document.querySelector("#metric-generation"), data.generation);
  animateValue(document.querySelector("#metric-transmission"), data.transmission);
  animateValue(document.querySelector("#metric-transform"), data.transform);
  renderEnergy(data.mix);

  bars.forEach((bar) => {
    const active = selected === "all" || bar.userData.region.name === selected;
    bar.material.opacity = active ? 1 : 0.2;
    bar.material.transparent = !active;
    bar.scale.setScalar(active ? 1 : 0.72);
  });
  labelSprites.forEach((label) => {
    label.material.opacity = selected === "all" || label.userData.region.name === selected ? 1 : 0.28;
  });
}

document.querySelectorAll("[data-region]").forEach((button) => {
  button.addEventListener("click", () => {
    selected = button.dataset.region;
    document.querySelectorAll("[data-region]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateDashboard();
  });
});

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
});

canvas.addEventListener("click", () => {
  if (!hovered) return;
  selected = hovered.userData.region.name;
  document.querySelectorAll("[data-region]").forEach((button) => {
    button.classList.toggle("active", button.dataset.region === selected);
  });
  updateDashboard();
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.set(width < 780 ? 0 : -0.2, width < 780 ? 5.2 : 4.2, width < 780 ? 7.4 : 6.2);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
renderHistory();
updateDashboard();

function animate(now) {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(rayTargets, false)[0];
  hovered = hit?.object || null;
  canvas.style.cursor = hovered ? "pointer" : "default";

  group.rotation.y = Math.sin(now * 0.00023) * 0.08;
  ring.rotation.z += 0.002;
  bars.forEach((bar, index) => {
    const pulse = hovered === bar || hovered?.userData.region === bar.userData.region ? 1.08 : 1;
    bar.scale.y = pulse + Math.sin(now * 0.002 + index) * 0.018;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
