// @ts-nocheck
import { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';

const MAX_DISTANCE = 15;

export default function useLocalSpatialAudio(socketId, currentPlayersRef, myPositionRef) {
    const [peer, setPeer] = useState(null);
    const [micStream, setMicStream] = useState(null);
    const [isTalking, setIsTalking] = useState(false);
    
    // Track active calls and their audio elements
    const callsRef = useRef({});

    // Initialize PeerJS
    useEffect(() => {
        if (!socketId) return;
        
        // Use socket ID as peer ID to easily connect and support same account
        const newPeer = new Peer(`dunia-alxzy-${socketId}`, {
            host: '0.peerjs.com',
            port: 443,
            secure: true
        });

        newPeer.on('open', (id) => {
            console.log('[+] PeerJS connected: ' + id);
        });

        newPeer.on('call', (call) => {
            // Automatically answer incoming calls if we have mic, otherwise answer without stream
            call.answer(micStream || undefined);
            
            call.on('stream', (remoteStream) => {
                setupSpatialAudio(call.peer, remoteStream);
            });
        });

        setPeer(newPeer);

        return () => {
            newPeer.destroy();
        };
    }, [socketId]);

    // Request Mic permission
    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStream(stream);
            setIsTalking(true);
            
            // Re-answer/re-call everyone with the new stream
            if (peer) {
                Object.values(currentPlayersRef.current).forEach(p => {
                    const call = peer.call(`dunia-alxzy-${p.id}`, stream);
                    call.on('stream', (remoteStream) => {
                        setupSpatialAudio(`dunia-alxzy-${p.id}`, remoteStream);
                    });
                    callsRef.current[`dunia-alxzy-${p.id}`] = call;
                });
            }
        } catch (err) {
            console.error('Mic error:', err);
        }
    };

    const stopMic = () => {
        if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
            setMicStream(null);
            setIsTalking(false);
        }
    };

    // Setup 3D Spatial Audio (Simplified to HTML Audio Volume for Reliability)
    const setupSpatialAudio = (peerId, stream) => {
        const playerId = peerId.replace('dunia-alxzy-', '');
        
        // Use normal HTML5 audio
        const audio = new Audio();
        audio.srcObject = stream;
        audio.autoplay = true;
        // Default volume to 0 (will be updated by spatial loop)
        audio.volume = 0;
        
        // Promise catch to avoid play() interruptions
        audio.play().catch(e => console.log('Audio autoplay blocked:', e));

        callsRef.current[peerId] = {
            playerId,
            audio
        };
    };

    // This should be called in a requestAnimationFrame loop from the Canvas
    const updateSpatialAudio = (cameraPosition) => {
        // Update all active calls' audio volume based on their avatar positions
        Object.values(callsRef.current).forEach(({ playerId, audio }) => {
            const targetPlayer = currentPlayersRef.current[playerId];
            if (targetPlayer && targetPlayer.position) {
                const pos = targetPlayer.position;
                
                // Calculate distance
                const dx = pos.x - cameraPosition.x;
                const dy = pos.y - cameraPosition.y;
                const dz = pos.z - cameraPosition.z;
                const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                
                // Linear volume falloff
                let volume = 1 - (distance / MAX_DISTANCE);
                if (volume < 0) volume = 0;
                if (volume > 1) volume = 1;
                
                audio.volume = volume;
            } else {
                audio.volume = 0;
            }
        });
    };

    return {
        isTalking,
        startMic,
        stopMic,
        updateSpatialAudio
    };
}
