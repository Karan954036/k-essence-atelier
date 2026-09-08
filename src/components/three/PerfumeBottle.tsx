import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

type Props = {
  /** Real GLB/GLTF model uploaded from Admin. Falls back to the crafted bottle. */
  modelUrl?: string;
  tint?: string;
  pointer?: React.RefObject<{ x: number; y: number }>;
  spin?: boolean;
};

function LoadedModel({ url, pointer, spin }: { url: string } & Omit<Props, "modelUrl">) {
  const { scene } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = group.current;
    if (!g) return;
    if (spin) g.rotation.y += dt * 0.18;
    const p = pointer?.current;
    if (p) {
      g.rotation.y += (p.x * 0.35 - (g.rotation.y % (Math.PI * 2)) * 0) * dt * 0.6;
      g.rotation.x += (-p.y * 0.18 - g.rotation.x) * (1 - Math.exp(-3 * dt));
    }
  });
  return <primitive ref={group} object={scene} />;
}

/**
 * Crafted glass flacon used until a product's real 3D model is uploaded.
 * Deliberately abstract: it is a stylised vessel, not a claim of the exact bottle.
 */
function CraftedBottle({ tint = "#3a2416", pointer, spin = true }: Omit<Props, "modelUrl">) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = group.current;
    if (!g) return;
    if (spin) g.rotation.y += dt * 0.16;
    const p = pointer?.current;
    const targetX = p ? -p.y * 0.2 : 0;
    const targetZ = p ? p.x * 0.08 : 0;
    g.rotation.x += (targetX - g.rotation.x) * (1 - Math.exp(-3 * dt));
    g.rotation.z += (targetZ - g.rotation.z) * (1 - Math.exp(-3 * dt));
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
  });

  return (
    <group ref={group} position={[0, -0.15, 0]}>
      {/* body */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.15, 1.5, 0.55]} />
        <meshPhysicalMaterial
          color={tint}
          transparent
          opacity={0.9}
          roughness={0.06}
          metalness={0}
          transmission={0.82}
          thickness={1.4}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationColor={tint}
          attenuationDistance={1.1}
        />
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.42, 0.28, 48]} />
        <meshPhysicalMaterial
          color={tint}
          transparent
          opacity={0.9}
          roughness={0.08}
          transmission={0.8}
          thickness={0.8}
          ior={1.5}
        />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.2, 40]} />
        <meshStandardMaterial color="#c8a24a" metalness={1} roughness={0.28} />
      </mesh>
      {/* gold cap */}
      <mesh castShadow position={[0, 1.48, 0]}>
        <cylinderGeometry args={[0.27, 0.29, 0.36, 48]} />
        <meshStandardMaterial color="#e2c179" metalness={1} roughness={0.16} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial color="#f0d79c" metalness={1} roughness={0.12} />
      </mesh>
      {/* gold label plate */}
      <mesh position={[0, 0.2, 0.285]}>
        <planeGeometry args={[0.52, 0.62]} />
        <meshStandardMaterial color="#0d0b09" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0.288]}>
        <ringGeometry args={[0.2, 0.215, 48]} />
        <meshStandardMaterial color="#d8b467" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}

export function PerfumeBottle({ modelUrl, ...rest }: Props) {
  if (modelUrl) return <LoadedModel url={modelUrl} {...rest} />;
  return <CraftedBottle {...rest} />;
}
