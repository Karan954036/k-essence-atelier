import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import { PerfumeBottle } from "./PerfumeBottle";

type Props = {
  modelUrl?: string | undefined;
  tint?: string | undefined;
  /** Cinematic mode adds floating motes and a wider camera. */
  variant?: "hero" | "compact" | "viewer" | undefined;
  controls?: boolean | undefined;
  className?: string | undefined;
};

function Motes() {
  const positions = Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2;
    return [
      Math.cos(a) * (1.4 + (i % 5) * 0.28),
      -1 + ((i * 7) % 33) / 11,
      Math.sin(a) * (1.1 + (i % 4) * 0.3),
    ] as const;
  });
  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[0.012 + (i % 3) * 0.005, 8, 8]} />
          <meshBasicMaterial color="#e6c988" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function BottleStage({
  modelUrl,
  tint,
  variant = "hero",
  controls = false,
  className,
}: Props) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const camZ = variant === "compact" ? 4.6 : variant === "viewer" ? 4.2 : 4.9;

  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0.35, camZ], fov: 38 }}
    >
      <ambientLight intensity={0.35} />
      <spotLight
        position={[0.6, 5, 2.4]}
        angle={0.32}
        penumbra={0.9}
        intensity={45}
        color="#ffe9bd"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2.6, 0.4, 1.6]} intensity={7} color="#b98a3f" />
      <pointLight position={[2.4, -0.8, -1.4]} intensity={4} color="#6d3a2a" />

      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 4, 1]} scale={[6, 6, 1]} color="#fff2d8" />
        <Lightformer
          intensity={1.1}
          color="#c69a52"
          position={[-4, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[14, 2, 1]}
        />
        <Lightformer
          intensity={0.7}
          color="#4b2c1c"
          position={[4, -1, 1]}
          rotation-y={-Math.PI / 2}
          scale={[14, 2, 1]}
        />
      </Environment>

      <Suspense fallback={null}>
        <PerfumeBottle modelUrl={modelUrl} tint={tint} pointer={pointer} spin={!controls} />
      </Suspense>

      {variant === "hero" && <Motes />}

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.75}
        scale={7}
        blur={2.8}
        far={3.2}
        color="#000000"
      />

      {controls && (
        <OrbitControls
          enablePan={false}
          minDistance={2.6}
          maxDistance={6.5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.7}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </Canvas>
  );
}
