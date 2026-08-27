// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Text, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

const SPEED = 5;
const WORLD_HALF = 95;
const ASSETS_PATH = '/assets/3d/';

// ============================================================
// UTILITY
// ============================================================
function getCharacterUrl(type) {
    if (type === 'soldier') return `${ASSETS_PATH}Soldier.glb`;
    if (type === 'xbot') return `${ASSETS_PATH}Xbot.glb`;
    return `${ASSETS_PATH}RobotExpressive.glb`;
}

// ============================================================
// CHARACTER MODEL  (Proper skeleton clone + animation)
// ============================================================
function CharacterModel({ url, isWalking, name, type }) {
    const group = useRef();
    const { scene, animations } = useGLTF(url);

    // SkeletonUtils.clone preserves bone bindings so animations work
    const cloned = useMemo(() => {
        const c = cloneSkeleton(scene);
        c.traverse(n => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        return c;
    }, [scene]);

    const { actions } = useAnimations(animations, group);

    useEffect(() => {
        if (!actions || Object.keys(actions).length === 0) return;
        const names = Object.keys(actions);
        const find = (keys) => {
            const n = names.find(a => keys.some(k => a.toLowerCase().includes(k)));
            return n ? actions[n] : null;
        };

        Object.values(actions).forEach(a => a.stop());
        const walk = find(['walk', 'run']);
        const idle = find(['idle', 'stand']);
        const target = (isWalking && walk) ? walk : (idle || actions[names[0]]);
        if (target) target.reset().fadeIn(0.25).play();
        return () => { if (target) target.fadeOut(0.25); };
    }, [isWalking, actions]);

    // Soldier faces -Z natively, Robot and Xbot face +Z. 
    // We add 180 degrees (Math.PI) rotation for Robot/Xbot so they all face -Z consistently.
    const modelRotation = type === 'soldier' ? 0 : Math.PI;

    return (
        <group ref={group} rotation={[0, modelRotation, 0]}>
            <primitive object={cloned} />
            <Text position={[0, 2.3, 0]} fontSize={0.28} color="white"
                  anchorX="center" anchorY="middle"
                  outlineWidth={0.04} outlineColor="#000">
                {name}
            </Text>
        </group>
    );
}

// ============================================================
// PROCEDURAL WORLD  – large open terrain like Roblox
// ============================================================

function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#7ca858" roughness={0.92} />
        </mesh>
    );
}

function SpawnPlaza() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <circleGeometry args={[7, 32]} />
                <meshStandardMaterial color="#999" roughness={0.7} />
            </mesh>
        </group>
    );
}

function Lake({ position, radius }) {
    return (
        <group position={position}>
            {/* shore */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[radius, radius + 3, 48]} />
                <meshStandardMaterial color="#c2b280" roughness={1} />
            </mesh>
            {/* water */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[radius, 48]} />
                <meshStandardMaterial color="#2389da" transparent opacity={0.72} roughness={0.05} metalness={0.4} />
            </mesh>
        </group>
    );
}

function Mountain({ position, height, radius, color = '#6b5b4f' }) {
    return (
        <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
            <coneGeometry args={[radius, height, 10]} />
            <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
    );
}

function Building({ position, w, h, d, color }) {
    return (
        <group position={position}>
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {/* roof */}
            <mesh position={[0, h, 0]} castShadow>
                <coneGeometry args={[Math.max(w, d) * 0.7, 2, 4]} />
                <meshStandardMaterial color="#7a4a2a" roughness={0.9} />
            </mesh>
            {/* door */}
            <mesh position={[0, 0.9, d / 2 + 0.01]}>
                <planeGeometry args={[1, 1.8]} />
                <meshStandardMaterial color="#3e2b1a" />
            </mesh>
        </group>
    );
}

function Tree({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.22, 3, 6]} />
                <meshStandardMaterial color="#5c4033" />
            </mesh>
            <mesh position={[0, 3.6, 0]} castShadow>
                <sphereGeometry args={[1.2, 6, 5]} />
                <meshStandardMaterial color="#2a8c2a" flatShading />
            </mesh>
        </group>
    );
}

function Rock({ position, s }) {
    return (
        <mesh position={[position[0], s * 0.35, position[2]]} scale={s} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#777" roughness={0.95} flatShading />
        </mesh>
    );
}

