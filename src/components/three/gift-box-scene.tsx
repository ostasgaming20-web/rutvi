"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const IVORY = "#f2ebe0";
const IVORY_LID = "#f7f1e7";
const SATIN = "#101014";
const GOLD = "#c9a468";
const NAVY = "#101c30";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const sub = (a: number, b: number, v: number) => clamp01((v - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

type ProductKind = "diary" | "pen" | "notebook" | "cardholder" | "calendar" | "card" | "stationery";

type ProductDef = {
  kind: ProductKind;
  out: [number, number, number];
  rot: [number, number, number];
  inside: [number, number, number];
  scale: number;
  label: string;
};

const PRODUCTS: ProductDef[] = [
  { kind: "diary", out: [-1.34, 1.3, 0.78], rot: [0.12, 0.44, -0.06], inside: [-0.35, 0.34, 0.15], scale: 1, label: "Executive diary" },
  { kind: "pen", out: [-0.34, 1.94, 1.0], rot: [0.04, 0, 0.6], inside: [0.1, 0.3, 0.2], scale: 1, label: "Luxury metallic pen" },
  { kind: "stationery", out: [-2.34, 2.0, -0.3], rot: [0.14, 0.6, 0], inside: [-0.2, 0.36, -0.3], scale: 0.88, label: "Premium stationery set" },
  { kind: "card", out: [0.08, 2.52, 0.12], rot: [0.04, 0.26, 0.06], inside: [0.3, 0.42, 0.1], scale: 1, label: "Corporate gift card" },
  { kind: "notebook", out: [0.94, 1.26, 1.06], rot: [0.08, -0.26, 0.03], inside: [0.15, 0.36, 0.35], scale: 1, label: "Premium notebook" },
  { kind: "cardholder", out: [2.02, 1.08, 0.55], rot: [0.03, -0.44, 0], inside: [-0.1, 0.32, -0.2], scale: 1, label: "Business card holder" },
  { kind: "calendar", out: [2.08, 2.0, -0.24], rot: [0.1, -0.54, 0], inside: [0.05, 0.38, -0.35], scale: 1, label: "Desk calendar" },
];

/* ---------------------------------- parts --------------------------------- */

function SatinMaterial() {
  return (
    <meshPhysicalMaterial
      color={SATIN}
      roughness={0.24}
      metalness={0.12}
      clearcoat={0.9}
      clearcoatRoughness={0.2}
      sheen={1}
      sheenRoughness={0.4}
      sheenColor="#4a4a52"
    />
  );
}

function GoldMaterial() {
  return <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.26} />;
}

function Bow({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const tails = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sway = Math.sin(t * 0.8) * 0.02;
    if (left.current) left.current.rotation.z = 0.3 + sway;
    if (right.current) right.current.rotation.z = -0.3 - sway;
    if (tails.current) tails.current.rotation.z = Math.sin(t * 0.55) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, 0.02, 0]}>
      <group ref={left} position={[-0.19, 0.02, 0]} rotation={[0, -0.28, 0.3]}>
        <mesh scale={[1, 0.58, 0.82]} castShadow>
          <torusGeometry args={[0.19, 0.038, 14, 36]} />
          <SatinMaterial />
        </mesh>
      </group>
      <group ref={right} position={[0.19, 0.02, 0]} rotation={[0, 0.28, -0.3]}>
        <mesh scale={[1, 0.58, 0.82]} castShadow>
          <torusGeometry args={[0.19, 0.038, 14, 36]} />
          <SatinMaterial />
        </mesh>
      </group>
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.062, 20, 20]} />
        <SatinMaterial />
      </mesh>
      <group ref={tails}>
        <mesh position={[-0.07, -0.17, 0.02]} rotation={[0.16, 0, 0.22]} castShadow>
          <boxGeometry args={[0.055, 0.3, 0.016]} />
          <SatinMaterial />
        </mesh>
        <mesh position={[0.07, -0.17, -0.01]} rotation={[-0.12, 0, -0.18]} castShadow>
          <boxGeometry args={[0.055, 0.3, 0.016]} />
          <SatinMaterial />
        </mesh>
      </group>
    </group>
  );
}

