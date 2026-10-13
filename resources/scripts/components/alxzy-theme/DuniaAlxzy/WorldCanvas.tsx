// @ts-nocheck
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Text, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

const SPEED = 5.2;
const WORLD_HALF = 95;
const ASSETS_PATH = '/assets/3d/';

const GRAVITY = -24;
const JUMP_FORCE = 8.8;
const PLAYER_COLLISION_RADIUS = 0.55;

// ============================================================
// UTILITY
// ============================================================
function getCharacterUrl(type) {
    if (type === 'soldier') return `${ASSETS_PATH}Soldier.glb`;
    if (type === 'xbot') return `${ASSETS_PATH}Xbot.glb`;
    return `${ASSETS_PATH}RobotExpressive.glb`;
}

// Deterministic pseudo-random for natural world objects
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// ============================================================
// TOWN BUILDINGS & COLLIDERS DATA
// ============================================================
export const BUILDINGS_DATA = [
    {
        id: 'hq',
        name: 'ALXZY TOWER',
        subtitle: 'Main Headquarters',
        pos: [-18, 0, -42],
        w: 12,
        h: 17,
        d: 11,
        mainColor: '#1e293b',
        trimColor: '#38bdf8',
        type: 'tower',
    },
    {
        id: 'lab',
        name: 'SERVER LAB',
        subtitle: 'Quantum Nodes',
        pos: [20, 0, -36],
        w: 10,
        h: 8,
        d: 9,
        mainColor: '#0f172a',
        trimColor: '#10b981',
        type: 'lab',
    },
    {
        id: 'cafe',
        name: 'CYBER CAFE',
        subtitle: 'Food & Drinks',
        pos: [-28, 0, -20],
        w: 8,
        h: 6.5,
        d: 9,
        mainColor: '#78350f',
        trimColor: '#f59e0b',
        type: 'cafe',
    },
    {
        id: 'store',
        name: 'TECH STORE',
        subtitle: 'Hardware & Addons',
        pos: [-16, 0, -22],
        w: 9,
        h: 7,
        d: 8,
        mainColor: '#2e1065',
        trimColor: '#a855f7',
        type: 'store',
    },
    {
        id: 'hub',
        name: 'COMMUNITY HUB',
        subtitle: 'Player Lounge',
        pos: [16, 0, -22],
        w: 9,
        h: 7.5,
        d: 8,
        mainColor: '#334155',
        trimColor: '#06b6d4',
        type: 'hub',
    },
    {
        id: 'villa',
        name: 'RESIDENCE',
        subtitle: 'Sector A',
        pos: [28, 0, -18],
        w: 7.5,
        h: 6,
        d: 8,
        mainColor: '#3f3f46',
        trimColor: '#f43f5e',
        type: 'house',
    },
    {
        id: 'kiosk',
        name: 'INFO KIOSK',
        subtitle: 'Help Center',
        pos: [-32, 0, -34],
        w: 5,
        h: 4.5,
        d: 5,
        mainColor: '#1e293b',
        trimColor: '#22d3ee',
        type: 'kiosk',
    },
];

// Pre-calculate tree and rock colliders to match WorldEnvironment
const STATIC_TREES = [];
for (let i = 0; i < 70; i++) {
    const x = (seededRandom(i * 13.37) - 0.5) * 170;
    const z = (seededRandom(i * 7.42 + 99) - 0.5) * 170;
    const dc = Math.sqrt(x * x + z * z);
    const dl = Math.sqrt((x - 40) ** 2 + (z - 30) ** 2);
    if (dc > 12 && dl > 20 && Math.abs(x) > 4 && Math.abs(z) > 4) {
        STATIC_TREES.push([x, z]);
    }
}

const STATIC_ROCKS = [];
for (let i = 0; i < 30; i++) {
    const x = (seededRandom(i * 5.55 + 200) - 0.5) * 160;
    const z = (seededRandom(i * 3.33 + 300) - 0.5) * 160;
    const s = 0.3 + seededRandom(i * 2.22 + 400) * 1;
    STATIC_ROCKS.push({ x, z, radius: s * 0.85 });
}