function Road({ from, to, width = 4 }) {
    const dx = to[0] - from[0], dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dx, dz);
    return (
        <mesh rotation={[-Math.PI / 2, 0, ang]}
              position={[(from[0] + to[0]) / 2, 0.015, (from[2] + to[2]) / 2]} receiveShadow>
            <planeGeometry args={[width, len]} />
            <meshStandardMaterial color="#555" roughness={0.95} />
        </mesh>
    );
}

// Deterministic pseudo-random
function seededRandom(seed) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }

function WorldEnvironment() {
    const trees = useMemo(() => {
        const a = [];
        for (let i = 0; i < 70; i++) {
            const x = (seededRandom(i * 13.37) - 0.5) * 170;
            const z = (seededRandom(i * 7.42 + 99) - 0.5) * 170;
            const dc = Math.sqrt(x * x + z * z);
            const dl = Math.sqrt((x - 40) ** 2 + (z - 30) ** 2);
            if (dc > 12 && dl > 20 && Math.abs(x) > 4 && Math.abs(z) > 4) a.push([x, 0, z]);
        }
        return a;
    }, []);

    const rocks = useMemo(() => {
        const a = [];
        for (let i = 0; i < 30; i++) {
            const x = (seededRandom(i * 5.55 + 200) - 0.5) * 160;
            const z = (seededRandom(i * 3.33 + 300) - 0.5) * 160;
            a.push({ pos: [x, 0, z], s: 0.3 + seededRandom(i * 2.22 + 400) * 1 });
        }
        return a;
    }, []);

    return (
        <>
            {/* Sky + Lighting */}
            <Sky sunPosition={[100, 50, 100]} turbidity={6} rayleigh={1.2} />
            <ambientLight intensity={0.45} />
            <hemisphereLight args={['#87CEEB', '#7ca858', 0.3]} />
            <directionalLight castShadow position={[60, 80, 40]} intensity={1.4}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={250}
                shadow-camera-left={-120} shadow-camera-right={120}
                shadow-camera-top={120}  shadow-camera-bottom={-120} />

            {/* Fog hides world edges */}
            <fog attach="fog" args={['#c0d8e0', 50, 160]} />

            {/* Terrain */}
            <Ground />
            <SpawnPlaza />

            {/* Water */}
            <Lake position={[40, 0, 30]} radius={14} />
            <Lake position={[-50, 0, 50]} radius={8} />

            {/* Mountains (ring around edges) */}
            <Mountain position={[-85, 0, -85]} height={50} radius={28} color="#6b5b4f" />
            <Mountain position={[-55, 0, -92]} height={38} radius={20} color="#7b6b5f" />
            <Mountain position={[-95, 0, -35]} height={32} radius={22} color="#5b4b3f" />
            <Mountain position={[88, 0, -78]} height={44} radius={26} color="#6b5b4f" />
            <Mountain position={[96, 0, -25]} height={30} radius={18} color="#7b6b5f" />
            <Mountain position={[85, 0, 75]}  height={38} radius={24} color="#5b4b3f" />
            <Mountain position={[-78, 0, 88]} height={40} radius={24} color="#6b5b4f" />
            <Mountain position={[25, 0, -90]} height={28} radius={16} color="#7b6b5f" />
            <Mountain position={[-35, 0, 92]} height={34} radius={20} color="#5b4b3f" />
            <Mountain position={[92, 0, 30]}  height={26} radius={16} color="#7b6b5f" />

            {/* Town */}
            <Building position={[-16, 0, -26]} w={6} h={7} d={6} color="#bc8f8f" />
            <Building position={[-26, 0, -18]} w={5} h={5} d={7} color="#cd853f" />
            <Building position={[-18, 0, -38]} w={8} h={10} d={7} color="#a0522d" />
            <Building position={[14, 0, -30]}  w={5} h={6} d={5} color="#d2b48c" />
            <Building position={[24, 0, -24]}  w={6} h={8} d={6} color="#8b7355" />
            <Building position={[-30, 0, -32]} w={4} h={4} d={4} color="#c4a882" />

            {/* Roads */}
            <Road from={[-95, 0, 0]} to={[95, 0, 0]} />
            <Road from={[0, 0, -95]} to={[0, 0, 95]} />
            <Road from={[-16, 0, -16]} to={[24, 0, -24]} width={3} />

            {/* Nature */}
            {trees.map((p, i) => <Tree key={`t${i}`} position={p} />)}
            {rocks.map((r, i) => <Rock key={`r${i}`} position={r.pos} s={r.s} />)}
        </>
    );
}

