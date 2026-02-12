import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as THREE from "three";

interface DataPoint3D {
  x: number;
  y: number;
  z: number;
  label?: string;
  color?: string;
  size?: number;
}

interface ScatterChart3DProps {
  data: DataPoint3D[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  zLabel?: string;
}

const DataPointSphere = ({ point, index }: { point: DataPoint3D; index: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = point.y + Math.sin(state.clock.elapsedTime + index * 0.5) * 0.05;
    }
  });

  return (
    <group position={[point.x, point.y, point.z]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[point.size || 0.15, 16, 16]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : (point.color || "#1a1a1a")} 
          emissive={hovered ? "#333333" : "#000000"}
        />
      </mesh>
      {hovered && point.label && (
        <Html distanceFactor={10}>
          <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs border border-border whitespace-nowrap">
            {point.label}
          </div>
        </Html>
      )}
    </group>
  );
};

const Axes = ({ size = 5, xLabel, yLabel, zLabel }: { size?: number; xLabel?: string; yLabel?: string; zLabel?: string }) => {
  return (
    <group>
      {/* X Axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, size, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666666" />
      </line>
      <Text position={[size + 0.5, 0, 0]} fontSize={0.3} color="#888888">
        {xLabel || "X"}
      </Text>

      {/* Y Axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, size, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666666" />
      </line>
      <Text position={[0, size + 0.5, 0]} fontSize={0.3} color="#888888">
        {yLabel || "Y"}
      </Text>

      {/* Z Axis */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, 0, 0, size])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#666666" />
      </line>
      <Text position={[0, 0, size + 0.5]} fontSize={0.3} color="#888888">
        {zLabel || "Z"}
      </Text>

      {/* Grid */}
      <gridHelper args={[size * 2, 10, "#333333", "#222222"]} rotation={[0, 0, 0]} />
    </group>
  );
};

export const ScatterChart3D = ({ 
  data, 
  title = "3D Scatter Plot",
  xLabel = "Score",
  yLabel = "Time",
  zLabel = "Progress"
}: ScatterChart3DProps) => {
  // Normalize data to fit within the 3D space
  const normalizedData = useMemo(() => {
    const xMax = Math.max(...data.map(d => d.x));
    const yMax = Math.max(...data.map(d => d.y));
    const zMax = Math.max(...data.map(d => d.z));
    
    return data.map(d => ({
      ...d,
      x: (d.x / (xMax || 1)) * 4 - 2,
      y: (d.y / (yMax || 1)) * 4,
      z: (d.z / (zMax || 1)) * 4 - 2,
    }));
  }, [data]);

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 rounded-lg overflow-hidden bg-muted/30">
          <Canvas camera={{ position: [6, 6, 6], fov: 50 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <Axes size={4} xLabel={xLabel} yLabel={yLabel} zLabel={zLabel} />
            {normalizedData.map((point, index) => (
              <DataPointSphere key={index} point={point} index={index} />
            ))}
            <OrbitControls 
              enableZoom={true} 
              enablePan={true}
              minDistance={5}
              maxDistance={20}
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