// Unified Collision Detector (anti-tembus with outward-movement unstick support)
export function checkCollision(nextX, nextZ, currX = null, currZ = null) {
    // 1. World Boundaries
    if (Math.abs(nextX) > WORLD_HALF - 2 || Math.abs(nextZ) > WORLD_HALF - 2) {
        return true;
    }

    // 2. Central Fountain in Spawn Plaza (radius 3.0)
    const fountainRadius = 3.0;
    const dNext = Math.hypot(nextX, nextZ);
    if (dNext < fountainRadius) {
        if (currX !== null && currZ !== null) {
            const dCurr = Math.hypot(currX, currZ);
            // If already inside or moving outward away from center, ALLOW!
            if (dNext >= dCurr) {
                return false;
            }
        }
        return true;
    }

    // 3. Buildings (AABB with player radius padding)
    for (const b of BUILDINGS_DATA) {
        const halfW = b.w / 2 + PLAYER_COLLISION_RADIUS;
        const halfD = b.d / 2 + PLAYER_COLLISION_RADIUS;
        const minX = b.pos[0] - halfW;
        const maxX = b.pos[0] + halfW;
        const minZ = b.pos[2] - halfD;
        const maxZ = b.pos[2] + halfD;

        if (nextX >= minX && nextX <= maxX && nextZ >= minZ && nextZ <= maxZ) {
            if (currX !== null && currZ !== null) {
                if (currX >= minX && currX <= maxX && currZ >= minZ && currZ <= maxZ) {
                    return false; // allow unsticking if already inside
                }
            }
            return true;
        }
    }

    // 4. Lakes (deep water boundary)
    if (Math.hypot(nextX - 40, nextZ - 30) < 13.0) return true;
    if (Math.hypot(nextX - (-50), nextZ - 50) < 7.2) return true;

    // 5. Tree trunks
    for (const [tx, tz] of STATIC_TREES) {
        if (Math.hypot(nextX - tx, nextZ - tz) < 0.65) return true;
    }

    // 6. Large Rocks
    for (const r of STATIC_ROCKS) {
        if (r.radius > 0.6 && Math.hypot(nextX - r.x, nextZ - r.z) < r.radius + PLAYER_COLLISION_RADIUS * 0.4) {
            return true;
        }
    }

    return false;
}

// ============================================================
// CHARACTER MODEL (Fix T-Pose / Cross Glitch + Support Jump)
// ============================================================
function CharacterModel({ url, isWalking, isJumping, name, type }) {
    const group = useRef();
    const { scene, animations } = useGLTF(url);

    // SkeletonUtils.clone preserves bone bindings so animations work
    const cloned = useMemo(() => {
        const c = cloneSkeleton(scene);
        c.traverse(n => {
            if (n.isMesh) {
                n.castShadow = true;
                n.receiveShadow = true;
            }
        });
        return c;
    }, [scene]);

    const { actions } = useAnimations(animations, group);
    const activeAction = useRef(null);

    useEffect(() => {
        if (!actions || Object.keys(actions).length === 0) return;
        const names = Object.keys(actions);
        const find = (keys) => {
            const n = names.find(a => keys.some(k => a.toLowerCase().includes(k)));
            return n ? actions[n] : null;
        };

        const walk = find(['walk', 'run']);
        const idle = find(['idle', 'stand']);
        const jump = find(['jump']);

        let target = null;
        if (isJumping && jump) {
            target = jump;
        } else if (isWalking && walk) {
            target = walk;
        } else {
            target = idle || actions[names[0]];
        }

        if (target) {
            const prev = activeAction.current;
            if (prev !== target) {
                // Smooth cross-fade WITHOUT calling .stop() to prevent T-Pose / cross glitch
                if (prev) {
                    prev.fadeOut(0.2);
                }
                target.reset().fadeIn(0.2).play();
                activeAction.current = target;
            }
        }
    }, [isWalking, isJumping, actions]);

    useEffect(() => {
        return () => {
            if (activeAction.current) {
                activeAction.current.stop();
            }
        };
    }, []);

    // Soldier faces -Z natively, Robot and Xbot face +Z
    const modelRotation = type === 'soldier' ? 0 : Math.PI;

    return (
        <group ref={group} rotation={[0, modelRotation, 0]}>
            <primitive object={cloned} />
            <Text
                position={[0, 2.35, 0]}
                fontSize={0.28}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#000"
            >
                {name}
            </Text>
        </group>
    );
}

// ============================================================
// ARCHITECTURAL BUILDINGS & PROPS
// ============================================================

