"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, PresentationControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const IVORY = "#efe5d3";
const IVORY_LIGHT = "#f7efe2";
const NAVY = "#0d1f3c";
const GOLD = "#c3a068";

function Bow({ openRef, color = GOLD }: { openRef: React.RefObject<number>; color?: string }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const open = openRef.current ?? 0;
    if (left.current) {
      left.current.rotation.z = 0.35 + open * 0.4;
      left.current.rotation.y = -0.5 - open * 0.4;
      left.current.position.x = -0.28 - open * 0.22;
    }
    if (right.current) {
      right.current.rotation.z = -0.35 - open * 0.4;
      right.current.rotation.y = 0.5 + open * 0.4;
      right.current.position.x = 0.28 + open * 0.22;
    }
    if (knot.current) {
      knot.current.scale.setScalar(1 + Math.sin(open * Math.PI) * 0.1);
    }
  });

  const satin = (
    <meshPhysicalMaterial color={color} roughness={0.28} metalness={0.35} clearcoat={0.8} clearcoatRoughness={0.25} />
  );

  return (
    <group position={[0, 0.22, 0]}>
      <group ref={left} position={[-0.28, 0, 0]} rotation={[0, -0.5, 0.35]}>
        <mesh scale={[1, 0.62, 1]} castShadow>
          <torusGeometry args={[0.36, 0.055, 18, 48]} />
          {satin}
        </mesh>
      </group>
      <group ref={right} position={[0.28, 0, 0]} rotation={[0, 0.5, -0.35]}>
        <mesh scale={[1, 0.62, 1]} castShadow>
          <torusGeometry args={[0.36, 0.055, 18, 48]} />
          {satin}
        </mesh>
      </group>
      <mesh ref={knot} castShadow>
        <sphereGeometry args={[0.115, 24, 24]} />
        {satin}
      </mesh>
      <mesh position={[0, -0.28, 0.02]} rotation={[0.18, 0, 0.1]} castShadow>
        <boxGeometry args={[0.09, 0.62, 0.03]} />
        {satin}
      </mesh>
      <mesh position={[0, -0.28, -0.02]} rotation={[-0.18, 0, -0.1]} castShadow>
        <boxGeometry args={[0.09, 0.62, 0.03]} />
        {satin}
      </mesh>
    </group>
  );
}

function Products({ revealRef }: { revealRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const reveal = revealRef.current ?? 0;
    const t = clock.getElapsedTime();
    group.current.position.y = -0.5 + reveal * 0.18 + Math.sin(t * 1.2) * 0.012;
    group.current.scale.setScalar(0.9 + reveal * 0.1);
  });

  return (
    <group ref={group} position={[0, -0.5, 0]}>
      <mesh position={[-0.82, 0.12, -0.12]} rotation={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.92, 0.2, 1.2]} />
        <meshStandardMaterial color="#e8dcc6" roughness={0.7} />
      </mesh>
      <mesh position={[-0.82, 0.235, -0.12]} rotation={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.86, 0.03, 1.14]} />
        <meshStandardMaterial color={NAVY} roughness={0.55} />
      </mesh>
      <mesh position={[0.12, 0.24, 0.28]} castShadow>
        <cylinderGeometry args={[0.17, 0.19, 1.05, 32]} />
        <meshPhysicalMaterial color={NAVY} roughness={0.35} metalness={0.25} clearcoat={0.6} />
      </mesh>
      <mesh position={[0.12, 0.8, 0.28]} castShadow>
        <cylinderGeometry args={[0.16, 0.17, 0.1, 32]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0.78, 0.17, -0.42]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.9, 18]} />
        <meshStandardMaterial color={GOLD} roughness={0.25} metalness={0.85} />
      </mesh>
      <mesh position={[0.78, 0.17, -0.2]} castShadow>
        <boxGeometry args={[0.42, 0.14, 0.28]} />
        <meshStandardMaterial color={IVORY_LIGHT} roughness={0.65} />
      </mesh>
    </group>
  );
}

