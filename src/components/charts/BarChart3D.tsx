import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as THREE from "three";

interface BarData3D {
  label: string;
  value: number;
  color?: string;
}

interface BarChart3DProps {
  data: BarData3D[];
  title?: string;
  maxValue?: number;
}

const Bar3D = ({ 
  position, 
  height, 
  color, 
  label, 
  value 
}: { 
  position: [number, number, number]; 
  height: number; 
  color: string; 
  label: string; 
  value: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [targetHeight, setTargetHeight] = useState(0);

  useFrame(() => {
    if (meshRef.current) {
      // Animate height
      const currentScale = meshRef.current.scale.y;
      const targetScale = height;
      meshRef.current.scale.y = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
      meshRef.current.position.y = meshRef.current.scale.y / 2;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : color} 
          emissive={hovered ? "#333333" : "#000000"}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <Text 
        position={[0, -0.3, 0.6]} 
        fontSize={0.25} 
        color="#888888"
        rotation={[-0.3, 0, 0]}
      >
        {label}
      </Text>
      {hovered && (
        <Html position={[0, height + 0.5, 0]} distanceFactor={10}>
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs border border-border whitespace-nowrap">
            {label}: {value}
          </div>
        </Html>
      )}
    </group>
  );
};

const FloorGrid = ({ size = 10 }: { size?: number }) => {
  return (
    <group>
      <gridHelper args={[size, 10, "#333333", "#222222"]} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#111111" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export const BarChart3D = ({ 
  data, 
  title = "3D Bar Chart",
  maxValue
}: BarChart3DProps) => {
  const max = maxValue || Math.max(...data.map(d => d.value));
  const spacing = 1.5;
  const startX = -((data.length - 1) * spacing) / 2;

  const colors = [
    "#1a1a1a", "#2a2a2a", "#3a3a3a", "#4a4a4a", "#5a5a5a"
  ];

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 rounded-lg overflow-hidden bg-muted/30">
          <Canvas camera={{ position: [5, 5, 8], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <spotLight position={[0, 10, 0]} intensity={0.5} />
            <FloorGrid size={data.length * spacing + 4} />
            {data.map((item, index) => (
              <Bar3D
                key={item.label}
                position={[startX + index * spacing, 0, 0]}
                height={(item.value / max) * 4}
                color={item.color || colors[index % colors.length]}
                label={item.label}
                value={item.value}
              />
            ))}
            <OrbitControls 
              enableZoom={true} 
              enablePan={true}
              minDistance={5}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.1}
            />
          </Canvas>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Drag to rotate • Scroll to zoom
        </p>
      </CardContent>
    </Card>
  );
};