// High detail building with facade, glowing windows, entrance canopy, 3D signs, and rooftop features
function Building({ building }) {
    const { pos, w, h, d, mainColor, trimColor, name, subtitle, type } = building;

    return (
        <group position={pos}>
            {/* Foundation / Plinth */}
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w + 0.4, 0.4, d + 0.4]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>

            {/* Main Building Body */}
            <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={mainColor} roughness={0.7} metalness={0.15} />
            </mesh>

            {/* Horizontal Floor Trim Accents */}
            <mesh position={[0, h * 0.48, 0]}>
                <boxGeometry args={[w + 0.15, 0.25, d + 0.15]} />
                <meshStandardMaterial color={trimColor} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[0, h - 0.15, 0]}>
                <boxGeometry args={[w + 0.2, 0.35, d + 0.2]} />
                <meshStandardMaterial color="#334155" roughness={0.8} />
            </mesh>

            {/* Front Windows (Multi-tier) */}
            <group position={[0, 0, d / 2 + 0.02]}>
                {/* 1st / 2nd Floor Windows */}
                {[-w * 0.3, w * 0.3].map((wx, idx) => (
                    <group key={`wnd-${idx}`} position={[wx, h * 0.55, 0]}>
                        {/* Frame */}
                        <mesh>
                            <boxGeometry args={[1.6, 1.4, 0.06]} />
                            <meshStandardMaterial color="#020617" roughness={0.8} />
                        </mesh>
                        {/* Glowing Glass */}
                        <mesh position={[0, 0, 0.02]}>
                            <planeGeometry args={[1.4, 1.2]} />
                            <meshStandardMaterial color="#7dd3fc" roughness={0.1} metalness={0.5} emissive="#38bdf8" emissiveIntensity={0.35} />
                        </mesh>
                    </group>
                ))}

                {h > 9 && (
                    [-w * 0.3, w * 0.3].map((wx, idx) => (
                        <group key={`wnd-upper-${idx}`} position={[wx, h * 0.78, 0]}>
                            <mesh>
                                <boxGeometry args={[1.6, 1.4, 0.06]} />
                                <meshStandardMaterial color="#020617" roughness={0.8} />
                            </mesh>
                            <mesh position={[0, 0, 0.02]}>
                                <planeGeometry args={[1.4, 1.2]} />
                                <meshStandardMaterial color="#fef08a" roughness={0.1} metalness={0.5} emissive="#fef08a" emissiveIntensity={0.4} />
                            </mesh>
                        </group>
                    ))
                )}
            </group>

            {/* Entrance Doorway & Porch */}
            <group position={[0, 0, d / 2 + 0.02]}>
                {/* Door Frame */}
                <mesh position={[0, 1.3, 0]}>
                    <boxGeometry args={[2.2, 2.5, 0.08]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.9} />
                </mesh>
                {/* Glass / Metallic Double Door */}
                <mesh position={[0, 1.2, 0.03]}>
                    <planeGeometry args={[1.9, 2.2]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
                </mesh>
                {/* Door Handles */}
                <mesh position={[-0.1, 1.2, 0.06]}>
                    <boxGeometry args={[0.04, 0.4, 0.04]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
                </mesh>
                <mesh position={[0.1, 1.2, 0.06]}>
                    <boxGeometry args={[0.04, 0.4, 0.04]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Overhang Canopy */}
                <mesh position={[0, 2.7, 0.8]} castShadow>
                    <boxGeometry args={[3.2, 0.2, 1.7]} />
                    <meshStandardMaterial color={trimColor} metalness={0.4} roughness={0.4} />
                </mesh>
                {/* Canopy Support Pillars */}
                <mesh position={[-1.4, 1.3, 1.5]}>
                    <cylinderGeometry args={[0.06, 0.06, 2.6, 8]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>
                <mesh position={[1.4, 1.3, 1.5]}>
                    <cylinderGeometry args={[0.06, 0.06, 2.6, 8]} />
                    <meshStandardMaterial color="#475569" />
                </mesh>

                {/* Exterior Wall Lantern */}
                <group position={[1.4, 2.2, 0.15]}>
                    <mesh>
                        <boxGeometry args={[0.2, 0.35, 0.2]} />
                        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.9} />
                    </mesh>
                    <pointLight color="#fde047" intensity={0.8} distance={7} />
                </group>

                {/* 3D Neon Signboard above Canopy */}
                <group position={[0, 3.4, 0.2]}>
                    <mesh position={[0, 0, -0.05]}>
                        <boxGeometry args={[Math.min(w * 0.85, 5.5), 0.9, 0.12]} />
                        <meshStandardMaterial color="#020617" roughness={0.5} />
                    </mesh>
                    <Text
                        position={[0, 0.1, 0.05]}
                        fontSize={0.38}
                        color={trimColor}
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.03}
                        outlineColor="#000"
                    >
                        {name}
                    </Text>
                    {subtitle && (
                        <Text
                            position={[0, -0.22, 0.05]}
                            fontSize={0.18}
                            color="#94a3b8"
                            anchorX="center"
                            anchorY="middle"
                        >
                            {subtitle}
                        </Text>
                    )}
                </group>
            </group>

            {/* Rooftop Features by Type */}
            {type === 'tower' && (
                <group position={[0, h, 0]}>
                    {/* Helipad Base */}
                    <mesh position={[0, 0.1, 0]}>
                        <cylinderGeometry args={[w * 0.35, w * 0.35, 0.2, 16]} />
                        <meshStandardMaterial color="#334155" roughness={0.9} />
                    </mesh>
                    {/* Glowing Antenna Spire */}
                    <mesh position={[0, 3.2, 0]}>
                        <cylinderGeometry args={[0.05, 0.15, 6.2, 8]} />
                        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
                    </mesh>
                    <mesh position={[0, 6.3, 0]}>
                        <sphereGeometry args={[0.2, 12, 12]} />
                        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.5} />
                    </mesh>
                    <pointLight position={[0, 6.3, 0]} color="#ef4444" intensity={0.9} distance={15} />
                </group>
            )}

            {type === 'lab' && (
                <group position={[0, h, 0]}>
                    {/* AC Units & Exhausts */}
                    <mesh position={[-2, 0.6, -1]} castShadow>
                        <boxGeometry args={[1.8, 1.2, 1.4]} />
                        <meshStandardMaterial color="#64748b" metalness={0.7} />
                    </mesh>
                    <mesh position={[2, 0.5, 1]} castShadow>
                        <boxGeometry args={[1.6, 1.0, 1.2]} />
                        <meshStandardMaterial color="#64748b" metalness={0.7} />
                    </mesh>
                    {/* Satellite Dish */}
                    <mesh position={[0, 1.2, -1.5]} rotation={[0.5, 0.6, 0]}>
                        <coneGeometry args={[1.1, 0.4, 16]} />
                        <meshStandardMaterial color="#e2e8f0" metalness={0.5} />
                    </mesh>
                </group>
            )}

            {type === 'cafe' && (
                <group position={[0, h, 0]}>
                    {/* Sloped Roof */}
                    <mesh position={[0, 1.2, 0]} castShadow>
                        <coneGeometry args={[Math.max(w, d) * 0.68, 2.4, 4]} />
                        <meshStandardMaterial color="#b45309" roughness={0.85} />
                    </mesh>
                    {/* Chimney */}
                    <mesh position={[2, 2.2, 1]} castShadow>
                        <boxGeometry args={[0.6, 1.8, 0.6]} />
                        <meshStandardMaterial color="#78350f" roughness={0.9} />
                    </mesh>
                </group>
            )}

            {type === 'house' && (
                <group position={[0, h, 0]}>
                    <mesh position={[0, 1.4, 0]} castShadow>
                        <coneGeometry args={[Math.max(w, d) * 0.66, 2.8, 4]} />
                        <meshStandardMaterial color="#991b1b" roughness={0.85} />
                    </mesh>
                </group>
            )}
        </group>
    );
}

