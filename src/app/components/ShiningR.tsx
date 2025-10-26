"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { gsap } from "gsap";

export default function ShiningR() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return; // exit if ref is not yet attached


    // Basic scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a");

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(30, 30, 50);
    scene.add(pointLight);

    // Load font and create the letter "R"
    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
      const textGeometry = new TextGeometry("R", {
        font,
        size: 30,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 0.8,
        bevelOffset: 0,
        bevelSegments: 5,
      });

      textGeometry.center();

      // Base material (matte)
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x0055ff,
        roughness: 0.5,
        metalness: 0.4,
      });

      // Edge "shine" material (glow)
      const edgeMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          baseColor: { value: new THREE.Color(0x0055ff) },
          glowColor: { value: new THREE.Color(0xffffcc) },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 baseColor;
          uniform vec3 glowColor;
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            // Compute "angle" of vertex in XZ plane for a rotating sweep
            float angle = atan(vPosition.z, vPosition.x);
            float shineAngle = mod(time, 6.28318); // full rotation 0..2PI
            float diff = abs(shineAngle - angle);
            float intensity = smoothstep(0.25, 0.0, diff); // width of shine

            vec3 color = mix(baseColor, glowColor, intensity);
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      });

      // Combine two meshes (base + shining edges)
      const baseMesh = new THREE.Mesh(textGeometry, baseMaterial);
      const glowMesh = new THREE.Mesh(textGeometry, edgeMaterial);
      scene.add(baseMesh);
      scene.add(glowMesh);

      // Animation: shine rotates around the letter
      const animate = () => {
        requestAnimationFrame(animate);
        edgeMaterial.uniforms.time.value += 0.02; // control shine speed
        renderer.render(scene, camera);
      };

      animate();
    });

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "radial-gradient(circle at center, #0f172a 60%, #000 100%)",
      }}
    />
  );
}