/* --------------------------------- products -------------------------------- */

function Diary() {
  return (
    <group>
      <RoundedBox args={[1.06, 0.16, 1.46]} radius={0.018} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial color={NAVY} roughness={0.42} metalness={0.06} clearcoat={0.55} clearcoatRoughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.99, 0.135, 1.39]} radius={0.012} smoothness={3} position={[0.045, 0.002, 0]}>
        <meshStandardMaterial color="#f6efe3" roughness={0.92} />
      </RoundedBox>
      <mesh position={[0.08, 0.084, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 1.34]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.28, 0.086, 0.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.118, 40]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.28, 0.087, 0.22]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[0.09, 0.09]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, -0.084, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.98, 1.38]} />
        <meshStandardMaterial color="#f4ecdf" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Pen() {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.55;
  });

  return (
    <group ref={spin}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.82, 20]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh position={[0.47, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.038, 0.14, 20]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0.545, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.014, 0.045, 12]} />
        <meshStandardMaterial color="#d9d9de" metalness={0.95} roughness={0.16} />
      </mesh>
      <mesh position={[-0.36, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.043, 0.038, 0.26, 20]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.3, 0.052, 0]} castShadow>
        <boxGeometry args={[0.2, 0.014, 0.02]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, 0.037, 0]}>
        <boxGeometry args={[0.62, 0.006, 0.012]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

function Notebook() {
  const cover = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!cover.current) return;
    const target = 0.42;
    cover.current.rotation.z = THREE.MathUtils.damp(cover.current.rotation.z, target, 2.5, Math.min(dt, 0.05));
  });

  return (
    <group>
      <group position={[-0.42, 0, 0]}>
        <RoundedBox args={[0.84, 0.055, 1.16]} radius={0.012} smoothness={3} position={[0.42, -0.05, 0]} castShadow>
          <meshPhysicalMaterial color="#e9dfcd" roughness={0.68} metalness={0.03} clearcoat={0.3} />
        </RoundedBox>
        <mesh position={[0.42, -0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.78, 1.1]} />
          <meshStandardMaterial color="#fbf6ec" roughness={0.96} />
        </mesh>
      </group>
      <group ref={cover} position={[-0.42, 0, 0]}>
        <RoundedBox args={[0.84, 0.05, 1.16]} radius={0.012} smoothness={3} position={[0.42, 0.02, 0]} castShadow>
          <meshPhysicalMaterial color={NAVY} roughness={0.5} metalness={0.05} clearcoat={0.4} />
        </RoundedBox>
        <mesh position={[0.42, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.7, 1.02]} />
          <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.35} transparent opacity={0.16} />
        </mesh>
      </group>
      <mesh position={[-0.42, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 1.16, 12]} />
        <meshStandardMaterial color="#d8cdb8" roughness={0.85} />
      </mesh>
    </group>
  );
}