// Streetlight with realistic post and pointlight
function StreetLight({ position, rotationY = 0 }) {
    return (
        <group position={position} rotation={[0, rotationY, 0]}>
            {/* Pole */}
            <mesh position={[0, 2.2, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.12, 4.4, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Curved Arm */}
            <mesh position={[0.4, 4.3, 0]} rotation={[0, 0, -Math.PI / 6]}>
                <cylinderGeometry args={[0.06, 0.06, 1.0, 8]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Lantern Cap */}
            <mesh position={[0.75, 4.6, 0]}>
                <coneGeometry args={[0.25, 0.25, 8]} />
                <meshStandardMaterial color="#0f172a" />
            </mesh>
            {/* Glowing Bulb */}
            <mesh position={[0.75, 4.4, 0]}>
                <sphereGeometry args={[0.14, 12, 12]} />
                <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.2} />
            </mesh>
            <pointLight position={[0.75, 4.3, 0]} color="#fef08a" intensity={0.9} distance={14} />
        </group>
    );
}

// Spawn Plaza with Tiered Fountain & Rotating Alxzy Diamond
function SpawnPlaza() {
    const crystalRef = useRef();

    useFrame((_, delta) => {
        if (crystalRef.current) {
            crystalRef.current.rotation.y += delta * 0.8;
            crystalRef.current.rotation.x = Math.sin(Date.now() * 0.002) * 0.15;
        }
    });

    return (
        <group>
            {/* Outer Plaza Stone Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <circleGeometry args={[9, 48]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
                <ringGeometry args={[8.6, 9.2, 48]} />
                <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
            </mesh>

            {/* Central Fountain Structure */}
            <group position={[0, 0, 0]}>
                {/* Basin Wall */}
                <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[2.8, 3.1, 0.7, 24]} />
                    <meshStandardMaterial color="#334155" roughness={0.7} />
                </mesh>
                {/* Water in Basin */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.65, 0]}>
                    <circleGeometry args={[2.5, 24]} />
                    <meshStandardMaterial color="#38bdf8" transparent opacity={0.85} roughness={0.05} metalness={0.4} />
                </mesh>

                {/* Inner Tier */}
                <mesh position={[0, 0.9, 0]} castShadow>
                    <cylinderGeometry args={[1.2, 1.4, 0.7, 16]} />
                    <meshStandardMaterial color="#1e293b" />
                </mesh>
                {/* Fountain Pillar */}
                <mesh position={[0, 1.6, 0]}>
                    <cylinderGeometry args={[0.3, 0.45, 1.2, 12]} />
                    <meshStandardMaterial color="#64748b" />
                </mesh>

                {/* Rotating Glowing Crystal Monument */}
                <group ref={crystalRef} position={[0, 2.7, 0]}>
                    <mesh castShadow>
                        <octahedronGeometry args={[0.65, 0]} />
                        <meshStandardMaterial
                            color="#38bdf8"
                            roughness={0.1}
                            metalness={0.9}
                            emissive="#0284c7"
                            emissiveIntensity={0.8}
                        />
                    </mesh>
                    <pointLight color="#38bdf8" intensity={1.2} distance={8} />
                </group>
            </group>

            {/* Plaza Streetlights around the rim */}
            <StreetLight position={[6.5, 0, 0]} rotationY={-Math.PI / 2} />
            <StreetLight position={[-6.5, 0, 0]} rotationY={Math.PI / 2} />
            <StreetLight position={[0, 0, 6.5]} rotationY={Math.PI} />
            <StreetLight position={[0, 0, -6.5]} rotationY={0} />
        </group>
    );
}

