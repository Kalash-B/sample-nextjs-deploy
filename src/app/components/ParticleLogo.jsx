"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function ParticleLogo() {
    const mountRef = useRef(null);

    useEffect(() => {
        const mount = mountRef.current;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#0f172a");

        const camera = new THREE.PerspectiveCamera(
            75,
            mount.clientWidth / mount.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 300;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mount.clientWidth, mount.clientHeight);
        mount.appendChild(renderer.domElement);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load("/logo.png", (imageTexture) => {
            const img = imageTexture.image;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, img.width, img.height);

            // Geometry for main logo
            const logoGeometry = new THREE.BufferGeometry();
            const logoPositions = [];
            const logoColors = [];

            const step = 20; // smaller step = denser grid for logo

            for (let y = 0; y < img.height; y += step) {
                for (let x = 0; x < img.width; x += step) {
                    const index = (y * img.width + x) * 4;
                    const alpha = imgData.data[index + 3];
                    if (alpha > 128) {
                        const color = new THREE.Color(
                            imgData.data[index] / 69,
                            imgData.data[index + 1] / 192,
                            imgData.data[index + 2] / 255
                        );
                        
                        logoColors.push(color.r, color.g, color.b);

                        // Give each logo particle some Z variation for 3D depth
                        const zDepth = (Math.random() - 0.5) * 50;

                        logoPositions.push(
                            (x - img.width / 2) * 1.5, // uniform grid structure
                            (-y + img.height / 2) * 1.5,
                            50
                        );
                    }
                }
            }

            logoGeometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(logoPositions, 3)
            );
            logoGeometry.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(logoColors, 3)
            );

            const logoMaterial = new THREE.PointsMaterial({
                size: 1.4,
                vertexColors: true,
            });

            const logoPoints = new THREE.Points(logoGeometry, logoMaterial);
            logoPoints.scale.set(0.13, 0.13, 0.13);
            scene.add(logoPoints);

            // -------------------------------
            // Background / surrounding particles
            // -------------------------------

            const bgGeometry = new THREE.BufferGeometry();
            const bgPositions = [];
            const bgColors = [];

            const bgParticleCount = 3500;

            // Get logo bounds
            const logoBoundingBox = new THREE.Box3().setFromObject(logoPoints);
            const logoRadius = logoBoundingBox.getSize(new THREE.Vector3()).length() / 2;

            const minRadius = logoRadius + 20; // start just outside logo
            const maxRadius = minRadius + 180; // spread outward

            for (let i = 0; i < bgParticleCount; i++) {
                const radius = 20 + Math.random() * (maxRadius - minRadius);
                const angle = Math.random() * Math.PI * 2;
                const height = (Math.random() - 0.5) * 180;

                // Position without extra density factor
                bgPositions.push(
                    radius * Math.cos(angle),
                    height,
                    radius * Math.sin(angle)
                );

                const color = new THREE.Color(0xffc045);
                bgColors.push(color.r, color.g, color.b);
            }

            bgGeometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(bgPositions, 3)
            );
            bgGeometry.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(bgColors, 3)
            );

            const bgMaterial = new THREE.PointsMaterial({
                size: 0.6,
                opacity: 0.7,
                transparent: true,
                vertexColors: true,
            });

            const bgPoints = new THREE.Points(bgGeometry, bgMaterial);
            scene.add(bgPoints);


            // -------------------------------
            // Interaction and animation
            // -------------------------------
            let targetRotationX = 0;
            let targetRotationY = 0;

            const onMouseMove = (event) => {
                const x = (event.clientX / window.innerWidth) * 2 - 1;
                const y = -(event.clientY / window.innerHeight) * 2 + 1;
                targetRotationY = x * 0.6;
                targetRotationX = y * 0.6;
            };

            window.addEventListener("mousemove", onMouseMove);

            // Floating animation (depth motion)
            const animateDepth = () => {
                const logoAttr = logoGeometry.attributes.position;
                for (let i = 0; i < logoAttr.count; i++) {
                    const z = logoAttr.getZ(i);
                    logoAttr.setZ(i, z + Math.sin(Date.now() * 0.001 + i) * 0.05);
                }
                logoAttr.needsUpdate = true;

                const bgAttr = bgGeometry.attributes.position;
                for (let i = 0; i < bgAttr.count; i++) {
                    const z = bgAttr.getZ(i);
                    bgAttr.setZ(i, z + Math.sin(Date.now() * 0.001 + i * 0.5) * 0.05);
                }
                bgAttr.needsUpdate = true;
            };

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                animateDepth();

                gsap.to(logoPoints.rotation, {
                    x: targetRotationX,
                    y: targetRotationY,
                    duration: 1,
                    ease: "power2.out",
                });

                gsap.to(bgPoints.rotation, {
                    x: targetRotationX * 0.3,
                    y: targetRotationY * 0.3,
                    duration: 2,
                    ease: "power1.out",
                });

                renderer.render(scene, camera);
            };
            animate();
        });

        // Handle resize
        const handleResize = () => {
            camera.aspect = mount.clientWidth / mount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mount.clientWidth, mount.clientHeight);
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
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
