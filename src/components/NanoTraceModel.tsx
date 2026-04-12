import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, RoundedBox, ContactShadows, Text, Html } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface NanoTraceProps {
  isCharging: boolean;
  isSOS: boolean;
  xRayMode: boolean;
  isTampered: boolean;
}

// Helper component for sleek cyber-labels
function ComponentLabel({ text, position, visible }: { text: string, position: [number, number, number], visible: boolean }) {
  if (!visible) return null;
  return (
    <Html position={position} center className="pointer-events-none z-50">
      <div className="flex flex-col items-center">
        <div className="px-2 py-1 bg-black/90 border border-neutral-700 text-neutral-300 text-[9px] font-mono whitespace-nowrap rounded shadow-lg backdrop-blur-md tracking-wider">
          {text}
        </div>
        <div className="w-px h-4 bg-gradient-to-b from-neutral-500 to-transparent"></div>
      </div>
    </Html>
  );
}

function Device({ isCharging, isSOS, xRayMode, isTampered }: NanoTraceProps) {
  const coilRef = useRef<THREE.Group>(null);
  const sosLightRef = useRef<THREE.PointLight>(null);
  const chargeLightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const sipRef = useRef<THREE.Group>(null);
  const tamperLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Charging pulse effect (breathing emerald green)
    if (isCharging && chargeLightRef.current && coilRef.current) {
      const intensity = (Math.sin(time * 3) + 1) / 2; // 0 to 1
      chargeLightRef.current.intensity = intensity * 2;
      coilRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 2;
        }
      });
    } else if (chargeLightRef.current && coilRef.current) {
      chargeLightRef.current.intensity = 0;
      coilRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      });
    }

    // SOS pulse effect (rapid amber pulse)
    if (isSOS && sosLightRef.current) {
      const pulse = Math.sin(time * 15) > 0 ? 1 : 0; // Rapid blink
      sosLightRef.current.intensity = pulse * 5;
    } else if (sosLightRef.current) {
      sosLightRef.current.intensity = 0;
    }

    // Tamper effect (Dead Man's Switch)
    if (isTampered && meshRef.current && sipRef.current && tamperLightRef.current) {
      const flash = Math.sin(time * 25) > 0 ? 1 : 0.2;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = flash * 2;
      
      sipRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = flash * 3;
        }
      });
      
      tamperLightRef.current.intensity = flash * 5;
    } else if (meshRef.current && sipRef.current && tamperLightRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x3b82f6);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
      
      sipRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
          (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      });
      
      tamperLightRef.current.intensity = 0;
    }
  });

  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Primary Housing */}
      <RoundedBox args={[2.5, 0.8, 0.25]} radius={0.05} smoothness={4}>
        <meshPhysicalMaterial 
          color={xRayMode ? "#ffffff" : "#1a1a1a"}
          transparent={true}
          opacity={xRayMode ? 0.15 : 0.9}
          roughness={xRayMode ? 0.1 : 0.3}
          metalness={0.2}
          depthWrite={!xRayMode}
          side={THREE.DoubleSide}
        />
      </RoundedBox>

      {/* Capacitive Integrity Mesh */}
      <RoundedBox args={[2.45, 0.75, 0.2]} radius={0.04} smoothness={2} ref={meshRef}>
        <meshStandardMaterial 
          color="#3b82f6" 
          wireframe={true} 
          transparent={true}
          opacity={xRayMode || isTampered ? 0.4 : 0.02}
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </RoundedBox>

      {/* Internal Hardware Group */}
      <group position={[0, 0, 0]}>
        {/* Flex PCB Base */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[2.3, 0.6, 0.01]} />
          <meshStandardMaterial color="#0a150a" roughness={0.8} />
        </mesh>

        {/* Tiny SMD Components scattered on PCB */}
        {[
          [-0.5, 0.2, 0.01], [-0.6, -0.2, 0.01], [0.4, 0.2, 0.01], 
          [0.5, -0.2, 0.01], [-0.2, -0.2, 0.01], [0.7, 0.2, 0.01]
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <boxGeometry args={[0.04, 0.02, 0.015]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#b87333" : "#444"} metalness={0.8} roughness={0.2} />
          </mesh>
        ))}

        {/* The Brain: Nordic nRF9160 SiP (Detailed) */}
        <group ref={sipRef} position={[-0.8, 0, 0.02]}>
          {/* Substrate */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.45, 0.45, 0.02]} />
            <meshStandardMaterial color="#0a2a1a" roughness={0.9} />
          </mesh>
          {/* Main Die */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.35, 0.35, 0.03]} />
            <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Micro-pins around edges */}
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.48, 0.48]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} wireframe={true} />
          </mesh>
          <ComponentLabel text="nRF9160 SiP (LTE-M/GPS)" position={[0, 0.35, 0]} visible={xRayMode} />
        </group>

        {/* Radio Module / Meandering Antenna Trace */}
        <group position={[-0.4, 0, 0.02]}>
          <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.2, 0.02, 0.01]}/><meshStandardMaterial color="#d4af37" metalness={1}/></mesh>
          <mesh position={[0.09, 0.075, 0]}><boxGeometry args={[0.02, 0.15, 0.01]}/><meshStandardMaterial color="#d4af37" metalness={1}/></mesh>
          <mesh position={[0, 0, 0]}><boxGeometry args={[0.2, 0.02, 0.01]}/><meshStandardMaterial color="#d4af37" metalness={1}/></mesh>
          <mesh position={[-0.09, -0.075, 0]}><boxGeometry args={[0.02, 0.15, 0.01]}/><meshStandardMaterial color="#d4af37" metalness={1}/></mesh>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.2, 0.02, 0.01]}/><meshStandardMaterial color="#d4af37" metalness={1}/></mesh>
          <ComponentLabel text="BLE Antenna Trace" position={[0, 0.35, 0]} visible={xRayMode} />
        </group>

        {/* Power Cell: Solid-state battery (Detailed) */}
        <group position={[0.2, 0, 0.02]}>
          {/* Main Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.8, 0.45, 0.06]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.4} />
          </mesh>
          {/* Wrapper fold detail */}
          <mesh position={[0, 0, 0.031]}>
            <planeGeometry args={[0.7, 0.35]} />
            <meshStandardMaterial color="#a0a0a0" metalness={0.6} roughness={0.6} />
          </mesh>
          {/* Positive Terminal */}
          <mesh position={[-0.42, 0.1, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.01]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
          </mesh>
          {/* Negative Terminal */}
          <mesh position={[-0.42, -0.1, 0]}>
            <boxGeometry args={[0.04, 0.08, 0.01]} />
            <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
          </mesh>
          <ComponentLabel text="Solid-State Battery" position={[0, 0.35, 0]} visible={xRayMode} />
        </group>

        {/* Induction Coil: Multi-ring flat spiral */}
        <group ref={coilRef} position={[0.9, 0, 0.02]}>
          {[0.06, 0.09, 0.12, 0.15].map((radius, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[radius, 0.012, 16, 32]} />
              <meshStandardMaterial 
                color="#b87333" 
                emissive="#10b981" 
                emissiveIntensity={0} 
                metalness={0.9} 
                roughness={0.3} 
              />
            </mesh>
          ))}
          <ComponentLabel text="Qi-Induction Coil" position={[0, 0.35, 0]} visible={xRayMode} />
        </group>

        {/* Audio System: Piezo-electric plate (Detailed) */}
        <group position={[-0.2, 0.2, 0.04]}>
          {/* Outer Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.015, 32]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Inner vibrating plate */}
          <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.005, 32]} />
            <meshStandardMaterial color="#e0e0e0" metalness={0.4} roughness={0.7} />
          </mesh>
          <ComponentLabel text="Piezo Audio" position={[0, 0.15, 0]} visible={xRayMode} />
        </group>

        {/* Integrity Mic (Detailed) */}
        <group position={[-0.4, 0.2, 0.04]}>
          {/* Mic Housing */}
          <mesh>
            <boxGeometry args={[0.08, 0.08, 0.03]} />
            <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
          </mesh>
          {/* Mic Acoustic Hole */}
          <mesh position={[0, 0, 0.016]}>
            <circleGeometry args={[0.02, 16]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          <ComponentLabel text="Integrity Mic" position={[0, 0.15, 0]} visible={xRayMode} />
        </group>

        {/* SOS LED Indicator */}
        <mesh position={[-0.8, 0.25, 0.05]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={isSOS ? "#fbbf24" : "#333"} />
        </mesh>

        {/* Tamper Text Overlay */}
        {isTampered && (
          <Text 
            position={[-0.8, 0, 0.1]} 
            fontSize={0.1} 
            color="#ff0000" 
            anchorX="center" 
            anchorY="middle"
          >
            KEYS WIPED
          </Text>
        )}

        {/* Dynamic Lights */}
        <pointLight ref={chargeLightRef} position={[0.9, 0, 0.1]} color="#10b981" distance={1} decay={2} />
        <pointLight ref={sosLightRef} position={[-0.8, 0.25, 0.1]} color="#fbbf24" distance={1} decay={2} />
        <pointLight ref={tamperLightRef} position={[-0.8, 0, 0.1]} color="#ff0000" distance={2} decay={2} />
      </group>

      {/* Mounting Interface: Titanium Clip */}
      <group position={[0, 0, -0.15]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.8, 0.4, 0.04]} />
          <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.4} />
        </mesh>
        {/* Clip bend */}
        <mesh position={[0.9, 0, 0.04]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
          <meshStandardMaterial color="#888899" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export default function NanoTraceModel(props: NanoTraceProps) {
  return (
    <div className="w-full h-full bg-neutral-950 rounded-xl overflow-hidden relative border border-neutral-800">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        
        {/* Cyber-Noir Lighting */}
        <ambientLight intensity={0.2} />
        <spotLight position={[-5, 5, 5]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        
        {/* Blue Rim Light (Bluetooth) */}
        <pointLight position={[5, -2, -2]} intensity={5} color="#3b82f6" distance={10} />
        
        {/* Amber Rim Light (GPS) */}
        <pointLight position={[-5, -2, -2]} intensity={3} color="#f59e0b" distance={10} />

        <Environment preset="city" />
        
        <Device {...props} />
        
        <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          minDistance={2}
          maxDistance={6}
          autoRotate={!props.isCharging && !props.isSOS && !props.isTampered}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 text-xs font-mono text-neutral-500 pointer-events-none">
        <p>SCENE: CYBER-NOIR STUDIO</p>
        <p>RENDER: PBR WORKFLOW ACTIVE</p>
        <p>SCALE: 10:1 MACRO</p>
      </div>
    </div>
  );
}
