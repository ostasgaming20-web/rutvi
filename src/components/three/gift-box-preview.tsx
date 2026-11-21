"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export const BOX_COLORS: Record<string, string> = {
  Navy: "#13294b",
  Ivory: "#efe4d2",
  Charcoal: "#2b2a27",
  Sand: "#d9c6a7",
  Blush: "#d8b8ae",
  Olive: "#5c6047",
  Cognac: "#8a5a36",
};

export const RIBBON_COLORS: Record<string, string> = {
  Gold: "#c3a068",
  Navy: "#0d1f3c",
  Ivory: "#f3ead9",
  Burgundy: "#6d2434",
  Black: "#1b1a17",
};

function LogoPlate({ text, boxColor }: { text: string; boxColor: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 1024, 640);

    const dark = ["Navy", "Charcoal", "Cognac", "Olive"].includes(boxColor);
    const ink = dark ? "rgba(248,245,239,0.92)" : "rgba(20,19,15,0.82)";
    const soft = dark ? "rgba(248,245,239,0.45)" : "rgba(20,19,15,0.4)";

    ctx.strokeStyle = dark ? "rgba(227,207,166,0.65)" : "rgba(195,160,104,0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(120, 120, 784, 400);

    ctx.fillStyle = ink;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 64px Manrope, Arial, sans-serif";
    const label = (text || "YOUR LOGO").slice(0, 22).toUpperCase();
    ctx.fillText(label, 512, 300);

    ctx.fillStyle = soft;
    ctx.font = "500 26px Manrope, Arial, sans-serif";
    ctx.fillText("C O R P O R A T E   G I F T I N G", 512, 372);

    ctx.fillStyle = dark ? "rgba(227,207,166,0.8)" : "rgba(195,160,104,0.9)";
    ctx.beginPath();
    ctx.moveTo(512, 200);
    ctx.lineTo(536, 224);
    ctx.lineTo(512, 248);
    ctx.lineTo(488, 224);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [text, boxColor]);

  return (
    <mesh position={[0, 0.216, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.55, 1.6]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  );
}

function PreviewBox({
  boxColor,
  ribbonColor,
  logoText,
}: {
  boxColor: string;
  ribbonColor: string;
  logoText: string;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.position.y = Math.sin(clock.getElapsedTime() * 0.9) * 0.035;
    }
  });

  return (
    <group ref={group} position={[0, -0.25, 0]}>
      <RoundedBox args={[3, 1.5, 2.2]} radius={0.06} smoothness={4} position={[0, 0, 0]} castShadow receiveShadow>
        <meshPhysicalMaterial color={boxColor} roughness={0.52} metalness={0.06} clearcoat={0.45} clearcoatRoughness={0.4} />
      </RoundedBox>

      <mesh position={[0, 0.16, 1.11]} castShadow>
        <boxGeometry args={[0.26, 1.52, 0.03]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
      </mesh>
      <mesh position={[0, 0.16, -1.11]} castShadow>
        <boxGeometry args={[0.26, 1.52, 0.03]} />
        <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
      </mesh>

      <group position={[0, 0.9, 0]}>
        <RoundedBox args={[3.1, 0.34, 2.3]} radius={0.06} smoothness={4} castShadow receiveShadow>
          <meshPhysicalMaterial color={boxColor} roughness={0.5} metalness={0.06} clearcoat={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.86, 2.06]} />
          <meshStandardMaterial color={boxColor} roughness={0.6} />
        </mesh>
        <LogoPlate text={logoText} boxColor={boxColor} />
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.26, 0.36, 2.32]} />
          <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[3.12, 0.36, 0.26]} />
          <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
        </mesh>
        <group position={[0, 0.22, 0]}>
          <mesh position={[-0.2, 0, 0]} rotation={[0, -0.5, 0.4]} scale={[1, 0.62, 1]} castShadow>
            <torusGeometry args={[0.3, 0.05, 16, 40]} />
            <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
          </mesh>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0.5, -0.4]} scale={[1, 0.62, 1]} castShadow>
            <torusGeometry args={[0.3, 0.05, 16, 40]} />
            <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
          </mesh>
          <mesh castShadow>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshPhysicalMaterial color={ribbonColor} roughness={0.3} metalness={0.28} clearcoat={0.7} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function GiftBoxPreview({
  boxColor = "Navy",
  ribbonColor = "Gold",
  logoText = "YOUR LOGO",
}: {
  boxColor?: string;
  ribbonColor?: string;
  logoText?: string;
}) {
  const box = BOX_COLORS[boxColor] ?? boxColor;
  const ribbon = RIBBON_COLORS[ribbonColor] ?? ribbonColor;

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.6]}
      camera={{ position: [4.6, 3.4, 5.6], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.1} color="#fff8ee" />
        <directionalLight position={[5, 7, 4]} intensity={2.2} color="#fff3df" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[-4, 3, -4]} intensity={0.7} color="#cfd8e8" />
        <spotLight position={[0, 6, 3]} angle={0.6} penumbra={1} intensity={1.2} color="#f3dfb8" />
        <PreviewBox boxColor={box} ribbonColor={ribbon} logoText={logoText} />
        <ContactShadows position={[0, -1.0, 0]} opacity={0.35} scale={9} blur={2.4} far={4} color="#3b2f1e" />
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          minDistance={4.6}
          maxDistance={8}
          minPolarAngle={0.7}
          maxPolarAngle={1.35}
          target={[0, 0.1, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