// Upgraded Road with curbs and painted dashed center markings
function Road({ from, to, width = 4.4 }) {
    const dx = to[0] - from[0];
    const dz = to[2] - from[2];
    const len = Math.sqrt(dx * dx + dz * dz);
    const ang = Math.atan2(dx, dz);
    const midX = (from[0] + to[0]) / 2;
    const midZ = (from[2] + to[2]) / 2;

    return (
        <group position={[midX, 0.015, midZ]} rotation={[0, ang, 0]}>
            {/* Asphalt Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[width, len]} />
                <meshStandardMaterial color="#1e293b" roughness={0.95} />
            </mesh>
            {/* Left Curb */}
            <mesh position={[-width / 2, 0.05, 0]} castShadow>
                <boxGeometry args={[0.25, 0.1, len]} />
                <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            {/* Right Curb */}
            <mesh position={[width / 2, 0.05, 0]} castShadow>
                <boxGeometry args={[0.25, 0.1, len]} />
                <meshStandardMaterial color="#64748b" roughness={0.9} />
            </mesh>
            {/* Dashed Center Stripe */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[0.18, len * 0.95]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.5} />
            </mesh>
        </group>
    );
}

function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#557a3e" roughness={0.94} />
        </mesh>
    );
}

function Lake({ position, radius }) {
    return (
        <group position={position}>
            {/* Sandy Shore */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[radius, radius + 3.2, 48]} />
                <meshStandardMaterial color="#c2b280" roughness={1} />
            </mesh>
            {/* Water Surface */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[radius, 48]} />
                <meshStandardMaterial color="#0284c7" transparent opacity={0.78} roughness={0.04} metalness={0.5} />
            </mesh>
        </group>
    );
}

function Mountain({ position, height, radius, color = '#5b4b3f' }) {
    return (
        <mesh position={[position[0], height / 2, position[2]]} castShadow receiveShadow>
            <coneGeometry args={[radius, height, 10]} />
            <meshStandardMaterial color={color} roughness={0.95} flatShading />
        </mesh>
    );
}

function Tree({ position }) {
    return (
        <group position={position}>
            {/* Trunk */}
            <mesh position={[0, 1.5, 0]} castShadow>
                <cylinderGeometry args={[0.15, 0.26, 3, 6]} />
                <meshStandardMaterial color="#5c4033" roughness={0.9} />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 3.8, 0]} castShadow>
                <sphereGeometry args={[1.35, 6, 5]} />
                <meshStandardMaterial color="#2d7a2d" flatShading />
            </mesh>
            <mesh position={[0, 4.8, 0]} castShadow>
                <sphereGeometry args={[0.9, 5, 4]} />
                <meshStandardMaterial color="#389e38" flatShading />
            </mesh>
        </group>
    );
}

function Rock({ position, s }) {
    return (
        <mesh position={[position[0], s * 0.35, position[2]]} scale={s} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#64748b" roughness={0.95} flatShading />
        </mesh>
    );
}

