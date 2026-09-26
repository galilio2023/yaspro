"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface RocketAndHexBallCanvasProps {
  className?: string;
}

export function RocketAndHexBallCanvas({ className }: RocketAndHexBallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting (metallic silver chrome highlights & cyber-purple glow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa5b4fc, 1.8);
    fillLight.position.set(-6, -4, -3);
    scene.add(fillLight);

    const purpleGlowLight = new THREE.PointLight(0xc084fc, 3.5, 12);
    purpleGlowLight.position.set(-1.8, 1, 1.5);
    scene.add(purpleGlowLight);

    const cyanGlowLight = new THREE.PointLight(0x38bdf8, 3.5, 12);
    cyanGlowLight.position.set(1.8, -1, 1.5);
    scene.add(cyanGlowLight);

    // Materials
    const silverChromeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.16,
    });

    const brushedTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.88,
      roughness: 0.35,
    });

    const neonPurpleMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.9 });
    const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.65 });

    // ==========================================
    // 1. SILVER HEXAGONAL PERFORATED HOLLOW BALL
    // ==========================================
    const ballGroup = new THREE.Group();
    ballGroup.position.set(-1.6, 0, 0);

    // Geodesic outer silver hull
    const outerGeo = new THREE.IcosahedronGeometry(1.15, 2);
    const outerMesh = new THREE.Mesh(outerGeo, silverChromeMat);
    ballGroup.add(outerMesh);

    // Hollow dark interior chamber visible inside the cutouts
    const innerGeo = new THREE.SphereGeometry(1.1, 24, 24);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9, roughness: 0.5, side: THREE.BackSide });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    ballGroup.add(innerMesh);

    // Glowing energy core inside the perforated ball
    const coreGeo = new THREE.SphereGeometry(0.72, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, innerCoreMat);
    ballGroup.add(coreMesh);

    // Distributed Hexagonal Holes/Ports around the sphere
    const hexCount = 36;
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < hexCount; i++) {
      const y = 1 - (i / (hexCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const hexPort = new THREE.Group();
      hexPort.position.set(x * 1.15, y * 1.15, z * 1.15);
      hexPort.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, y, z).normalize());

      // Hexagonal outer rim
      const ringGeo = new THREE.RingGeometry(0.12, 0.19, 6);
      const ringMesh = new THREE.Mesh(ringGeo, silverChromeMat);
      hexPort.add(ringMesh);

      // Hollow dark perforation hole
      const holeGeo = new THREE.CircleGeometry(0.12, 6);
      const holeMesh = new THREE.Mesh(holeGeo, innerMat);
      holeMesh.position.z = -0.01;
      hexPort.add(holeMesh);

      // Neon cyan accent rim inside every second hole
      if (i % 2 === 0) {
        const cyanRimGeo = new THREE.RingGeometry(0.06, 0.1, 6);
        const cyanRimMesh = new THREE.Mesh(cyanRimGeo, neonCyanMat);
        cyanRimMesh.position.z = 0.01;
        hexPort.add(cyanRimMesh);
      }

      ballGroup.add(hexPort);
    }

    // Outer orbital holographic ring revolving around the hex ball
    const ringOrbitGeo = new THREE.TorusGeometry(1.65, 0.015, 16, 64);
    const ringOrbitMesh = new THREE.Mesh(ringOrbitGeo, neonCyanMat);
    ringOrbitMesh.rotation.x = Math.PI / 3;
    ballGroup.add(ringOrbitMesh);

    scene.add(ballGroup);

    // ==========================================
    // 2. HUGE ANIMATED SILVER ROCKET
    // ==========================================
    const rocketGroup = new THREE.Group();
    rocketGroup.position.set(1.5, 0, 0);
    rocketGroup.rotation.set(0.2, -0.4, 0.1);

    // Main fuselage (Silver Chrome Cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.36, 0.58, 2.0, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, silverChromeMat);
    bodyMesh.position.y = 0.45;
    rocketGroup.add(bodyMesh);

    // Aerodynamic Nose Cone (High-Gloss Silver Chrome)
    const noseGeo = new THREE.ConeGeometry(0.36, 0.95, 32);
    const noseMesh = new THREE.Mesh(noseGeo, silverChromeMat);
    noseMesh.position.y = 1.925;
    rocketGroup.add(noseMesh);

    // Glowing tip sensor
    const tipGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const tipMesh = new THREE.Mesh(tipGeo, neonCyanMat);
    tipMesh.position.y = 2.42;
    rocketGroup.add(tipMesh);

    // Futuristic Cockpit Porthole Glass
    const windowRingGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.09, 24);
    const windowRingMesh = new THREE.Mesh(windowRingGeo, brushedTitaniumMat);
    windowRingMesh.position.set(0, 0.75, 0.42);
    windowRingMesh.rotation.x = 0.12;
    rocketGroup.add(windowRingMesh);

    const windowGlassGeo = new THREE.CircleGeometry(0.15, 24);
    const windowGlassMesh = new THREE.Mesh(windowGlassGeo, neonCyanMat);
    windowGlassMesh.position.set(0, 0.75, 0.47);
    windowGlassMesh.rotation.x = 0.12;
    rocketGroup.add(windowGlassMesh);

    // Cyber Rings around the fuselage
    const upperRingGeo = new THREE.TorusGeometry(0.52, 0.02, 16, 32);
    const upperRingMesh = new THREE.Mesh(upperRingGeo, neonPurpleMat);
    upperRingMesh.position.y = 0.05;
    rocketGroup.add(upperRingMesh);

    const lowerRingGeo = new THREE.TorusGeometry(0.58, 0.02, 16, 32);
    const lowerRingMesh = new THREE.Mesh(lowerRingGeo, neonCyanMat);
    lowerRingMesh.position.y = -0.38;
    rocketGroup.add(lowerRingMesh);

    // 3 Aerodynamic Stabilizer Fins (120 degrees apart)
    [0, 120, 240].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const finHolder = new THREE.Group();
      finHolder.rotation.y = rad;

      const finGeo = new THREE.BoxGeometry(0.48, 0.75, 0.04);
      const finMesh = new THREE.Mesh(finGeo, brushedTitaniumMat);
      finMesh.position.set(0.66, -0.65, 0);
      finMesh.rotation.z = -0.38;
      finHolder.add(finMesh);

      const edgeGeo = new THREE.BoxGeometry(0.04, 0.74, 0.05);
      const edgeMesh = new THREE.Mesh(edgeGeo, neonPurpleMat);
      edgeMesh.position.set(0.9, -0.76, 0);
      edgeMesh.rotation.z = -0.38;
      finHolder.add(edgeMesh);

      rocketGroup.add(finHolder);
    });

    // Engine Exhaust Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.46, 0.38, 0.4, 32);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, brushedTitaniumMat);
    nozzleMesh.position.y = -0.75;
    rocketGroup.add(nozzleMesh);

    // Pulsating Ion Thruster Flame
    const flameGeo = new THREE.ConeGeometry(0.35, 1.1, 24);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = -1.55;
    flameMesh.rotation.x = Math.PI;
    rocketGroup.add(flameMesh);

    const thrusterPointLight = new THREE.PointLight(0x06b6d4, 4, 5);
    thrusterPointLight.position.y = -1.3;
    rocketGroup.add(thrusterPointLight);

    scene.add(rocketGroup);

    // ==========================================
    // 3. BACKGROUND COSMIC STAR DUST
    // ==========================================
    const starCount = 140;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 14;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      const isPurple = Math.random() > 0.5;
      starColors[i * 3] = isPurple ? 0.75 : 0.2;
      starColors[i * 3 + 1] = isPurple ? 0.35 : 0.75;
      starColors[i * 3 + 2] = 1.0;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.85 });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Mouse movement tracking
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // 1. Animate Hex Ball: Continuous 3D tumble & core oscillation
      ballGroup.rotation.y += 0.008;
      ballGroup.rotation.x += 0.004;
      ringOrbitMesh.rotation.z += 0.012;
      coreMesh.rotation.y -= 0.015;
      const coreScale = 0.72 + Math.sin(elapsedTime * 3) * 0.05;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      // Subtle float response
      ballGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.12;

      // 2. Animate Silver Rocket: Floating oscillation, gentle tilt with mouse, and thruster pulse
      rocketGroup.position.y = Math.cos(elapsedTime * 2.2) * 0.16;
      rocketGroup.rotation.x = THREE.MathUtils.lerp(rocketGroup.rotation.x, 0.2 + mouseY * 0.25, 0.05);
      rocketGroup.rotation.y = THREE.MathUtils.lerp(rocketGroup.rotation.y, -0.4 + mouseX * 0.35, 0.05);

      // Rocket flame flicker
      const flicker = 1 + Math.sin(elapsedTime * 24) * 0.16 + (Math.random() - 0.5) * 0.08;
      flameMesh.scale.set(1, flicker * 1.15, 1);
      thrusterPointLight.intensity = 3.5 * flicker;

      // Rotate stars
      starPoints.rotation.y += 0.0006;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        className ??
        "relative w-full h-[260px] sm:h-[300px] md:h-[340px] overflow-hidden flex items-center justify-center pointer-events-auto"
      }
      style={{ touchAction: "none" }}
    >
      {!isClient && <div className="size-full animate-pulse bg-white/[0.02]" />}
    </div>
  );
}
