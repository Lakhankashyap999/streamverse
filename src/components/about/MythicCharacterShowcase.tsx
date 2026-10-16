import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

interface XSuitLevel {
  star: number;
  title: string;
  tag: string;
  stones: number;
  fragments: number;
  perk: string;
  desc: string;
}

/**
 * Authentic BGMI / PUBG Mobile X-Laboratory Upgrade Progression Data
 * (Starforge Stones + Star Fragments per star tier from 1-Star to 7-Star Max)
 */
const XSUIT_LEVELS: XSuitLevel[] = [
  {
    star: 1,
    title: 'Basic Appearance',
    tag: 'Base Unlock',
    stones: 0,
    fragments: 0,
    perk: 'Pharaoh Storm Base Armor (300 Silver / Spin)',
    desc: 'Unlocks the base Mythic X-Suit combat armor in the X-Laboratory.',
  },
  {
    star: 2,
    title: 'Team-Up Interaction',
    tag: 'Lobby Synergy',
    stones: 5,
    fragments: 85,
    perk: 'Exclusive Squad Lobby Emote & Voice Lines',
    desc: 'Triggers special lightning salute when joining a squad in the lobby.',
  },
  {
    star: 3,
    title: 'Advanced Form',
    tag: 'Visual Evolution',
    stones: 9,
    fragments: 165,
    perk: 'Golden Winged Pauldrons & Glowing Cyber-Dreads',
    desc: 'Upgrades shoulder dragon-armor and activates glowing blue dreadlock conduits.',
  },
  {
    star: 4,
    title: 'Victory Broadcast',
    tag: 'Kill Feed HUD',
    stones: 14,
    fragments: 265,
    perk: 'Custom Golden Storm Elimination Broadcast',
    desc: 'Displays a mythic golden-blue lightning banner across the match kill feed.',
  },
  {
    star: 5,
    title: 'Shockwave Arrival',
    tag: 'Spawn Island',
    stones: 20,
    fragments: 380,
    perk: 'Spawn Island Thunder Entrance & Parachute Trail',
    desc: 'Casts a high-voltage storm aura on Spawn Island and blue lightning sky-drop trail.',
  },
  {
    star: 6,
    title: 'Final Form',
    tag: 'Mythic Mastery',
    stones: 27,
    fragments: 525,
    perk: 'Full Winged Pharaoh Armor + Reactive Arc Lightning',
    desc: 'Unlocks the complete armored wings, gauntlets, and reactive combat lightning.',
  },
  {
    star: 7,
    title: 'Astral Awakening',
    tag: 'MAX LEVEL 7★',
    stones: 35,
    fragments: 680,
    perk: 'Awakened God-King Aura + Loot Crate & Result Pose',
    desc: 'Maximum X-Laboratory evolution with custom MVP victory statue and mythic loot box.',
  },
];

const TOTAL_STONES = XSUIT_LEVELS.reduce((acc, l) => acc + l.stones, 0); // 110 Starforge Stones
const TOTAL_FRAGMENTS = XSUIT_LEVELS.reduce((acc, l) => acc + l.fragments, 0); // 2,100 Star Fragments