// ============================================================
// WORLD ENVIRONMENT
// ============================================================
function WorldEnvironment() {
    return (
        <>
            {/* Sky + Atmosphere */}
            <Sky sunPosition={[120, 45, 90]} turbidity={5} rayleigh={1.1} />
            <ambientLight intensity={0.52} />
            <hemisphereLight args={['#bae6fd', '#4d7c0f', 0.35]} />
            <directionalLight
                castShadow
                position={[60, 85, 45]}
                intensity={1.45}
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={250}
                shadow-camera-left={-120}
                shadow-camera-right={120}
                shadow-camera-top={120}
                shadow-camera-bottom={-120}
            />

            {/* Fog */}
            <fog attach="fog" args={['#c8e0ec', 55, 160]} />

            {/* Terrain Base */}
            <Ground />
            <SpawnPlaza />

            {/* Lakes */}
            <Lake position={[40, 0, 30]} radius={14} />
            <Lake position={[-50, 0, 50]} radius={8} />

            {/* Border Mountain Ring */}
            <Mountain position={[-85, 0, -85]} height={50} radius={28} color="#5b4b3f" />
            <Mountain position={[-55, 0, -92]} height={38} radius={20} color="#6b5b4f" />
            <Mountain position={[-95, 0, -35]} height={32} radius={22} color="#4b3b2f" />
            <Mountain position={[88, 0, -78]} height={44} radius={26} color="#5b4b3f" />
            <Mountain position={[96, 0, -25]} height={30} radius={18} color="#6b5b4f" />
            <Mountain position={[85, 0, 75]} height={38} radius={24} color="#4b3b2f" />
            <Mountain position={[-78, 0, 88]} height={40} radius={24} color="#5b4b3f" />
            <Mountain position={[25, 0, -90]} height={28} radius={16} color="#6b5b4f" />
            <Mountain position={[-35, 0, 92]} height={34} radius={20} color="#4b3b2f" />
            <Mountain position={[92, 0, 30]} height={26} radius={16} color="#6b5b4f" />

            {/* Town Buildings */}
            {BUILDINGS_DATA.map(b => (
                <Building key={b.id} building={b} />
            ))}

            {/* Town Roads */}
            <Road from={[-95, 0, 0]} to={[95, 0, 0]} />
            <Road from={[0, 0, -95]} to={[0, 0, 95]} />
            <Road from={[-16, 0, -16]} to={[24, 0, -24]} width={3.6} />

            {/* Town Streetlights along Main Roads */}
            <StreetLight position={[-14, 0, 4]} rotationY={0} />
            <StreetLight position={[14, 0, 4]} rotationY={0} />
            <StreetLight position={[-4, 0, -14]} rotationY={Math.PI / 2} />
            <StreetLight position={[-4, 0, 14]} rotationY={Math.PI / 2} />
            <StreetLight position={[-24, 0, -10]} rotationY={0} />
            <StreetLight position={[24, 0, -10]} rotationY={0} />

            {/* Nature Objects */}
            {STATIC_TREES.map(([x, z], i) => (
                <Tree key={`t-${i}`} position={[x, 0, z]} />
            ))}
            {STATIC_ROCKS.map((r, i) => (
                <Rock key={`r-${i}`} position={[r.x, 0, r.z]} s={r.radius / 0.85} />
            ))}
        </>
    );
}

