import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, RoundedBox, ContactShadows, Text } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

interface NanoTraceProps {
  isCharging: boolean;
  isSOS: boolean;
  xRayMode: boolean;
  isTampered: boolean;
}

function Device({ isCharging, isSOS, xRayMode, isTampered }: NanoTraceProps) {
  const coilRef = useRef<THREE.Mesh>(null);
  const sosLightRef = useRef<THREE.PointLight>(null);
  const chargeLightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const sipRef = useRef<THREE.Mesh>(null);
  const tamperLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Charging pulse effect (breathing emerald green)
    if (isCharging && chargeLightRef.current && coilRef.current) {
      const intensity = (Math.sin(time * 3) + 1) / 2; // 0 to 1
      chargeLightRef.current.intensity = intensity * 2;
      (coilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity * 2;
    } else if (chargeLightRef.current && coilRef.current) {
      chargeLightRef.current.intensity = 0;
      (coilRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
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
      
      (sipRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0xff0000);
      (sipRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = flash * 3;
      
      tamperLightRef.current.intensity = flash * 5;
    } else if (meshRef.current && sipRef.current && tamperLightRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x3b82f6);
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
      
      (sipRef.current.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
      (sipRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      
      tamperLightRef.current.intensity = 0;
    }
  });

  // Dimensions: 25mm x 8mm x 2.5mm -> Scaled to 2.5 x 0.8 x 0.25 for Three.js
  return (
    <group rotation={[0, Math.PI / 4, 0]}>
      {/* Primary Housing (Smoked Polycarbonate) - Fixed X-Ray */}
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

      {/* Capacitive Integrity Mesh (Anti-Tamper) */}
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
        {/* Flex PCB */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[2.3, 0.6, 0.01]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
        </mesh>

        {/* The Brain: Nordic nRF9160 SiP */}
        <mesh ref={sipRef} position={[-0.8, 0, 0.02]}>
          <boxGeometry args={[0.4, 0.4, 0.06]} />
          <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.2} />
        </mesh>
        {/* SiP Gold Contacts/Details */}
        <mesh position={[-0.8, 0, 0.051]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial color="#d4af37" roughness={0.4} metalness={0.8} wireframe={true} />
        </mesh>

        {/* Radio Module / Antenna Trace */}
        <mesh position={[-0.4, 0, 0.02]}>
          <planeGeometry args={[0.3, 0.5]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={1} wireframe={true} />
        </mesh>

        {/* Power Cell: Solid-state battery */}
        <mesh position={[0.2, 0, 0.02]}>
          <boxGeometry args={[0.8, 0.5, 0.08]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.3} />
        </mesh>

        {/* Induction Coil: Copper spiral */}
        <mesh ref={coilRef} position={[0.9, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 16, 32]} />
          <meshStandardMaterial 
            color="#b87333" 
            emissive="#10b981" 
            emissiveIntensity={0} 
            metalness={0.8} 
            roughness={0.4} 
          />
        </mesh>

        {/* Audio System: Piezo-electric plate */}
        <mesh position={[-0.2, 0.2, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Integrity Mic (Anti-Tamper Sensor) */}
        <mesh position={[-0.4, 0.2, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#ff3333" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* SOS LED Indicator */}
        <mesh position={[-0.8, 0.25, 0.05]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color={isSOS ? "#fbbf24" : "#333"} />
        </mesh>

        {/* Tamper Text Overlay (Visible only when tampered) */}
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