function GiftBox({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const productsReveal = useRef(0);
  const openRef = useRef(0);
  const started = useRef(false);
  const startTime = useRef(0);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    if (!started.current) {
      started.current = true;
      startTime.current = t;
    }
    const elapsed = t - startTime.current;
    const raw = reduced ? 1 : Math.min(1, Math.max(0, (elapsed - 1.15) / 1.7));
    const open = 1 - Math.pow(1 - raw, 3);
    openRef.current = open;
    productsReveal.current = Math.max(0, Math.min(1, (elapsed - 1.5) / 1.4));

    const approach = reduced ? 1 : Math.min(1, elapsed / 2.2);
    const eased = 1 - Math.pow(1 - approach, 3);
    camera.position.z = 9.2 - 2.6 * eased;
    camera.position.y = 2.35 - 0.85 * eased;
    camera.lookAt(0, 0.15, 0);

    if (group.current) {
      group.current.position.y = Math.sin(t * 0.6) * 0.045 - (1 - eased) * 0.35;
      group.current.rotation.z = Math.sin(t * 0.35) * 0.008;
    }
    if (lid.current) {
      lid.current.position.y = 1.18 + open * 1.55;
      lid.current.position.z = open * 0.4;
      lid.current.position.x = open * 0.55;
      lid.current.rotation.x = open * 0.12;
      lid.current.rotation.z = open * 0.22;
    }
  });

  return (
    <group ref={group} position={[0, -0.1, 0]}>
      <group position={[0, -0.72, 0]}>
        <RoundedBox args={[3, 0.14, 2.2]} radius={0.05} smoothness={4} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY} roughness={0.55} metalness={0.04} clearcoat={0.35} />
        </RoundedBox>
      </group>
      <group>
        <mesh position={[-1.45, -0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 1.35, 2.2]} />
          <meshPhysicalMaterial color={IVORY} roughness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[1.45, -0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 1.35, 2.2]} />
          <meshPhysicalMaterial color={IVORY} roughness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, -0.06, -1.05]} castShadow receiveShadow>
          <boxGeometry args={[3, 1.35, 0.12]} />
          <meshPhysicalMaterial color={IVORY} roughness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, -0.06, 1.05]} castShadow receiveShadow>
          <boxGeometry args={[3, 1.35, 0.12]} />
          <meshPhysicalMaterial color={IVORY} roughness={0.55} clearcoat={0.3} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.8, 0.02, 2.0]} />
          <meshStandardMaterial color="#d9cbb4" roughness={0.85} />
        </mesh>
      </group>

      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 0.15, 1.13]} castShadow>
          <boxGeometry args={[0.28, 1.62, 0.03]} />
          <meshPhysicalMaterial color={NAVY} roughness={0.32} metalness={0.2} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.15, -1.13]} castShadow>
          <boxGeometry args={[0.28, 1.62, 0.03]} />
          <meshPhysicalMaterial color={NAVY} roughness={0.32} metalness={0.2} clearcoat={0.7} />
        </mesh>
      </group>

      <Products revealRef={productsReveal} />

      <group ref={lid} position={[0, 1.18, 0]}>
        <RoundedBox args={[3.12, 0.42, 2.32]} radius={0.07} smoothness={5} castShadow receiveShadow>
          <meshPhysicalMaterial color={IVORY_LIGHT} roughness={0.48} metalness={0.05} clearcoat={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.55, 1.75]} />
          <meshStandardMaterial color="#e9ddc9" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.222, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.26, 0.3, 48]} />
          <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.224, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <planeGeometry args={[0.22, 0.22]} />
          <meshStandardMaterial color={GOLD} metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.28, 0.44, 2.34]} />
          <meshPhysicalMaterial color={NAVY} roughness={0.32} metalness={0.2} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[3.14, 0.44, 0.28]} />
          <meshPhysicalMaterial color={NAVY} roughness={0.32} metalness={0.2} clearcoat={0.7} />
        </mesh>
        <group position={[0, 0.24, 0]}>
          <Bow openRef={openRef} />
        </group>
      </group>
    </group>
  );
}

function Particles() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(90);
    for (let i = 0; i < 30; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 8;
      array[i * 3 + 1] = (Math.random() - 0.2) * 4;
      array[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return array;
  }, []);

  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.y = clock.getElapsedTime() * 0.03;
    points.current.position.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.12;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={GOLD} size={0.035} sizeAttenuation transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

export default function GiftBoxScene({ reduced = false }: { reduced?: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      camera={{ position: [0, 2.35, 9.2], fov: 36 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.9} color="#fff7ea" />
        <directionalLight
          position={[5, 8, 6]}
          intensity={2.4}
          color="#fff3df"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-6, 3, -3]} intensity={0.8} color="#cfd8e8" />
        <spotLight position={[0, 7, 2]} angle={0.5} penumbra={1} intensity={1.5} color="#f3dfb8" />
        <PresentationControls
          cursor
          snap
          speed={1.1}
          zoom={1}
          rotation={[0.02, -0.32, 0]}
          polar={[-0.18, 0.28]}
          azimuth={[-0.7, 0.7]}
        >
          <GiftBox reduced={reduced} />
        </PresentationControls>
        <Particles />
        <ContactShadows position={[0, -0.85, 0]} opacity={0.42} scale={11} blur={2.6} far={4.5} color="#3b2f1e" />
      </Suspense>
    </Canvas>
  );
}
