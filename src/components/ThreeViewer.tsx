import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

interface ThreeViewerProps {
  geometryData?: any[];
  viewMode: "3d" | "top";
  className?: string;
}

interface GeometryRendererProps {
  geometryData?: any[];
}

const GeometryRenderer = ({ geometryData }: GeometryRendererProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, controls } = useThree();

  const colors = [
    0x8ecae6, 0x219ebc, 0x023047, 0xffb3ba, 0xffdfba,
    0xffffba, 0xbaffc9, 0xbae1ff, 0xf7d794, 0xe8b4cb
  ];

  useEffect(() => {
    if (!geometryData || !groupRef.current) return;

    const group = groupRef.current;
    
    // Clear existing geometry
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material?.dispose();
        }
      }
    }

    let renderedCount = 0;

    geometryData.forEach((geoInfo, index) => {
      const color = colors[index % colors.length];
      
      try {
        if (geoInfo.vertices && geoInfo.faces && geoInfo.faces.length > 0) {
          // Mesh rendering
          const geometry = new THREE.BufferGeometry();
          
          const vertices = new Float32Array(geoInfo.vertices.flat());
          geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
          
          const indices = new Uint16Array(geoInfo.faces.flat());
          geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          
          geometry.computeVertexNormals();
          
          const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          group.add(mesh);
          
          // Wireframe
          const wireframe = new THREE.WireframeGeometry(geometry);
          const wireMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.2
          });
          const wireframeMesh = new THREE.LineSegments(wireframe, wireMaterial);
          group.add(wireframeMesh);
          renderedCount++;
        }
        else if (geoInfo.curves && geoInfo.curves.length > 0) {
          // Curve rendering
          geoInfo.curves.forEach((curve: number[][]) => {
            if (curve && curve.length > 1) {
              const points = curve.map(pt => new THREE.Vector3(pt[0], pt[1], pt[2]));
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2
              });
              const line = new THREE.Line(geometry, material);
              group.add(line);
              renderedCount++;
            }
          });
        }
        else if (geoInfo.vertices && geoInfo.vertices.length > 0) {
          // Point rendering
          geoInfo.vertices.forEach((vertex: number[]) => {
            const geometry = new THREE.SphereGeometry(50, 8, 6);
            const material = new THREE.MeshLambertMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(vertex[0], vertex[1], vertex[2]);
            group.add(sphere);
            renderedCount++;
          });
        }
      } catch (error) {
        console.error('Error rendering geometry:', error, geoInfo);
      }
    });

    // Adjust camera position
    if (renderedCount > 0) {
      const box = new THREE.Box3().setFromObject(group);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 1.5;
        
        camera.position.set(
          center.x + distance * 0.8,
          center.y + distance,
          center.z - distance * 0.8
        );
        
        if (controls) {
          (controls as any).target = center;
          (controls as any).update();
        }
      }
    }
  }, [geometryData, camera, controls, colors]);

  return <group ref={groupRef} />;
};

interface CameraControllerProps {
  viewMode: "3d" | "top";
}

const CameraController = ({ viewMode }: CameraControllerProps) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (viewMode === "top") {
      camera.position.set(0, 20000, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(15000, 10000, -15000);
      camera.lookAt(0, 0, 0);
    }
    
    if (controls) {
      (controls as any).update();
    }
  }, [viewMode, camera, controls]);

  return null;
};

export const ThreeViewer = ({ geometryData, viewMode, className }: ThreeViewerProps) => {
  return (
    <div className={`w-full h-full ${className || ''}`} style={{ minHeight: '400px' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 100000,
          position: [15000, 10000, -15000]
        }}
        shadows
        gl={{ antialias: true }}
      >
        {/* Background */}
        <color attach="background" args={[0xf5f5f5]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} color={0x404040} />
        <directionalLight
          position={[10000, 15000, -5000]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight
          position={[-10000, 8000, 5000]}
          intensity={0.4}
        />
        
        {/* Grid and Axes */}
        <Grid
          args={[20000, 20]}
          rotation={[Math.PI / 2, 0, 0]}
          cellColor={0xcccccc}
          sectionColor={0x888888}
        />
        <primitive object={new THREE.AxesHelper(5000)} />
        
        {/* Geometry */}
        <GeometryRenderer geometryData={geometryData} />
        
        {/* Camera Controller */}
        <CameraController viewMode={viewMode} />
        
        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={50000}
          minDistance={100}
        />
      </Canvas>
    </div>
  );
};