function CardHolder() {
  return (
    <group>
      <RoundedBox args={[0.72, 0.1, 0.5]} radius={0.015} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color="#b8bcc2" metalness={0.9} roughness={0.32} />
      </RoundedBox>
      <RoundedBox args={[0.66, 0.09, 0.44]} radius={0.012} smoothness={3} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#c8ccd2" metalness={0.92} roughness={0.24} />
      </RoundedBox>
      <mesh position={[0, 0.152, 0]}>
        <boxGeometry args={[0.5, 0.006, 0.03]} />
        <meshStandardMaterial color="#3a3d44" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.168, -0.06]} rotation={[-0.16, 0, 0]}>
        <boxGeometry args={[0.42, 0.006, 0.26]} />
        <meshStandardMaterial color="#f7f1e7" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.05, 0.251]}>
        <boxGeometry args={[0.3, 0.012, 0.002]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

function DeskCalendar() {
  return (
    <group>
      <RoundedBox args={[0.8, 0.06, 0.5]} radius={0.014} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial color={IVORY} roughness={0.6} clearcoat={0.3} />
      </RoundedBox>
      <group position={[0, 0.03, -0.16]} rotation={[-0.32, 0, 0]}>
        <RoundedBox args={[0.72, 0.48, 0.03]} radius={0.01} smoothness={3} position={[0, 0.24, 0]} castShadow>
          <meshStandardMaterial color="#fbf7f0" roughness={0.94} />
        </RoundedBox>
        <mesh position={[0, 0.4, 0.017]}>
          <planeGeometry args={[0.5, 0.02]} />
          <GoldMaterial />
        </mesh>
        {[0.3, 0.22, 0.14].map((y) => (
          <mesh key={y} position={[-0.05, y, 0.017]}>
            <planeGeometry args={[0.36, 0.008]} />
            <meshStandardMaterial color="#c9c2b5" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.031, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.34, 0.1]} />
        <GoldMaterial />
      </mesh>
    </group>
  );
}

function GiftCard() {
  return (
    <group>
      <RoundedBox args={[0.64, 0.4, 0.014]} radius={0.008} smoothness={3} castShadow>
        <meshPhysicalMaterial color="#12131a" roughness={0.3} metalness={0.25} clearcoat={0.85} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0085]}>
        <planeGeometry args={[0.58, 0.34]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.3} transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.0095]}>
        <planeGeometry args={[0.54, 0.3]} />
        <meshPhysicalMaterial color="#12131a" roughness={0.28} metalness={0.25} clearcoat={0.85} />
      </mesh>
      <mesh position={[-0.18, 0.1, 0.0105]}>
        <planeGeometry args={[0.16, 0.014]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0.16, -0.11, 0.0105]}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.34} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function StationerySet() {
  return (
    <group>
      <RoundedBox args={[0.9, 0.05, 0.42]} radius={0.012} smoothness={3} castShadow receiveShadow>
        <meshPhysicalMaterial color="#e6dbc7" roughness={0.72} clearcoat={0.25} />
      </RoundedBox>
      <mesh position={[-0.16, 0.045, 0.06]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.62, 6]} />
        <meshStandardMaterial color="#23242b" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.16, 0.038, 0.06]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.56, 0.016, 0.06]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.24, 0.045, -0.11]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.1]} />
        <meshStandardMaterial color="#f3ece0" roughness={0.85} />
      </mesh>
      <mesh position={[0.24, 0.045, -0.11]} castShadow>
        <boxGeometry args={[0.12, 0.05, 0.12]} />
        <meshPhysicalMaterial color={NAVY} roughness={0.45} clearcoat={0.4} />
      </mesh>
    </group>
  );
}

function ProductMesh({ kind }: { kind: ProductKind }) {
  switch (kind) {
    case "diary":
      return <Diary />;
    case "pen":
      return <Pen />;
    case "notebook":
      return <Notebook />;
    case "cardholder":
      return <CardHolder />;
    case "calendar":
      return <DeskCalendar />;
    case "card":
      return <GiftCard />;
    default:
      return <StationerySet />;
  }
}

/* ----------------------------------- rig ---------------------------------- */

