// @ts-nocheck
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const MULTIPLAYER_SERVER = 'http://localhost:3002'; // Pterodactyl server IP usually. Wait, we should use window.location.hostname if it's hosted.

export default function useMultiplayerSync(userData, hasJoined) {
    const [socket, setSocket] = useState(null);
    const [players, setPlayers] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    
    // We use ref to avoid re-renders on every frame update of positions
    const playersRef = useRef({});

    useEffect(() => {
        if (!hasJoined) return;

        // Connect to the same origin, Nginx will proxy /socket.io/ to port 3002
        const serverUrl = window.location.origin;
        const newSocket = io(serverUrl, {
            path: '/socket.io/'
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_world', { ...userData, name: userData.username });
        });

        newSocket.on('current_players', (currentPlayers) => {
            // Filter out self
            const others = { ...currentPlayers };
            delete others[newSocket.id];
            
            playersRef.current = others;
            setPlayers({ ...others });
        });

        newSocket.on('player_joined', (player) => {
            if (player.id !== newSocket.id) {
                playersRef.current[player.id] = player;
                setPlayers(prev => ({ ...prev, [player.id]: player }));
            }
        });

        newSocket.on('player_moved', (player) => {
            if (playersRef.current[player.id]) {
                // Just update the ref for performance, React state update for every move is too slow
                playersRef.current[player.id].position = player.position;
                playersRef.current[player.id].rotation = player.rotation;
                playersRef.current[player.id].isWalking = player.isWalking;
            }
        });

        newSocket.on('player_left', (id) => {
            delete playersRef.current[id];
            setPlayers(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        });

        newSocket.on('chat_received', (msg) => {
            setChatMessages(prev => {
                const updated = [...prev, msg];
                // Keep only last 20 messages
                if (updated.length > 20) updated.shift();
                return updated;
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [hasJoined]);

    const sendMovement = (position, rotation, isWalking) => {
        if (socket && socket.connected) {
            socket.emit('move', { position, rotation, isWalking });
        }
    };

    const sendChat = (text) => {
        if (socket && socket.connected && text.trim()) {
            socket.emit('chat_message', { text });
        }
    };

    return {
        socket,
        players: playersRef, // returning ref for 3D canvas access
        reactPlayers: players, // returning state for UI maps
        chatMessages,
        sendMovement,
        sendChat
    };
}
