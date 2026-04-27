import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                           + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    sum += amp * snoise(p * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  
  vec2 mouseInfluence = (uMouse - 0.5) * 0.15;
  vec2 p = uv * aspect * 2.0;
  p += mouseInfluence;
  
  float t = uTime * 0.08;
  
  float n1 = fbm(p + vec2(t * 0.3, t * 0.2));
  float n2 = fbm(p * 1.3 + vec2(-t * 0.25, t * 0.15) + n1 * 0.4);
  float n3 = fbm(p * 0.6 + vec2(t * 0.15, -t * 0.25) + n2 * 0.25);
  
  float liquid = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  
  // Cream white base
  vec3 baseColor = vec3(0.98, 0.973, 0.96); // #FAF8F5
  
  // Soft warm accent colors - very subtle
  vec3 warmGold = vec3(1.0, 0.95, 0.88);
  vec3 softLavender = vec3(0.95, 0.93, 0.98);
  vec3 mintGreen = vec3(0.93, 0.97, 0.95);
  
  vec3 color = baseColor;
  color = mix(color, warmGold, smoothstep(-0.5, 0.5, n1) * 0.06);
  color = mix(color, softLavender, smoothstep(-0.3, 0.7, n2) * 0.05);
  color = mix(color, mintGreen, smoothstep(-0.4, 0.6, n3) * 0.04);
  
  // Very subtle highlight
  float highlight = pow(max(0.0, n1 + n2 * 0.5), 3.0) * 0.03;
  color += vec3(highlight * 0.5, highlight * 0.45, highlight * 0.4);
  
  // Vignette - very light
  float vignette = 1.0 - length((uv - 0.5) * 0.8);
  vignette = smoothstep(0.0, 0.8, vignette);
  color *= 0.92 + vignette * 0.08;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

function SoftPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      const targetX = mouseRef.current.x;
      const targetY = mouseRef.current.y;
      material.uniforms.uMouse.value.x += (targetX - material.uniforms.uMouse.value.x) * 0.02;
      material.uniforms.uMouse.value.y += (targetY - material.uniforms.uMouse.value.y) * 0.02;
    }
  });

  useMemo(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = 1.0 - e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    const handleResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [uniforms]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[3, 3]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function FluidBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: '#FAF8F5',
      }}
    >
      <Canvas
        orthographic
        camera={{ left: -1, right: 1, top: 1, bottom: -1, near: 0, far: 1, position: [0, 0, 0.5] }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#FAF8F5']} />
        <SoftPlane />
      </Canvas>
    </div>
  );
}
