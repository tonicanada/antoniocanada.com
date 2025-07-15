import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function RelativityBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(10, 10, 64, 64);
    const material = new THREE.MeshBasicMaterial({
      color: 0xdddddd,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Deformación inicial
    const updateGeometry = () => {
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const x = geometry.attributes.position.getX(i);
        const y = geometry.attributes.position.getY(i);
        const z = 0.3 * Math.sin(x * 2) * Math.sin(y * 2);
        geometry.attributes.position.setZ(i, z);
      }
      geometry.attributes.position.needsUpdate = true;
    };
    updateGeometry();

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      mesh.rotation.z += 0.0005;
      mesh.rotation.x += 0.0003;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}
