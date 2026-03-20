// @ts-nocheck
"use client";

import React, { useRef, useEffect, useMemo, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/iphone17-pro.glb";

interface IPhone3DProps {
  videoSrc?: string;
  imageSrc?: string;
  className?: string;
  scrollProgress?: number;
}

const DISPLAY_WIDTH = 0.0676;
const DISPLAY_HEIGHT = 0.1457;
const DISPLAY_Z = 0.00348;
const DISPLAY_RADIUS = 0.0065;

const MODEL_SCALE = 13;

const roundedRectShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform vec2 uSize;
    uniform float uRadius;
    varying vec2 vUv;

    float roundedBoxSDF(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return length(max(q, 0.0)) - r;
    }

    void main() {
      vec2 p = (vUv - 0.5) * uSize;
      float d = roundedBoxSDF(p, uSize * 0.5, uRadius);
      if (d > 0.0) discard;
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `,
};

function createFallbackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1108;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 512, 1108);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.35, "#16213e");
  gradient.addColorStop(0.65, "#0f3460");
  gradient.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 1108);

  ctx.fillStyle = "rgba(255,255,255,0.025)";
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1108;
    const r = Math.random() * 1.2 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = "600 32px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textAlign = "center";
  ctx.fillText("9:41", 256, 100);

  ctx.font = "400 17px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText("Sunday, March 8", 256, 130);

  ctx.font = "300 120px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("9:41", 256, 400);

  ctx.font = "400 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("Sunday, March 8", 256, 445);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function ScreenOverlay({ videoSrc, imageSrc }: { videoSrc?: string; imageSrc?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const fallback = createFallbackTexture();
    setTexture(fallback);

    if (videoSrc) {
      const video = document.createElement("video");
      video.src = videoSrc;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      const onCanPlay = () => {
        const vt = new THREE.VideoTexture(video);
        vt.minFilter = THREE.LinearFilter;
        vt.magFilter = THREE.LinearFilter;
        vt.colorSpace = THREE.SRGBColorSpace;
        setTexture(vt);
        fallback.dispose();
      };

      video.addEventListener("canplay", onCanPlay, { once: true });
      video.play().catch(() => {});

      return () => {
        video.removeEventListener("canplay", onCanPlay);
        video.pause();
        video.src = "";
      };
    } else if (imageSrc) {
      const loader = new THREE.TextureLoader();
      loader.load(imageSrc, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
        fallback.dispose();
      });
    }
  }, [videoSrc, imageSrc]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uSize: { value: new THREE.Vector2(DISPLAY_WIDTH, DISPLAY_HEIGHT) },
      uRadius: { value: DISPLAY_RADIUS },
    }),
    [texture]
  );

  useFrame(() => {
    if (meshRef.current && texture) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTexture.value = texture;
      if (texture instanceof THREE.VideoTexture) texture.needsUpdate = true;
    }
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, DISPLAY_Z]}>
      <planeGeometry args={[DISPLAY_WIDTH, DISPLAY_HEIGHT]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={roundedRectShader.vertexShader}
        fragmentShader={roundedRectShader.fragmentShader}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function PhoneModel({
  videoSrc,
  imageSrc,
  scrollProgress = 0,
}: {
  videoSrc?: string;
  imageSrc?: string;
  scrollProgress?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);

  const currentRot = useRef({ x: 0, y: 0, z: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.name === "Glass") {
          child.visible = false;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Normalize scroll: 0 = start of animation, 1 = settled
    const raw = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.25));
    const p = easeOutCubic(raw);

    // Scroll-driven rotation: spins from back-right to face-on
    const scrollRotX = lerp(Math.PI, 0, p);
    const scrollRotY = lerp(Math.PI / 2, 0, p);
    const scrollRotZ = lerp(0.25, 0, p);

    // Scroll-driven position: rises from below
    const scrollY = lerp(-2.5, 0, p);

    // Gentle idle float (only when settled)
    const idleAmount = p;
    const idleRotX = (Math.sin(t * 0.5) * 0.04 + Math.sin(t * 0.3) * 0.02) * idleAmount;
    const idleRotY = (Math.cos(t * 0.4) * 0.06 + Math.cos(t * 0.2) * 0.03) * idleAmount;
    const idleRotZ = Math.sin(t * 0.35) * 0.015 * idleAmount;
    const idleY = Math.sin(t * 0.6) * 0.012 * idleAmount;

    // Combine scroll + idle
    const targetX = scrollRotX + idleRotX;
    const targetY = scrollRotY + idleRotY;
    const targetZ = scrollRotZ + idleRotZ;
    const targetPosY = scrollY + idleY;

    // Smooth lerp toward targets
    currentRot.current.x += (targetX - currentRot.current.x) * 0.12;
    currentRot.current.y += (targetY - currentRot.current.y) * 0.12;
    currentRot.current.z += (targetZ - currentRot.current.z) * 0.12;
    currentPos.current.y += (targetPosY - currentPos.current.y) * 0.12;

    groupRef.current.rotation.x = currentRot.current.x;
    groupRef.current.rotation.y = currentRot.current.y;
    groupRef.current.rotation.z = currentRot.current.z;
    groupRef.current.position.y = currentPos.current.y;
  });

  return (
    <group ref={groupRef} scale={[MODEL_SCALE, MODEL_SCALE, MODEL_SCALE]}>
      <primitive object={clonedScene} />
      <ScreenOverlay videoSrc={videoSrc} imageSrc={imageSrc} />
    </group>
  );
}

function Scene({
  videoSrc,
  imageSrc,
  scrollProgress,
}: {
  videoSrc?: string;
  imageSrc?: string;
  scrollProgress: number;
}) {
  const { size } = useThree();
  const isMobile = size.width < 640;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, 3, 4]} intensity={0.35} />
      <directionalLight position={[0, -2, 3]} intensity={0.15} />
      <PhoneModel videoSrc={videoSrc} imageSrc={imageSrc} scrollProgress={scrollProgress} />
      {!isMobile && (
        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.12}
          scale={3}
          blur={2.5}
          far={3}
        />
      )}
    </>
  );
}

export default function IPhone3D({ videoSrc, imageSrc, className, scrollProgress = 0 }: IPhone3DProps) {
  return (
    <div className={className}>
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ position: [0, 0, 2.6], fov: 40 }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene videoSrc={videoSrc} imageSrc={imageSrc} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