const VERTEX_SHADER = `
  attribute vec3 aPos;
  attribute vec3 aNormal;
  attribute vec2 aUv;
  attribute float aSide;

  uniform mat4 uProj;
  uniform mat4 uView;
  uniform float uYaw;
  uniform float uPitch;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying float vSide;

  void main() {
    float cy = cos(uYaw);
    float sy = sin(uYaw);
    float cp = cos(uPitch);
    float sp = sin(uPitch);

    // Rotate Y (turntable yaw) then Rotate X (pitch tilt)
    vec3 p1 = vec3(aPos.x * cy + aPos.z * sy, aPos.y, -aPos.x * sy + aPos.z * cy);
    vec3 p2 = vec3(p1.x, p1.y * cp - p1.z * sp, p1.y * sp + p1.z * cp);

    vec3 n1 = vec3(aNormal.x * cy + aNormal.z * sy, aNormal.y, -aNormal.x * sy + aNormal.z * cy);
    vec3 n2 = vec3(n1.x, n1.y * cp - n1.z * sp, n1.y * sp + n1.z * cp);

    vWorldPos = p2;
    vNormal = normalize(n2);
    vUv = aUv;
    vSide = aSide;

    gl_Position = uProj * uView * vec4(p2, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying float vSide;

  uniform sampler2D uFrontTex;
  uniform sampler2D uBackTex;
  uniform float uTime;

  void main() {
    // Pedestal geometry (vSide > 1.5)
    if (vSide > 1.5) {
      float r = length(vUv - vec2(0.5));
      float ring1 = smoothstep(0.49, 0.46, r) * smoothstep(0.38, 0.41, r);
      float ring2 = smoothstep(0.34, 0.32, r) * smoothstep(0.26, 0.28, r);
      float core = smoothstep(0.24, 0.0, r) * 0.55;
      float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
      float dash = step(0.0, sin(angle * 16.0 + uTime * 2.5));
      vec3 gold = vec3(0.98, 0.75, 0.15);
      vec3 cyan = vec3(0.22, 0.74, 0.97);
      vec3 col = gold * ring1 * (0.55 + 0.45 * dash) + cyan * (ring2 + core);
      float alpha = clamp(ring1 + ring2 * 0.85 + core, 0.0, 0.9);
      if (alpha < 0.03) discard;
      gl_FragColor = vec4(col, alpha);
      return;
    }

    vec4 fCol = texture2D(uFrontTex, vUv);
    vec4 bCol = texture2D(uBackTex, vec2(1.0 - vUv.x, vUv.y));

    if (fCol.a < 0.12 && bCol.a < 0.12) discard;

    // Seamless fallback where front & back silhouettes differ slightly (dreads/feathers)
    vec3 fRGB = fCol.a > 0.25 ? fCol.rgb : bCol.rgb;
    vec3 bRGB = bCol.a > 0.25 ? bCol.rgb : fCol.rgb;

    // vSide: 0.0 = front half, 1.0 = back half, 0.5 = side seam
    vec3 rawRGB = mix(fRGB, bRGB, clamp(vSide, 0.0, 1.0));

    vec3 N = normalize(vNormal);
    vec3 V = normalize(vec3(0.0, 0.1, 2.6) - vWorldPos);
    vec3 L1 = normalize(vec3(0.6, 0.7, 0.9));
    vec3 L2 = normalize(vec3(-0.7, 0.3, -0.6));

    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0);

    // Specular highlight for golden metallic armor
    vec3 H = normalize(L1 + V);
    float spec = pow(max(dot(N, H), 0.0), 28.0);
    float isGold = clamp((rawRGB.r - rawRGB.b) * 1.8, 0.0, 1.0);

    // 3D Rim lighting (electric cyan + mythic gold) along silhouette edges
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.4);
    vec3 rimColor = mix(vec3(0.22, 0.74, 0.98), vec3(0.98, 0.78, 0.22), isGold) * rim * 0.58;

    // Side-profile armor plating so 90° side angle looks like solid sculpted gold/obsidian armor
    float seamFactor = 1.0 - abs(vSide * 2.0 - 1.0);
    vec3 seamArmor = mix(vec3(0.14, 0.32, 0.62), vec3(0.82, 0.62, 0.18), isGold);
    vec3 baseRGB = mix(rawRGB, seamArmor, seamFactor * 0.42);

    vec3 finalRGB = baseRGB * (0.76 + 0.32 * diff1 + 0.15 * diff2)
                  + vec3(1.0, 0.9, 0.65) * spec * (0.24 + 0.48 * isGold)
                  + rimColor;

    gl_FragColor = vec4(finalRGB, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

function perspectiveMatrix(fovRad: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1.0 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function translationMatrix(tx: number, ty: number, tz: number): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1,
  ]);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Builds a closed, watertight 3D sculpted statue mesh from the Front and Back images,
 * plus a 3D circular pedestal mesh at the character's feet.
 */
function buildSculpted3DMesh(frontImg: HTMLImageElement, backImg: HTMLImageElement) {
  const gw = 136;
  const gh = 196;

  const cFront = document.createElement('canvas');
  cFront.width = gw;
  cFront.height = gh;
  const ctxF = cFront.getContext('2d')!;
  ctxF.drawImage(frontImg, 0, 0, gw, gh);
  const dataF = ctxF.getImageData(0, 0, gw, gh).data;

  const cBack = document.createElement('canvas');
  cBack.width = gw;
  cBack.height = gh;
  const ctxB = cBack.getContext('2d')!;
  ctxB.drawImage(backImg, 0, 0, gw, gh);
  const dataB = ctxB.getImageData(0, 0, gw, gh).data;

  // 1. Build clean union character mask & luminance relief maps
  const mask = new Uint8Array(gw * gh);
  const lumF = new Float32Array(gw * gh);
  const lumB = new Float32Array(gw * gh);

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x;
      // Ignore bottom-right watermark corner
      if (x > gw * 0.78 && y > gh * 0.84) {
        mask[i] = 0;
        continue;
      }

      const idxF = i * 4;
      const rf = dataF[idxF];
      const gf = dataF[idxF + 1];
      const bf = dataF[idxF + 2];
      const maxF = Math.max(rf, gf, bf);

      // Mirror X on back image so 3D front & back silhouettes align in world space
      const bx = gw - 1 - x;
      const idxB = (y * gw + bx) * 4;
      const rb = dataB[idxB];
      const gb = dataB[idxB + 1];
      const bb = dataB[idxB + 2];
      const maxB = Math.max(rb, gb, bb);

      if (maxF > 22 || maxB > 22) {
        mask[i] = 1;
      }
      lumF[i] = (0.299 * rf + 0.587 * gf + 0.114 * bf) / 255;
      lumB[i] = (0.299 * rb + 0.587 * gb + 0.114 * bb) / 255;
    }
  }

  // 2. Compute 2D Chamfer Distance Transform from silhouette boundary for rounded 3D volume
  const dist = new Float32Array(gw * gh);
  const INF = 9999;
  for (let i = 0; i < gw * gh; i++) {
    dist[i] = mask[i] ? INF : 0;
  }
  // Forward pass
  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = y * gw + x;
      if (!mask[i]) continue;
      let d = dist[i];
      if (dist[i - 1] + 1 < d) d = dist[i - 1] + 1;
      if (dist[i - gw] + 1 < d) d = dist[i - gw] + 1;
      if (dist[i - gw - 1] + 1.414 < d) d = dist[i - gw - 1] + 1.414;
      if (dist[i - gw + 1] + 1.414 < d) d = dist[i - gw + 1] + 1.414;
      dist[i] = d;
    }
  }
  // Backward pass
  for (let y = gh - 2; y >= 1; y--) {
    for (let x = gw - 2; x >= 1; x--) {
      const i = y * gw + x;
      if (!mask[i]) continue;
      let d = dist[i];
      if (dist[i + 1] + 1 < d) d = dist[i + 1] + 1;
      if (dist[i + gw] + 1 < d) d = dist[i + gw] + 1;
      if (dist[i + gw + 1] + 1.414 < d) d = dist[i + gw + 1] + 1.414;
      if (dist[i + gw - 1] + 1.414 < d) d = dist[i + gw - 1] + 1.414;
      dist[i] = d;
    }
  }

  // Smooth the distance field (2 passes of box filter) so 3D normals are silky and organic
  const smoothDist = new Float32Array(gw * gh);
  for (let pass = 0; pass < 2; pass++) {
    const src = pass === 0 ? dist : smoothDist;
    const dst = pass === 0 ? smoothDist : dist;
    for (let y = 1; y < gh - 1; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const i = y * gw + x;
        if (!mask[i]) {
          dst[i] = 0;
          continue;
        }
        dst[i] =
          (src[i] * 2 +
            src[i - 1] +
            src[i + 1] +
            src[i - gw] +
            src[i + gw] +
            src[i - gw - 1] +
            src[i - gw + 1] +
            src[i + gw - 1] +
            src[i + gw + 1]) /
          10;
      }
    }
  }

  // 3. Compute Front Z (+z) and Back Z (-z) heights for each grid vertex
  const zFront = new Float32Array(gw * gh);
  const zBack = new Float32Array(gw * gh);
  const aspect = gw / gh; // ~0.69

  for (let y = 0; y < gh; y++) {
    const ny = y / (gh - 1);
    // Torso/head center boost so chest, helmet & shoulders have realistic 3D anatomical depth
    const centerTorsoWeight = Math.exp(-Math.pow((ny - 0.36) / 0.28, 2)) * 0.045;

    for (let x = 0; x < gw; x++) {
      const i = y * gw + x;
      if (!mask[i]) continue;
      const nx = x / (gw - 1);
      const centerXWeight = Math.exp(-Math.pow((nx - 0.5) / 0.22, 2));

      const dNorm = Math.min(1.0, dist[i] / 15.0);
      // Elliptical profile (sqrt curve) gives a true rounded 3D cylinder/statue cross-section at the edges!
      const baseDepth = Math.pow(dNorm, 0.58) * 0.165 + dNorm * centerTorsoWeight * centerXWeight;

      const reliefF = (lumF[i] - 0.3) * 0.032 * Math.min(1.0, dist[i] / 4.0);
      const reliefB = (lumB[i] - 0.3) * 0.032 * Math.min(1.0, dist[i] / 4.0);

      zFront[i] = Math.max(0.002, baseDepth + reliefF);
      zBack[i] = -Math.max(0.002, baseDepth + reliefB);
    }
  }

  // Helper to get 3D position of grid vertex (x, y)
  const posX = (x: number) => (x / (gw - 1) - 0.5) * 2.0 * aspect;
  const posY = (y: number) => (0.5 - y / (gh - 1)) * 2.0;

  // 4. Compute smooth per-vertex normals for Front and Back surfaces
  const normFront = new Float32Array(gw * gh * 3);
  const normBack = new Float32Array(gw * gh * 3);
  const stepX = (2.0 * aspect) / (gw - 1);
  const stepY = 2.0 / (gh - 1);

  for (let y = 1; y < gh - 1; y++) {
    for (let x = 1; x < gw - 1; x++) {
      const i = y * gw + x;
      const dzdxF = (zFront[i + 1] - zFront[i - 1]) / (2 * stepX);
      const dzdyF = (zFront[i - gw] - zFront[i + gw]) / (2 * stepY);
      let nxF = -dzdxF;
      let nyF = -dzdyF;
      let nzF = 1.0;
      const lenF = Math.hypot(nxF, nyF, nzF) || 1;
      normFront[i * 3] = nxF / lenF;
      normFront[i * 3 + 1] = nyF / lenF;
      normFront[i * 3 + 2] = nzF / lenF;

      const dzdxB = (zBack[i + 1] - zBack[i - 1]) / (2 * stepX);
      const dzdyB = (zBack[i - gw] - zBack[i + gw]) / (2 * stepY);
      let nxB = dzdxB;
      let nyB = dzdyB;
      let nzB = -1.0;
      const lenB = Math.hypot(nxB, nyB, nzB) || 1;
      normBack[i * 3] = nxB / lenB;
      normBack[i * 3 + 1] = nyB / lenB;
      normBack[i * 3 + 2] = nzB / lenB;
    }
  }

  // 5. Assemble interleaved vertex buffer [x, y, z, nx, ny, nz, u, v, side] and index buffer
  const verts: number[] = [];
  const indices: number[] = [];
  const frontIdxMap = new Int32Array(gw * gh).fill(-1);
  const backIdxMap = new Int32Array(gw * gh).fill(-1);
  let vCount = 0;

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const i = y * gw + x;
      // Include pixel if it or any immediate neighbor is in mask (so boundary stitches at z=0)
      const active =
        mask[i] ||
        (x > 0 && mask[i - 1]) ||
        (x < gw - 1 && mask[i + 1]) ||
        (y > 0 && mask[i - gw]) ||
        (y < gh - 1 && mask[i + gw]);
      if (!active) continue;

      const px = posX(x);
      const py = posY(y);
      const u = x / (gw - 1);
      const v = y / (gh - 1);
      const isEdge = !mask[i] || dist[i] <= 1.2;

      // Front vertex
      frontIdxMap[i] = vCount++;
      verts.push(
        px,
        py,
        isEdge ? 0 : zFront[i],
        normFront[i * 3],
        normFront[i * 3 + 1],
        normFront[i * 3 + 2],
        u,
        v,
        isEdge ? 0.45 : 0.0,
      );

      // Back vertex
      backIdxMap[i] = vCount++;
      verts.push(
        px,
        py,
        isEdge ? 0 : zBack[i],
        normBack[i * 3],
        normBack[i * 3 + 1],
        normBack[i * 3 + 2],
        u,
        v,
        isEdge ? 0.55 : 1.0,
      );
    }
  }

  for (let y = 0; y < gh - 1; y++) {
    for (let x = 0; x < gw - 1; x++) {
      const i00 = y * gw + x;
      const i10 = i00 + 1;
      const i01 = i00 + gw;
      const i11 = i01 + 1;

      if (!(mask[i00] || mask[i10] || mask[i01] || mask[i11])) continue;

      const f00 = frontIdxMap[i00];
      const f10 = frontIdxMap[i10];
      const f01 = frontIdxMap[i01];
      const f11 = frontIdxMap[i11];
      if (f00 >= 0 && f10 >= 0 && f01 >= 0 && f11 >= 0) {
        indices.push(f00, f01, f10, f10, f01, f11);
      }

      const b00 = backIdxMap[i00];
      const b10 = backIdxMap[i10];
      const b01 = backIdxMap[i01];
      const b11 = backIdxMap[i11];
      if (b00 >= 0 && b10 >= 0 && b01 >= 0 && b11 >= 0) {
        // Reverse winding for back face
        indices.push(b00, b10, b01, b10, b11, b01);
      }
    }
  }

  // 6. Add 3D Pedestal Disc at feet (y = -0.92)
  const pedY = -0.92;
  const pedR = 0.62;
  const p0 = vCount++;
  const p1 = vCount++;
  const p2 = vCount++;
  const p3 = vCount++;
  verts.push(-pedR, pedY, -pedR, 0, 1, 0, 0, 0, 2.0);
  verts.push(pedR, pedY, -pedR, 0, 1, 0, 1, 0, 2.0);
  verts.push(pedR, pedY, pedR, 0, 1, 0, 1, 1, 2.0);
  verts.push(-pedR, pedY, pedR, 0, 1, 0, 0, 1, 2.0);
  indices.push(p0, p2, p1, p0, p3, p2);

  return {
    vertices: new Float32Array(verts),
    indices: new Uint32Array(indices),
  };
}

/**
 * Prepares clean rgba texture with black background keyed out & corner watermark removed
 */
function prepareCleanTextureCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const imgData = ctx.getImageData(0, 0, c.width, c.height);
  const d = imgData.data;

  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const idx = (y * c.width + x) * 4;
      if (x > c.width * 0.78 && y > c.height * 0.84) {
        d[idx + 3] = 0;
        continue;
      }
      const maxC = Math.max(d[idx], d[idx + 1], d[idx + 2]);
      if (maxC < 15) {
        d[idx + 3] = 0;
      } else if (maxC < 45) {
        d[idx + 3] = Math.round(((maxC - 15) / 30) * 255);
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
  return c;
}

export function MythicCharacterShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleBadgeRef = useRef<HTMLSpanElement>(null);

  const [autoSpin, setAutoSpin] = useState(true);
  const [selectedStar, setSelectedStar] = useState<number>(7);
  const [isVisible, setIsVisible] = useState(false);
  const [meshReady, setMeshReady] = useState(false);

  const rotRef = useRef({
    yaw: 0.35, // radians
    pitch: 0.04,
    targetYaw: null as number | null,
    isDragging: false,
    startX: 0,
    startY: 0,
    startYaw: 0,
    startPitch: 0,
    velocity: 0,
  });

  // Pause WebGL loop when off-screen
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Initialize WebGL 3D Sculpted Mesh & Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    if (!gl) return;

    // Enable 32-bit index buffer for high-resolution 3D mesh
    const uintExt = gl.getExtension('OES_element_index_uint');
    if (!uintExt) return;

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vbo = gl.createBuffer();
    const ibo = gl.createBuffer();
    const texFront = gl.createTexture();
    const texBack = gl.createTexture();

    let alive = true;

    Promise.all([
      loadImage('/images/creator/mythic-character-front.jpg'),
      loadImage('/images/creator/mythic-character-back.jpg'),
    ]).then(([fImg, bImg]) => {
      if (!alive) return;

      const mesh = buildSculpted3DMesh(fImg, bImg);

      gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

      const stride = 9 * 4;
      const aPos = gl.getAttribLocation(prog, 'aPos');
      const aNormal = gl.getAttribLocation(prog, 'aNormal');
      const aUv = gl.getAttribLocation(prog, 'aUv');
      const aSide = gl.getAttribLocation(prog, 'aSide');

      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);

      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, stride, 3 * 4);

      gl.enableVertexAttribArray(aUv);
      gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 6 * 4);

      gl.enableVertexAttribArray(aSide);
      gl.vertexAttribPointer(aSide, 1, gl.FLOAT, false, stride, 8 * 4);

      // Upload Front & Back textures
      const cleanFront = prepareCleanTextureCanvas(fImg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texFront);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cleanFront);

      const cleanBack = prepareCleanTextureCanvas(bImg);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texBack);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cleanBack);

      gl.uniform1i(gl.getUniformLocation(prog, 'uFrontTex'), 0);
      gl.uniform1i(gl.getUniformLocation(prog, 'uBackTex'), 1);

      setMeshReady(true);
    });

    return () => {
      alive = false;
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteTexture(texFront);
      gl.deleteTexture(texBack);
      gl.deleteProgram(prog);
    };
  }, []);

  // Active render loop
  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  useEffect(() => {
    if (!isVisible || !meshReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const prog = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
    if (!prog) return;

    const uProj = gl.getUniformLocation(prog, 'uProj');
    const uView = gl.getUniformLocation(prog, 'uView');
    const uYaw = gl.getUniformLocation(prog, 'uYaw');
    const uPitch = gl.getUniformLocation(prog, 'uPitch');
    const uTime = gl.getUniformLocation(prog, 'uTime');

    let rafId = 0;
    const startTime = performance.now();

    const render = (now: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayW = Math.floor(canvas.clientWidth * dpr);
      const displayH = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      const r = rotRef.current;
      if (!r.isDragging) {
        if (r.targetYaw !== null) {
          const diff = r.targetYaw - r.yaw;
          if (Math.abs(diff) < 0.01) {
            r.yaw = r.targetYaw;
            r.targetYaw = null;
          } else {
            r.yaw += diff * 0.12;
          }
          r.pitch *= 0.92;
        } else if (autoSpinRef.current) {
          r.yaw += 0.012;
          r.pitch = 0.03 * Math.sin((now - startTime) * 0.0015);
        } else if (Math.abs(r.velocity) > 0.0005) {
          r.yaw += r.velocity;
          r.velocity *= 0.93;
          r.pitch *= 0.94;
        }
      }

      const proj = perspectiveMatrix((38 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 15.0);
      const view = translationMatrix(0, 0.02, -3.05);

      gl.uniformMatrix4fv(uProj, false, proj);
      gl.uniformMatrix4fv(uView, false, view);
      gl.uniform1f(uYaw, r.yaw);
      gl.uniform1f(uPitch, r.pitch);
      gl.uniform1f(uTime, (now - startTime) * 0.001);

      const count = gl.getBufferParameter(gl.ELEMENT_ARRAY_BUFFER, gl.BUFFER_SIZE) / 4;
      if (count > 0) {
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
      }

      if (angleBadgeRef.current) {
        const deg = Math.round((((r.yaw * 180) / Math.PI) % 360 + 360) % 360);
        angleBadgeRef.current.textContent = `${deg}°`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isVisible, meshReady]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = rotRef.current;
    r.isDragging = true;
    r.targetYaw = null;
    r.startX = e.clientX;
    r.startY = e.clientY;
    r.startYaw = r.yaw;
    r.startPitch = r.pitch;
    r.velocity = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = rotRef.current;
    if (!r.isDragging) return;
    const dx = e.clientX - r.startX;
    const dy = e.clientY - r.startY;
    const nextYaw = r.startYaw + dx * 0.014;
    r.velocity = (nextYaw - r.yaw) * 0.5;
    r.yaw = nextYaw;
    r.pitch = Math.max(-0.35, Math.min(0.35, r.startPitch + dy * 0.006));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    rotRef.current.isDragging = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const snapToAngle = (targetDeg: number) => {
    setAutoSpin(false);
    const r = rotRef.current;
    const targetRad = (targetDeg * Math.PI) / 180;
    const twoPi = Math.PI * 2;
    const currentNorm = ((r.yaw % twoPi) + twoPi) % twoPi;
    let delta = targetRad - currentNorm;
    if (delta > Math.PI) delta -= twoPi;
    if (delta < -Math.PI) delta += twoPi;
    r.targetYaw = r.yaw + delta;
  };

  const currentLevel = XSUIT_LEVELS.find((l) => l.star === selectedStar) ?? XSUIT_LEVELS[6];
  const cumulativeStones = XSUIT_LEVELS.filter((l) => l.star <= selectedStar).reduce((a, b) => a + b.stones, 0);
  const cumulativeFragments = XSUIT_LEVELS.filter((l) => l.star <= selectedStar).reduce((a, b) => a + b.fragments, 0);

  return (
    <div className="panel winter-icicle-container relative overflow-hidden p-4 sm:p-6 border border-cyan-400/30 bg-[#0a0f20]">
      {/* Subtle Ambient Aura */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 25% 45%, rgba(14, 165, 233, 0.16) 0%, rgba(251, 191, 36, 0.08) 45%, transparent 72%)',
        }}
      />

      <div className="grid gap-6 lg:grid-cols-[310px_1fr] items-stretch">
        {/* ── LEFT: COMPACT REAL WEBGL 3D MESH CANVAS VIEWPORT ── */}
        <div className="flex flex-col justify-between mx-auto w-full max-w-[290px] sm:max-w-[310px]">
          <div className="relative h-[340px] sm:h-[380px] w-full rounded-2xl border border-cyan-400/35 bg-[radial-gradient(circle_at_50%_42%,#132546_0%,#080d1c_68%,#050711_100%)] overflow-hidden shadow-[inset_0_0_35px_rgba(14,165,233,0.22)]">
            {/* Top HUD Bar */}
            <div className="absolute inset-x-3 top-2.5 z-20 flex items-center justify-between pointer-events-none font-mono text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 px-2 py-0.5 text-cyan-200 font-bold uppercase">
                <Zap className="size-2.5 text-cyan-300" />
                3D WEBGL MESH
              </span>
              <span
                ref={angleBadgeRef}
                className="rounded-md bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-amber-300 font-bold tabular-nums"
              >
                20°
              </span>
            </div>

            {/* Real WebGL 3D Sculpted Mesh Canvas */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="size-full cursor-grab active:cursor-grabbing select-none block"
              style={{ touchAction: 'pan-y' }}
              aria-label="Interactive 3D WebGL BGMI X-Suit Model — drag to rotate 360 degrees"
            />

            {/* Loading state while 3D mesh builds */}
            {!meshReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#060914]/90 font-mono text-xs text-cyan-300">
                <Sparkles className="size-5 animate-spin text-amber-300" />
                <span>Building 3D Mesh...</span>
              </div>
            )}

            {/* Bottom Drag Hint */}
            <div className="pointer-events-none absolute inset-x-0 bottom-2.5 z-20 flex justify-center">
              <span className="rounded-full bg-black/80 border border-cyan-400/30 px-3 py-0.5 font-mono text-[9px] text-cyan-200 tracking-wider uppercase">
                ↔ Drag 360° Any Angle
              </span>
            </div>
          </div>

          {/* Quick 3D Camera Angle Controls below Canvas */}
          <div className="mt-2.5 grid grid-cols-4 gap-1.5 font-mono text-[10px]">
            <button
              type="button"
              onClick={() => {
                rotRef.current.targetYaw = null;
                setAutoSpin((s) => !s);
              }}
              className={`flex items-center justify-center gap-1 rounded-xl py-2 font-bold uppercase transition cursor-pointer ${
                autoSpin
                  ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(56,189,248,0.45)]'
                  : 'border border-cyan-400/40 bg-cyan-500/10 text-cyan-200'
              }`}
            >
              {autoSpin ? <Pause className="size-3" /> : <Play className="size-3" />}
              <span>{autoSpin ? 'Spin' : 'Paused'}</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(0)}
              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2 font-bold text-slate-200 hover:border-amber-400/50 hover:text-white transition cursor-pointer"
            >
              <Eye className="size-3 text-amber-300" />
              <span>0°</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(45)}
              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2 font-bold text-slate-200 hover:border-cyan-400/50 hover:text-white transition cursor-pointer"
            >
              <span>45°</span>
            </button>

            <button
              type="button"
              onClick={() => snapToAngle(180)}
              className="flex items-center justify-center gap-1 rounded-xl border border-line bg-card py-2 font-bold text-slate-200 hover:border-amber-400/50 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="size-3 text-cyan-300" />
              <span>180°</span>
            </button>
          </div>
        </div>

        {/* ── RIGHT: AUTHENTIC BGMI X-LABORATORY MAX UPGRADE & FRAGMENT CALCULATOR ── */}
        <div className="flex flex-col justify-between space-y-4 text-left min-w-0">
          {/* Header & Total Max Cost Summary */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line/70 pb-3.5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
                <Trophy className="size-3 text-amber-300" />
                BGMI X-Laboratory · 7-Star Maxed Dossier
              </div>
              <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-white">
                Pharaoh&apos;s Storm <span className="text-gradient-gold">Mythic X-Suit</span>
              </h3>
            </div>

            {/* Total Max Upgrade Materials Box (1★ -> 7★ MAX) */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 font-mono text-center">
                <span className="block text-[9px] uppercase text-amber-300 font-bold">Total Starforge Stones</span>
                <span className="text-sm sm:text-base font-black text-white">🔶 {TOTAL_STONES}</span>
              </div>
              <div className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 font-mono text-center">
                <span className="block text-[9px] uppercase text-cyan-300 font-bold">Total Star Fragments</span>
                <span className="text-sm sm:text-base font-black text-white">💠 {TOTAL_FRAGMENTS.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Interactive 7-Star Level Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2 font-mono text-[10px] uppercase tracking-wider text-slate-300">
              <span>Select X-Suit Star Level (1★ to 7★ Max)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> All 7 Levels Unlocked
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {XSUIT_LEVELS.map((lvl) => {
                const active = lvl.star === selectedStar;
                return (
                  <button
                    key={lvl.star}
                    type="button"
                    onClick={() => setSelectedStar(lvl.star)}
                    className={`flex flex-col items-center justify-center rounded-xl border py-2 px-1 font-mono transition cursor-pointer ${
                      active
                        ? 'border-amber-400 bg-gradient-to-b from-amber-400/25 to-amber-500/10 text-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.3)]'
                        : 'border-line bg-surface/70 text-slate-300 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black">{lvl.star}★</span>
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-tighter truncate max-w-full">
                      {lvl.star === 7 ? 'MAX' : `Lv.${lvl.star}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Level Material Cost & Unlocked Perk Card */}
          <div className="rounded-2xl border border-cyan-400/25 bg-[#10172e]/90 p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-400 px-2 py-0.5 font-mono text-xs font-black text-slate-950">
                  <Star className="size-3 fill-slate-950" /> {currentLevel.star}-STAR
                </span>
                <h4 className="font-display text-base sm:text-lg font-bold text-white">{currentLevel.title}</h4>
              </div>
              <span className="rounded-md border border-cyan-400/30 bg-cyan-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-cyan-300">
                {currentLevel.tag}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{currentLevel.desc}</p>

            {/* Level Cost vs Cumulative Cost Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-amber-300 font-bold">This Level Stones</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  {currentLevel.stones === 0 ? '300 Silver' : `🔶 ${currentLevel.stones} Stones`}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-cyan-300 font-bold">This Level Fragments</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  {currentLevel.fragments === 0 ? 'Base Spin' : `💠 ${currentLevel.fragments} Shards`}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-purple-300 font-bold">Cumulative (1★→{currentLevel.star}★)</span>
                <span className="mt-0.5 block text-xs sm:text-sm font-black text-white">
                  🔶 {cumulativeStones} · 💠 {cumulativeFragments}
                </span>
              </div>
              <div className="rounded-xl border border-line/70 bg-black/35 p-2.5">
                <span className="block text-[9px] uppercase text-emerald-300 font-bold">Special Unlock</span>
                <span className="mt-0.5 block text-[11px] font-bold text-emerald-300 truncate" title={currentLevel.perk}>
                  {currentLevel.perk}
                </span>
              </div>
            </div>
          </div>

          {/* Complete 1★ to 7★ Upgrade Breakdown Table (Compact & Scrollable on Mobile) */}
          <div className="rounded-xl border border-line/70 bg-surface/60 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-line/60 bg-black/30 font-mono text-[10px] uppercase font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Flame className="size-3.5 text-amber-400" />
                X-Laboratory Full Upgrade Chart (1★ to 7★ Max)
              </span>
              <span className="text-amber-300">~45,000 – 65,000 UC Est.</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-line/50 font-mono text-[10px] text-center">
              {XSUIT_LEVELS.slice(1).map((lvl) => (
                <button
                  key={lvl.star}
                  type="button"
                  onClick={() => setSelectedStar(lvl.star)}
                  className={`p-2 transition cursor-pointer ${
                    selectedStar === lvl.star ? 'bg-amber-400/15 text-white' : 'hover:bg-white/5 text-slate-200'
                  }`}
                >
                  <span className="block font-black text-amber-300">{lvl.star}★ {lvl.title.split(' ')[0]}</span>
                  <span className="block text-[9px] text-slate-200 mt-0.5">🔶 {lvl.stones} Stones</span>
                  <span className="block text-[9px] text-cyan-300">💠 {lvl.fragments} Frag</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 pt-0.5">
            <span className="inline-flex items-center gap-1">
              <Shield className="size-3 text-emerald-400" /> Owner: <strong className="text-white">FRAGxKhusiYT (UID: 5112658248)</strong>
            </span>
            <span className="text-cyan-300 font-bold">Status: 7★ MAX AWAKENED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
