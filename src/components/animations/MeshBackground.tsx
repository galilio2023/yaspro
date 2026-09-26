"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 100);
    camera.position.z = 3;

    // Mesh geometry — subdivided plane for fluid morph
    const geometry = new THREE.PlaneGeometry(6, 6, 32, 32);
    const positionAttr = geometry.attributes.position;
    const initialPositions = new Float32Array(positionAttr.array.length);
    initialPositions.set(positionAttr.array as Float32Array);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorA: { value: new THREE.Color("#9450ce") },
        uColorB: { value: new THREE.Color("#12c2e9") },
        uColorC: { value: new THREE.Color("#e7cbff") },
      },
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        varying vec2 vUv;
        varying float vElevation;

        // Classic Perlin noise helper
        vec4 permute(vec4 x) {
          return mod(((x * 34.0) + 1.0) * x, 289.0);
        }
        vec4 taylorInvSqrt(vec4 r) {
          return 1.79284291400159 - 0.85373472095314 * r;
        }
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod(i, 289.0);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
            i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          float noiseFreq = 1.8;
          float noiseAmp  = 0.35;
          vec3 noisePos   = vec3(pos.x * noiseFreq + uTime * 0.3,
                                  pos.y * noiseFreq,
                                  uTime * 0.15);

          pos.z += snoise(noisePos) * noiseAmp;

          // Subtle mouse influence
          float mouseInfluence = 0.06;
          pos.x += sin(uTime * 0.5 + pos.y) * mouseInfluence * uMouse.x;
          pos.y += cos(uTime * 0.4 + pos.x) * mouseInfluence * uMouse.y;

          vElevation = pos.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        varying vec2 vUv;
        varying float vElevation;

        void main() {
          float mixStrengthAB = (vElevation + 0.35) / 0.7;
          float mixStrengthBC = smoothstep(0.3, 0.7, vUv.x);

          vec3 colorAB = mix(uColorA, uColorB, clamp(mixStrengthAB, 0.0, 1.0));
          vec3 color   = mix(colorAB, uColorC, mixStrengthBC * 0.4);

          float alpha  = 0.12 + vElevation * 0.15;
          gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.25));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI * 0.3;
    scene.add(mesh);

    // Mouse tracking
    const mouse = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Resize
    const handleResize = () => {
      const rw = canvas.clientWidth || window.innerWidth;
      const rh = canvas.clientHeight || window.innerHeight;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop — use Timer (Clock is deprecated in r168+)
    const timer = new THREE.Timer();
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      timer.update();
      material.uniforms.uTime.value = timer.getElapsed();
      material.uniforms.uMouse.value.lerp(mouse, 0.05);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