// ============================================================
// LOCAL PLAYER CONTROLS — RE4 Over-The-Shoulder Camera
// ============================================================
function LocalPlayerControls({ sendMovement, updateSpatialAudio, joystickInput, characterType, playerName }) {
    const { camera, gl } = useThree();
    const playerGroup = useRef();
    const playerPos = useRef(new THREE.Vector3(0, 0, 0));
    const yaw = useRef(0);          // horizontal look angle
    const pitch = useRef(0.3);      // vertical look angle (slightly above)
    const meshYaw = useRef(0);      // character visual rotation
    const wasWalking = useRef(false);
    const lastSend = useRef(0);
    const isLocked = useRef(false);
    const [walking, setWalking] = useState(false);
    const keysRef = useRef({ w: false, a: false, s: false, d: false });

    // ---------- Input handlers ----------
    useEffect(() => {
        const onKeyDown = (e) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            const k = e.key.toLowerCase();
            if (k in keysRef.current) keysRef.current[k] = true;
        };
        const onKeyUp = (e) => {
            const k = e.key.toLowerCase();
            if (k in keysRef.current) keysRef.current[k] = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // ---- PC: Pointer Lock ----
        const cvs = gl.domElement;
        const onDown = () => {
            if (document.activeElement?.tagName !== 'INPUT') cvs.requestPointerLock?.();
        };
        const onLock = () => { isLocked.current = document.pointerLockElement === cvs; };
        const onMouse = (e) => {
            if (!isLocked.current) return;
            yaw.current   -= e.movementX * 0.003;
            pitch.current  = THREE.MathUtils.clamp(pitch.current + e.movementY * 0.002, -0.6, 1.0);
        };
        cvs.addEventListener('mousedown', onDown);
        document.addEventListener('pointerlockchange', onLock);
        document.addEventListener('mousemove', onMouse);

        // ---- Mobile: touch-to-rotate on right half ----
        let tid = null, lx = 0, ly = 0;
        const tStart = (e) => {
            for (const t of e.changedTouches) {
                if (t.clientX > window.innerWidth * 0.4 && tid === null) {
                    tid = t.identifier; lx = t.clientX; ly = t.clientY; break;
                }
            }
        };
        const tMove = (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === tid) {
                    yaw.current  -= (t.clientX - lx) * 0.005;
                    pitch.current = THREE.MathUtils.clamp(pitch.current + (t.clientY - ly) * 0.005, -0.6, 1.0);
                    lx = t.clientX; ly = t.clientY; break;
                }
            }
        };
        const tEnd = (e) => { for (const t of e.changedTouches) if (t.identifier === tid) tid = null; };
        cvs.addEventListener('touchstart', tStart, { passive: true });
        cvs.addEventListener('touchmove',  tMove,  { passive: true });
        cvs.addEventListener('touchend',   tEnd,   { passive: true });

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            cvs.removeEventListener('mousedown', onDown);
            document.removeEventListener('pointerlockchange', onLock);
            document.removeEventListener('mousemove', onMouse);
            cvs.removeEventListener('touchstart', tStart);
            cvs.removeEventListener('touchmove',  tMove);
            cvs.removeEventListener('touchend',   tEnd);
        };
    }, [gl.domElement]);

    // ---------- Frame loop ----------
    useFrame((_, delta) => {
        const keys = keysRef.current;
        const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);

        // Movement velocity
        const vel = new THREE.Vector3();
        if (keys.w) vel.add(new THREE.Vector3(0, 0, -1).applyQuaternion(yawQ));
        if (keys.s) vel.add(new THREE.Vector3(0, 0,  1).applyQuaternion(yawQ));
        if (keys.a) vel.add(new THREE.Vector3(-1, 0, 0).applyQuaternion(yawQ));
        if (keys.d) vel.add(new THREE.Vector3( 1, 0, 0).applyQuaternion(yawQ));

        // Joystick
        const ji = joystickInput.current;
        if (ji && (Math.abs(ji.x) > 0.1 || Math.abs(ji.y) > 0.1)) {
            vel.add(new THREE.Vector3(ji.x, 0, ji.y).applyQuaternion(yawQ));
        }

        const isWalk = vel.lengthSq() > 0.001;
        if (isWalk) {
            // Target angle: where the character is actually moving
            const targetAngle = Math.atan2(vel.x, vel.z) + Math.PI; // +PI because -Z is forward
            
            // Smoothly rotate character mesh towards movement direction
            let diff = targetAngle - meshYaw.current;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            meshYaw.current += diff * 0.15;

            vel.normalize().multiplyScalar(SPEED * delta);
            playerPos.current.add(vel);
            playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x, -WORLD_HALF, WORLD_HALF);
            playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z, -WORLD_HALF, WORLD_HALF);
        }
        playerPos.current.y = 0; // always on ground

        // Update character group imperatively (no React re-render)
        if (playerGroup.current) {
            playerGroup.current.position.copy(playerPos.current);
            playerGroup.current.rotation.set(0, meshYaw.current, 0);
        }

        // ---- OTS Camera ----
        const dist = 4;
        const baseH = 1.8;
        // "behind" vector in xz plane
        const bx = Math.sin(yaw.current) * dist;
        const bz = Math.cos(yaw.current) * dist;
        // slight right-shoulder offset
        const rx = Math.cos(yaw.current) * 0.7;
        const rz = -Math.sin(yaw.current) * 0.7;

        const targetCam = new THREE.Vector3(
            playerPos.current.x + bx + rx,
            playerPos.current.y + baseH + pitch.current * 2.5,
            playerPos.current.z + bz + rz
        );
        camera.position.lerp(targetCam, 0.12);

        // Look ahead of the player (past their shoulder)
        const lx2 = playerPos.current.x - Math.sin(yaw.current) * 3;
        const lz2 = playerPos.current.z - Math.cos(yaw.current) * 3;
        camera.lookAt(lx2, playerPos.current.y + 1.3, lz2);

        // Network Sync (Throttle to ~10 packets per second max, plus state changes)
        const now = Date.now();
        let shouldSend = false;
        
        if (isWalk && now - lastSend.current > 100) {
            shouldSend = true;
        } else if (isWalk !== wasWalking.current) {
            // State changed (started or stopped walking)
            shouldSend = true;
        }

        if (isWalk !== wasWalking.current) { 
            wasWalking.current = isWalk; 
            setWalking(isWalk); 
        }

        if (shouldSend) {
            sendMovement({ x: playerPos.current.x, y: 0, z: playerPos.current.z }, { y: meshYaw.current }, isWalk);
            lastSend.current = now;
        }

        if (updateSpatialAudio) updateSpatialAudio(camera.position);
    });

    return (
        <group ref={playerGroup}>
            <React.Suspense fallback={null}>
                <CharacterModel url={getCharacterUrl(characterType)} isWalking={walking} name={playerName} type={characterType} />
            </React.Suspense>
        </group>
    );
}