function Rig({
  openRef,
  reduced,
  hoveredRef,
  onHover,
  onToggle,
}: {
  openRef: React.RefObject<number>;
  reduced: boolean;
  hoveredRef: React.RefObject<number | null>;
  onHover: (index: number | null) => void;
  onToggle: () => void;
}) {
  const root = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const bow = useRef<THREE.Group>(null);
  const ribbonV = useRef<THREE.Group>(null);
  const ribbonH = useRef<THREE.Group>(null);
  const productGroups = useRef<(THREE.Group | null)[]>([]);
  const progress = useRef(reduced ? 1 : 0);
  const intro = useRef(0);
  const { camera } = useThree();

  const inside = useMemo(() => PRODUCTS.map((p) => new THREE.Vector3(...p.inside)), []);
  const outside = useMemo(() => PRODUCTS.map((p) => new THREE.Vector3(...p.out)), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    const target = reduced ? 1 : openRef.current;
    progress.current = reduced ? 1 : THREE.MathUtils.damp(progress.current, target, 1.25, dt);
    const p = progress.current;

    intro.current = reduced ? 1 : Math.min(1, intro.current + dt * 0.55);
    const i = easeOut(intro.current);

    const pointer = reduced ? { x: 0, y: 0 } : state.pointer;

    // camera: cinematic approach + subtle parallax
    const camX = pointer.x * 0.26;
    const camY = 3.95 - 1.35 * i + pointer.y * 0.16;
    const camZ = 10.9 - 2.55 * i;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, camX, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 3, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, 3, dt);
    camera.lookAt(0, 1.32 + pointer.y * 0.04, 0);

    // box settle + parallax tilt
    if (root.current) {
      const scale = 0.88 + 0.12 * i;
      root.current.scale.setScalar(scale);
      root.current.position.y = -0.35 + 0.35 * i + Math.sin(t * 0.55) * 0.018 * (reduced ? 0 : 1);
      root.current.rotation.y = THREE.MathUtils.damp(
        root.current.rotation.y,
        pointer.x * 0.16 + Math.sin(t * 0.2) * 0.02,
        2.4,
        dt,
      );
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -pointer.y * 0.05, 2.4, dt);
    }

    // ribbon unties (0 → 0.2), rewraps on close
    const pRibbon = easeInOut(sub(0, 0.2, p));
    if (bow.current) {
      const s = Math.max(0.001, 1 - pRibbon);
      bow.current.scale.setScalar(s);
      bow.current.position.y = 0.02 + pRibbon * 0.35;
      bow.current.rotation.z = pRibbon * 0.9;
      bow.current.visible = s > 0.04;
    }
    if (ribbonV.current) {
      const s = Math.max(0.001, 1 - pRibbon);
      ribbonV.current.scale.set(1 + pRibbon * 0.25, s, 1);
      ribbonV.current.position.y = pRibbon * 0.25;
      ribbonV.current.visible = s > 0.04;
    }
    if (ribbonH.current) {
      const s = Math.max(0.001, 1 - pRibbon);
      ribbonH.current.scale.set(1 + pRibbon * 0.25, s, 1);
      ribbonH.current.visible = s > 0.04;
    }

    // lid lifts (0.16 → 0.4)
    const pLid = easeInOut(sub(0.16, 0.4, p));
    if (lid.current) {
      lid.current.position.y = 0.99 + pLid * 2.05;
      lid.current.position.z = -pLid * 3.4;
      lid.current.position.x = -pLid * 0.1;
      lid.current.rotation.x = -pLid * 1.15;
      lid.current.rotation.z = pLid * 0.05;
      lid.current.scale.setScalar(1 - pLid * 0.16);
      // the lid is fully off-stage before this cut, so a hard hide is invisible
      lid.current.visible = pLid < 0.55;
    }

    // products emerge with stagger
    PRODUCTS.forEach((def, index) => {
      const group = productGroups.current[index];
      if (!group) return;
      const r = easeOut(sub(0.3 + index * 0.055, 0.66 + index * 0.055, p));
      const hovered = hoveredRef.current === index;
      const hoverLift = hovered ? 0.08 : 0;

      group.position.lerpVectors(inside[index], outside[index], r);
      group.position.y += Math.sin(Math.PI * r) * 0.4 + hoverLift;
      if (!reduced) {
        group.position.y += Math.sin(t * 1.05 + index * 1.7) * 0.022 * r;
        group.position.x += Math.cos(t * 0.8 + index) * 0.014 * r;
      }

      const floatTilt = reduced ? 0 : Math.sin(t * 0.7 + index * 1.3) * 0.03 * r;
      group.rotation.set(
        def.rot[0] * r + floatTilt * 0.5,
        def.rot[1] * r + floatTilt,
        def.rot[2] * r + floatTilt * 0.4,
      );

      const base = (0.72 + 0.34 * r) * def.scale;
      group.scale.setScalar(base * (hovered ? 1.07 : 1));
      group.visible = r > 0.002;
    });
  });

  return (
    <group ref={root} position={[0, -0.35, 0]}>
      {/* ---------- box body ---------- */}
      <group
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        {/* floor */}
        <RoundedBox args={[2.6, 0.16, 1.8]} radius={0.05} smoothness={4} position={[0, 0.08, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.62} metalness={0.03} clearcoat={0.22} clearcoatRoughness={0.6} />
        </RoundedBox>

        {/* walls */}
        <RoundedBox args={[0.14, 0.86, 1.8]} radius={0.045} smoothness={4} position={[-1.23, 0.5, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.62} metalness={0.03} clearcoat={0.22} clearcoatRoughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[0.14, 0.86, 1.8]} radius={0.045} smoothness={4} position={[1.23, 0.5, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.62} metalness={0.03} clearcoat={0.22} clearcoatRoughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[2.6, 0.86, 0.14]} radius={0.045} smoothness={4} position={[0, 0.5, 0.83]} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.62} metalness={0.03} clearcoat={0.22} clearcoatRoughness={0.6} />
        </RoundedBox>
        <RoundedBox args={[2.6, 0.86, 0.14]} radius={0.045} smoothness={4} position={[0, 0.5, -0.83]} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.62} metalness={0.03} clearcoat={0.22} clearcoatRoughness={0.6} />
        </RoundedBox>

        {/* dark inner lining */}
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, 1.5]} />
          <meshStandardMaterial color="#2a241d" roughness={1} />
        </mesh>
        <mesh position={[0, 0.52, -0.75]}>
          <planeGeometry args={[2.3, 0.7]} />
          <meshStandardMaterial color="#332c24" roughness={1} />
        </mesh>
        <mesh position={[0, 0.52, 0.75]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[2.3, 0.7]} />
          <meshStandardMaterial color="#332c24" roughness={1} />
        </mesh>
        <mesh position={[-1.15, 0.52, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 0.7]} />
          <meshStandardMaterial color="#332c24" roughness={1} />
        </mesh>
        <mesh position={[1.15, 0.52, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 0.7]} />
          <meshStandardMaterial color="#332c24" roughness={1} />
        </mesh>

        {/* gold detailing */}
        <mesh position={[0, 0.168, 0]}>
          <boxGeometry args={[2.615, 0.016, 1.815]} />
          <GoldMaterial />
        </mesh>
        <mesh position={[0, 0.5, 0.902]}>
          <ringGeometry args={[0.115, 0.128, 48]} />
          <GoldMaterial />
        </mesh>
        <mesh position={[0, 0.5, 0.9025]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.1, 0.1]} />
          <GoldMaterial />
        </mesh>
        <mesh position={[0, 0.34, 0.902]}>
          <planeGeometry args={[0.34, 0.008]} />
          <GoldMaterial />
        </mesh>

        {/* vertical satin ribbon (front + back) */}
        <group ref={ribbonV}>
          <mesh position={[0, 0.47, 0.905]} castShadow>
            <boxGeometry args={[0.26, 0.96, 0.02]} />
            <SatinMaterial />
          </mesh>
          <mesh position={[0, 0.47, -0.905]} castShadow>
            <boxGeometry args={[0.26, 0.96, 0.02]} />
            <SatinMaterial />
          </mesh>
          <mesh position={[0.905, 0.47, 0]} castShadow>
            <boxGeometry args={[0.02, 0.96, 0.26]} />
            <SatinMaterial />
          </mesh>
          <mesh position={[-0.905, 0.47, 0]} castShadow>
            <boxGeometry args={[0.02, 0.96, 0.26]} />
            <SatinMaterial />
          </mesh>
        </group>

        {/* horizontal satin ribbon */}
        <group ref={ribbonH}>
          <mesh position={[0, 0.5, 0.908]}>
            <boxGeometry args={[2.62, 0.26, 0.02]} />
            <SatinMaterial />
          </mesh>
          <mesh position={[0, 0.5, -0.908]}>
            <boxGeometry args={[2.62, 0.26, 0.02]} />
            <SatinMaterial />
          </mesh>
        </group>
      </group>

      {/* ---------- products ---------- */}
      {PRODUCTS.map((def, index) => (
        <group
          key={def.kind}
          ref={(node) => {
            productGroups.current[index] = node;
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(index);
            document.body.style.cursor = "grab";
          }}
          onPointerOut={(event) => {
            event.stopPropagation();
            onHover(null);
            document.body.style.cursor = "";
          }}
        >
          <ProductMesh kind={def.kind} />
        </group>
      ))}

      {/* ---------- lid ---------- */}
      <group ref={lid} position={[0, 0.99, 0]}>
        <RoundedBox args={[2.68, 0.2, 1.88]} radius={0.045} smoothness={5} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY_LID} roughness={0.55} metalness={0.04} clearcoat={0.35} />
        </RoundedBox>
        <mesh position={[0, 0.101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.5, 1.72]} />
          <meshPhysicalMaterial color={IVORY_LID} roughness={0.6} clearcoat={0.25} />
        </mesh>
        <mesh position={[0, 0.104, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.52, 1.74]} />
          <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.4} transparent opacity={0.14} />
        </mesh>
        <mesh position={[0, -0.005, 0]}>
          <boxGeometry args={[2.7, 0.016, 1.9]} />
          <GoldMaterial />
        </mesh>
        <group position={[0, 0.108, 0]}>
          <Bow groupRef={bow} />
        </group>
      </group>
    </group>
  );
}