// ============================================================
// LOCAL PLAYER CONTROLS — OTS Camera, Smooth Jump, Collision Sliding
// ============================================================
function LocalPlayerControls({
    sendMovement,
    updateSpatialAudio,
    joystickInput,
    jumpTriggerRef,
    characterType,
    playerName,
}) {
    const { camera, gl } = useThree();
    const playerGroup = useRef();
    // Spawn in open plaza safely outside central fountain (z = 6.0)
    const playerPos = useRef(new THREE.Vector3(0, 0, 6.0));
    const yaw = useRef(0);
    const pitch = useRef(0.2);
    const meshYaw = useRef(0);

    const velocityY = useRef(0);
    const isGrounded = useRef(true);

    const wasWalking = useRef(false);
    const wasJumping = useRef(false);
    const lastSend = useRef(0);
    const isLocked = useRef(false);

    const [walking, setWalking] = useState(false);
    const [jumping, setJumping] = useState(false);

    const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false });

    // Jump action helper
    const doJump = () => {
        if (isGrounded.current) {
            velocityY.current = JUMP_FORCE;
            isGrounded.current = false;
            setJumping(true);
        }
    };

    // ---------- Input handlers ----------
    useEffect(() => {
        const onKeyDown = (e) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            const k = e.key.toLowerCase();
            if (k in keysRef.current) keysRef.current[k] = true;
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                doJump();
            }
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
            if (document.activeElement?.tagName !== 'INPUT') {
                cvs.requestPointerLock?.();
            }
        };
        const onLock = () => {
            isLocked.current = document.pointerLockElement === cvs;
        };
        const onMouse = (e) => {
            if (!isLocked.current) return;
            yaw.current -= e.movementX * 0.0028;
            // Standard non-inverted pitch (mouse up -> look up)
            pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * 0.0024, -0.65, 0.7);
        };

        cvs.addEventListener('mousedown', onDown);
        document.addEventListener('pointerlockchange', onLock);
        document.addEventListener('mousemove', onMouse);

        // ---- Mobile: touch-to-rotate on right half ----
        let tid = null, lx = 0, ly = 0;
        const tStart = (e) => {
            for (const t of e.changedTouches) {
                if (t.clientX > window.innerWidth * 0.35 && tid === null) {
                    tid = t.identifier;
                    lx = t.clientX;
                    ly = t.clientY;
                    break;
                }
            }
        };
        const tMove = (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === tid) {
                    yaw.current -= (t.clientX - lx) * 0.005;
                    pitch.current = THREE.MathUtils.clamp(pitch.current - (t.clientY - ly) * 0.004, -0.65, 0.7);
                    lx = t.clientX;
                    ly = t.clientY;
                    break;
                }
            }
        };
        const tEnd = (e) => {
            for (const t of e.changedTouches) {
                if (t.identifier === tid) tid = null;
            }
        };

        cvs.addEventListener('touchstart', tStart, { passive: true });
        cvs.addEventListener('touchmove', tMove, { passive: true });
        cvs.addEventListener('touchend', tEnd, { passive: true });

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            cvs.removeEventListener('mousedown', onDown);
            document.removeEventListener('pointerlockchange', onLock);
            document.removeEventListener('mousemove', onMouse);
            cvs.removeEventListener('touchstart', tStart);
            cvs.removeEventListener('touchmove', tMove);
            cvs.removeEventListener('touchend', tEnd);
        };
    }, [gl.domElement]);

    // ---------- Frame Loop ----------
    useFrame((_, delta) => {
        // Clamp delta to prevent huge jumps on lag spike
        const dt = Math.min(delta, 0.1);

        // Check external jump triggers (Mobile button, etc.)
        if (jumpTriggerRef && jumpTriggerRef.current) {
            doJump();
            jumpTriggerRef.current = false;
        }

        // Emergency Unstick: If player is ever trapped inside the central fountain (< 3.1)
        const dFountain = Math.hypot(playerPos.current.x, playerPos.current.z);
        if (dFountain < 3.1) {
            if (dFountain < 0.2) {
                playerPos.current.set(0, 0, 6.0);
            } else {
                const factor = 3.3 / dFountain;
                playerPos.current.x *= factor;
                playerPos.current.z *= factor;
            }
        }

        const keys = keysRef.current;
        const sinY = Math.sin(yaw.current);
        const cosY = Math.cos(yaw.current);
        const sinP = Math.sin(pitch.current);
        const cosP = Math.cos(pitch.current);

        // Horizontal camera-relative vectors for movement
        const forwardXZ = new THREE.Vector3(-sinY, 0, -cosY);
        const rightXZ = new THREE.Vector3(cosY, 0, -sinY);

        // Movement velocity (XZ plane)
        const vel = new THREE.Vector3();
        if (keys.w) vel.add(forwardXZ);
        if (keys.s) vel.addScaledVector(forwardXZ, -1);
        if (keys.a) vel.addScaledVector(rightXZ, -1);
        if (keys.d) vel.add(rightXZ);

        // Mobile Joystick Input (Camera-relative)
        const ji = joystickInput.current;
        if (ji && (Math.abs(ji.x) > 0.1 || Math.abs(ji.y) > 0.1)) {
            vel.addScaledVector(rightXZ, ji.x);
            vel.addScaledVector(forwardXZ, -ji.y);
        }

        const isWalk = vel.lengthSq() > 0.001;
        if (isWalk) {
            // Smoothly rotate character mesh towards actual movement direction
            const targetAngle = Math.atan2(vel.x, vel.z) + Math.PI;
            let diff = targetAngle - meshYaw.current;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            meshYaw.current += diff * 0.2;

            vel.normalize().multiplyScalar(SPEED * dt);

            // Wall-Sliding Collision Detection with outward unstick support
            const currX = playerPos.current.x;
            const currZ = playerPos.current.z;
            const nextX = currX + vel.x;
            const nextZ = currZ + vel.z;

            if (!checkCollision(nextX, currZ, currX, currZ)) {
                playerPos.current.x = nextX;
            }
            if (!checkCollision(currX, nextZ, currX, currZ)) {
                playerPos.current.z = nextZ;
            }
        }

        // Vertical Physics (Jump & Gravity)
        if (!isGrounded.current || velocityY.current !== 0) {
            velocityY.current += GRAVITY * dt;
            playerPos.current.y += velocityY.current * dt;

            if (playerPos.current.y <= 0) {
                playerPos.current.y = 0;
                velocityY.current = 0;
                isGrounded.current = true;
                setJumping(false);
            }
        }

        // Update local character group transform
        if (playerGroup.current) {
            playerGroup.current.position.copy(playerPos.current);
            playerGroup.current.rotation.set(0, meshYaw.current, 0);
        }

        // ---- True Over-The-Shoulder (OTS) Camera (Resident Evil 4 Remake Style) ----
        // 3D forward direction of camera gaze (+sinP = looking up towards sky, -sinP = looking down towards ground)
        const camForward = new THREE.Vector3(
            -sinY * cosP,
            sinP,
            -cosY * cosP
        ).normalize();

        // Player upper torso anchor (shoulder height ~1.45m)
        const playerChest = new THREE.Vector3(
            playerPos.current.x,
            playerPos.current.y + 1.45,
            playerPos.current.z
        );

        // RE4 Remake over-the-right-shoulder configuration:
        // Tight 2.5m distance behind, 0.65m right shoulder shift, 0.2m height offset
        const camDist = 2.5;
        const shoulderOffset = 0.65;
        const heightOffset = 0.2;

        const targetCamPos = playerChest.clone()
            .addScaledVector(camForward, -camDist)
            .addScaledVector(rightXZ, shoulderOffset)
            .add(new THREE.Vector3(0, heightOffset, 0));

        // Direct crisp camera update (Zero lag / floatiness, 100% tight 1:1 mouse tracking like RE4 Remake)
        camera.position.copy(targetCamPos);

        // Aim forward into the world (keeps character perfectly framed in the left third of screen)
        const lookTarget = targetCamPos.clone().addScaledVector(camForward, 25);
        camera.lookAt(lookTarget);

        // Network Synchronization
        const isJumpState = !isGrounded.current;
        const now = Date.now();
        let shouldSend = false;

        if ((isWalk || isJumpState) && now - lastSend.current > 100) {
            shouldSend = true;
        } else if (isWalk !== wasWalking.current || isJumpState !== wasJumping.current) {
            shouldSend = true;
        }

        if (isWalk !== wasWalking.current) {
            wasWalking.current = isWalk;
            setWalking(isWalk);
        }
        if (isJumpState !== wasJumping.current) {
            wasJumping.current = isJumpState;
        }

        if (shouldSend) {
            sendMovement(
                { x: playerPos.current.x, y: playerPos.current.y, z: playerPos.current.z },
                { y: meshYaw.current },
                isWalk,
                isJumpState
            );
            lastSend.current = now;
        }

        if (updateSpatialAudio) {
            updateSpatialAudio(camera.position);
        }
    });

    return (
        <group ref={playerGroup}>
            <React.Suspense fallback={null}>
                <CharacterModel
                    url={getCharacterUrl(characterType)}
                    isWalking={walking}
                    isJumping={jumping}
                    name={playerName}
                    type={characterType}
                />
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
        g.current.position.lerp(
            new THREE.Vector3(player.position.x || 0, player.position.y || 0, player.position.z || 0),
            0.18
        );

        // Smooth rotation
        const targetY = player.rotation?.y || 0;
        const euler = new THREE.Euler().setFromQuaternion(g.current.quaternion);
        let diff = targetY - euler.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        euler.y += diff * 0.16;
        g.current.quaternion.setFromEuler(euler);
    });

    return (
        <group ref={g}>
            <React.Suspense fallback={null}>
                <CharacterModel
                    url={getCharacterUrl(player.characterType)}
                    isWalking={player.isWalking}
                    isJumping={player.isJumping}
                    name={player.name}
                    type={player.characterType}
                />
            </React.Suspense>
        </group>
    );
}

// ============================================================
// EXPORT
// ============================================================
export default function WorldCanvas({
    players,
    sendMovement,
    updateSpatialAudio,
    joystickInput,
    jumpTriggerRef,
    currentUserData,
}) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 55, near: 0.1, far: 300 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
            <WorldEnvironment />
            <LocalPlayerControls
                sendMovement={sendMovement}
                updateSpatialAudio={updateSpatialAudio}
                joystickInput={joystickInput}
                jumpTriggerRef={jumpTriggerRef}
                characterType={currentUserData?.characterType || 'robot'}
                playerName={currentUserData?.username || 'You'}
            />
            {Object.values(players.current || {}).map(p => (
                <RemotePlayer key={p.id} player={p} />
            ))}
        </Canvas>
    );
}