// ============================================================
// REMOTE PLAYER
// ============================================================
function RemotePlayer({ player }) {
    const g = useRef();
    useFrame(() => {
        if (!g.current || !player.position) return;
        g.current.position.lerp(new THREE.Vector3(player.position.x || 0, 0, player.position.z || 0), 0.15);
        // smooth rotation
        const targetY = (player.rotation?.y || 0);
        const euler = new THREE.Euler().setFromQuaternion(g.current.quaternion);
        let diff = targetY - euler.y;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        euler.y += diff * 0.15;
        g.current.quaternion.setFromEuler(euler);
    });
    return (
        <group ref={g}>
            <React.Suspense fallback={null}>
                <CharacterModel url={getCharacterUrl(player.characterType)} isWalking={player.isWalking} name={player.name} type={player.characterType} />
            </React.Suspense>
        </group>
    );
}

// ============================================================
// EXPORT
// ============================================================
export default function WorldCanvas({ players, sendMovement, updateSpatialAudio, joystickInput, currentUserData }) {
    return (
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 55, near: 0.1, far: 300 }} gl={{ antialias: true }}>
            <WorldEnvironment />
            <LocalPlayerControls
                sendMovement={sendMovement}
                updateSpatialAudio={updateSpatialAudio}
                joystickInput={joystickInput}
                characterType={currentUserData?.characterType || 'robot'}
                playerName={currentUserData?.username || 'You'}
            />
            {Object.values(players.current || {}).map(p => <RemotePlayer key={p.id} player={p} />)}
        </Canvas>
    );
}