/* --------------------------------- lights --------------------------------- */

function Studio() {
  return (
    <>
      <ambientLight intensity={0.62} color="#fff7ec" />
      <hemisphereLight args={["#fdf6ea", "#b9a68c", 0.42]} />
      <directionalLight
        position={[4.5, 8, 5.5]}
        intensity={2.15}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-6, 3.5, -4]} intensity={0.62} color="#dfe6f2" />
      <directionalLight position={[2.5, 2.2, -6]} intensity={0.5} color="#fff0d8" />
      <spotLight position={[0, 6.5, 3.2]} angle={0.55} penumbra={1} intensity={0.95} color="#f6e3bd" />
    </>
  );
}

/* --------------------------------- wrapper -------------------------------- */

export default function GiftBoxScene({
  open,
  onToggle,
  reduced = false,
}: {
  open: boolean;
  onToggle: () => void;
  reduced?: boolean;
}) {
  const openRef = useRef(open ? 1 : 0);
  const hoveredRef = useRef<number | null>(null);

  useEffect(() => {
    openRef.current = open ? 1 : 0;
  }, [open]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  const handleHover = useCallback((index: number | null) => {
    hoveredRef.current = index;
  }, []);

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: [0, 3.95, 10.9], fov: 34, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.06 }}
      style={{ touchAction: "pan-y" }}
      aria-label="Interactive 3D corporate gift box"
    >
      <Suspense fallback={null}>
        <Studio />
        <Rig
          openRef={openRef}
          reduced={reduced}
          hoveredRef={hoveredRef}
          onHover={handleHover}
          onToggle={onToggle}
        />
        <ContactShadows
          position={[0, -0.36, 0]}
          opacity={0.34}
          scale={13}
          blur={2.8}
          far={5}
          resolution={512}
          color="#5a4a36"
        />
      </Suspense>
    </Canvas>
  );
}
