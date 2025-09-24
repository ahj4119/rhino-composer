import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface ThreeViewerProps {
  geometryData?: any[];
  viewMode: "3d" | "top";
  className?: string;
}

export const ThreeViewer = ({ geometryData, viewMode, className }: ThreeViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>();
  const geometryGroupRef = useRef<THREE.Group>();
  const animationIdRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Scene 생성
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera 생성
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      100000
    );
    camera.position.set(15000, 10000, -15000);
    cameraRef.current = camera;

    // Renderer 생성
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 조명 추가
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10000, 15000, -5000);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10000, 8000, 5000);
    scene.add(directionalLight2);

    // 지오메트리 그룹 생성
    const geometryGroup = new THREE.Group();
    scene.add(geometryGroup);
    geometryGroupRef.current = geometryGroup;

    // 그리드 헬퍼 추가
    const gridHelper = new THREE.GridHelper(20000, 20, 0x888888, 0xcccccc);
    gridHelper.rotateX(Math.PI / 2);
    scene.add(gridHelper);

    // 축 헬퍼 추가
    const axesHelper = new THREE.AxesHelper(5000);
    scene.add(axesHelper);

    // 간단한 마우스 컨트롤 (Orbit Controls 없이)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
      };

      // 카메라 회전
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaMove.x * 0.01;
      spherical.phi += deltaMove.y * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      const factor = event.deltaY > 0 ? 1.1 : 0.9;
      camera.position.multiplyScalar(factor);
      camera.position.clampLength(1000, 50000);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // 렌더링 루프
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 윈도우 리사이즈 처리
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 지오메트리 데이터가 변경될 때 렌더링
  useEffect(() => {
    if (!geometryData || !geometryGroupRef.current) return;

    const geometryGroup = geometryGroupRef.current;
    
    // 기존 지오메트리 제거
    while (geometryGroup.children.length > 0) {
      const child = geometryGroup.children[0];
      geometryGroup.remove(child);
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.dispose();
      }
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    const colors = [
      0x8ecae6, 0x219ebc, 0x023047, 0xffb3ba, 0xffdfba,
      0xffffba, 0xbaffc9, 0xbae1ff, 0xf7d794, 0xe8b4cb
    ];

    let renderedCount = 0;

    geometryData.forEach((geoInfo, index) => {
      const color = colors[index % colors.length];
      
      try {
        if (geoInfo.vertices && geoInfo.faces && geoInfo.faces.length > 0) {
          // Mesh 렌더링
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
          geometryGroup.add(mesh);
          
          // 와이어프레임 추가
          const wireframe = new THREE.WireframeGeometry(geometry);
          const wireMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.2
          });
          const wireframeMesh = new THREE.LineSegments(wireframe, wireMaterial);
          geometryGroup.add(wireframeMesh);
          renderedCount++;
        }
        else if (geoInfo.curves && geoInfo.curves.length > 0) {
          // 곡선 렌더링
          geoInfo.curves.forEach((curve: number[][]) => {
            if (curve && curve.length > 1) {
              const points = curve.map(pt => new THREE.Vector3(pt[0], pt[1], pt[2]));
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const material = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 2
              });
              const line = new THREE.Line(geometry, material);
              geometryGroup.add(line);
              renderedCount++;
            }
          });
        }
        else if (geoInfo.vertices && geoInfo.vertices.length > 0) {
          // 점 렌더링
          geoInfo.vertices.forEach((vertex: number[]) => {
            const geometry = new THREE.SphereGeometry(50, 8, 6);
            const material = new THREE.MeshLambertMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(vertex[0], vertex[1], vertex[2]);
            geometryGroup.add(sphere);
            renderedCount++;
          });
        }
      } catch (error) {
        console.error('Error rendering geometry:', error, geoInfo);
      }
    });

    // 카메라 위치 조정
    if (renderedCount > 0 && cameraRef.current) {
      const box = new THREE.Box3().setFromObject(geometryGroup);
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxSize = Math.max(size.x, size.y, size.z);
        const distance = maxSize * 1.5;
        
        cameraRef.current.position.set(
          center.x + distance * 0.8,
          center.y + distance,
          center.z - distance * 0.8
        );
        cameraRef.current.lookAt(center);
      }
    }
  }, [geometryData]);

  // 뷰 모드 변경 처리
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    
    if (viewMode === "top") {
      camera.position.set(0, 20000, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(15000, 10000, -15000);
      camera.lookAt(0, 0, 0);
    }
  }, [viewMode]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '400px' }}
    />
  );
};