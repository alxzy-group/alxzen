// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useStoreState } from 'easy-peasy';
import tw, { styled } from 'twin.macro';
import { motion, AnimatePresence } from 'framer-motion';
import nipplejs from 'nipplejs';
import { XIcon, MicrophoneIcon, ChatAltIcon } from '@heroicons/react/solid';

import useMultiplayerSync from './hooks/useMultiplayerSync';
import useLocalSpatialAudio from './hooks/useLocalSpatialAudio';
import WorldCanvas from './WorldCanvas';

const CharacterSelectionOverlay = styled(motion.div)`
    ${tw`fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-md`}
`;

const CharacterCard = styled.div<{ $active: boolean }>`
    ${tw`flex flex-col items-center p-6 rounded-2xl cursor-pointer transition-all border-2`}
    ${props => props.$active ? tw`border-cyan-400 bg-cyan-900/40 shadow-lg` : tw`border-white/10 bg-white/5 hover:border-white/30`}
    
    img {
        ${tw`w-32 h-32 object-contain mb-4 filter drop-shadow-xl`}
    }
    span {
        ${tw`text-white font-medium text-lg`}
    }
`;

const JoinButton = styled.button`
    ${tw`mt-10 px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-bold text-xl transition-all shadow-lg hover:scale-105`}
`;

const PortraitWarning = styled.div`
    ${tw`fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-8 text-center`}
    display: none;
    @media (orientation: portrait) and (max-width: 768px) {
        display: flex;
    }
    
    svg { ${tw`w-20 h-20 mb-6 animate-bounce text-cyan-400`} }
`;

const OverlayContainer = styled(motion.div)`
    ${tw`fixed inset-0 z-50 bg-black overflow-hidden flex flex-col`}
`;

const TopBar = styled.div`
    ${tw`absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none`}
`;

const Title = styled.div`
    ${tw`text-white font-bold text-2xl tracking-tighter`}
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    span {
        background: linear-gradient(90deg, #38bdf8, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
`;

const ExitButton = styled.button`
    ${tw`p-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-xl text-red-100 transition-all pointer-events-auto backdrop-blur-md`}
`;

const HUD = styled.div`
    ${tw`absolute bottom-0 left-0 w-full p-6 flex justify-between items-end z-10 pointer-events-none`}
`;

const ChatContainer = styled.div`
    ${tw`w-full max-w-md pointer-events-auto flex flex-col gap-2`}
`;

const ChatMessages = styled.div`
    ${tw`flex flex-col gap-1 max-h-48 overflow-y-auto mb-2`}
    /* Custom scrollbar hidden for clean look */
    &::-webkit-scrollbar { display: none; }
`;

const ChatBubble = styled.div`
    ${tw`bg-black/50 backdrop-blur-md text-white text-sm px-3 py-1.5 rounded-lg inline-block border border-white/10`}
    strong { ${tw`text-cyan-400 mr-2`} }
`;

const ChatInputWrapper = styled.div`
    ${tw`relative flex items-center bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden shadow-2xl`}
`;

const ChatInput = styled.input`
    ${tw`w-full bg-transparent border-none text-white px-4 py-3 text-sm focus:ring-0`}
    &::placeholder { ${tw`text-white/40`} }
`;

const MicIndicator = styled.div<{ $active: boolean }>`
    ${tw`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md font-medium text-sm transition-all pointer-events-auto shadow-2xl cursor-pointer select-none`}
    ${props => props.$active 
        ? tw`bg-green-500/20 text-green-400 border border-green-500/50`
        : tw`bg-black/40 text-white/50 border border-white/10`
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const JoystickZone = styled.div`
    ${tw`absolute bottom-24 left-10 w-32 h-32 pointer-events-auto opacity-70 z-50`}
`;

export default function DuniaAlxzyOverlay({ onClose }) {
    const user = useStoreState(state => state.user.data);
    const joystickRef = useRef(null);
    const joystickInput = useRef({ x: 0, y: 0 });
    
    const [chatText, setChatText] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState('robot');

    const extendedUser = { ...user, characterType: selectedCharacter };

    const { 
        socket, 
        players, 
        chatMessages, 
        sendMovement, 
        sendChat 
    } = useMultiplayerSync(extendedUser, hasJoined);

    const { 
        isTalking, 
        startMic, 
        stopMic, 
        updateSpatialAudio 
    } = useLocalSpatialAudio(socket?.id, players, null);

    const chatInputRef = useRef(null);

    // Push To Talk (V key) and Chat Focus (Enter key)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Check if user is typing in chat input
            if (document.activeElement.tagName === 'INPUT') return;
            
            if (e.key.toLowerCase() === 'v' && !isTalking) {
                startMic();
            }
            
            if (e.key === 'Enter') {
                e.preventDefault();
                // Release pointer lock if active so they can see their mouse (browser does this automatically on ESC, but we can't force exit pointer lock programmatically easily without document.exitPointerLock, so let's do it)
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
                if (chatInputRef.current) {
                    chatInputRef.current.focus();
                }
            }
        };
        const handleKeyUp = (e) => {
            if (e.key.toLowerCase() === 'v') stopMic();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isTalking, startMic, stopMic]);

    // Setup Nipple.js for mobile analog joystick
    useEffect(() => {
        if (!hasJoined) return;
        
        // Robust touch detection (works better on modern Android/tablets)
        const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.matchMedia("(pointer: coarse)").matches;
        if (!isTouch) return;

        if (joystickRef.current) {
            const manager = nipplejs.create({
                zone: joystickRef.current,
                mode: 'static',
                position: { left: '50%', top: '50%' },
                color: '#38bdf8'
            });

            manager.on('move', (evt, data) => {
                // Nipplejs returns angle in radians and force
                // We need to map this to X and Y velocity
                const force = Math.min(data.force, 1); // clamp to 1
                const angle = data.angle.radian;
                joystickInput.current = {
                    x: Math.cos(angle) * force,
                    y: -Math.sin(angle) * force // Negative because forward is -Z in ThreeJS
                };
            });

            manager.on('end', () => {
                joystickInput.current = { x: 0, y: 0 };
            });

            return () => manager.destroy();
        }
    }, [hasJoined]);

    const handleSendChat = (e) => {
        if (e.key === 'Enter' && chatText.trim()) {
            sendChat(chatText);
            setChatText('');
        }
    };

    if (!hasJoined) {
        return (
            <CharacterSelectionOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">Pilih Karakter</h1>
                <p className="text-gray-400 mb-10">Pilih avatar yang akan kamu gunakan di Dunia Alxzy</p>
                
                <div className="flex flex-wrap gap-6 justify-center">
                    <CharacterCard $active={selectedCharacter === 'robot'} onClick={() => setSelectedCharacter('robot')}>
                        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-4xl mb-4">🤖</div>
                        <span>Robot</span>
                    </CharacterCard>
                    <CharacterCard $active={selectedCharacter === 'soldier'} onClick={() => setSelectedCharacter('soldier')}>
                        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-4xl mb-4">💂</div>
                        <span>Soldier</span>
                    </CharacterCard>
                    <CharacterCard $active={selectedCharacter === 'xbot'} onClick={() => setSelectedCharacter('xbot')}>
                        <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-4xl mb-4">👽</div>
                        <span>X-Bot</span>
                    </CharacterCard>
                </div>

                <JoinButton onClick={() => {
                    setHasJoined(true);
                    // Attempt to lock landscape and go fullscreen on mobile
                    if (window.innerWidth <= 768) {
                        try {
                            if (document.documentElement.requestFullscreen) {
                                document.documentElement.requestFullscreen().then(() => {
                                    if (screen.orientation && screen.orientation.lock) {
                                        screen.orientation.lock('landscape').catch(() => {});
                                    }
                                }).catch(() => {});
                            }
                        } catch (e) {}
                    }
                }}>
                    Mulai Jelajah 🚀
                </JoinButton>
            </CharacterSelectionOverlay>
        );
    }

    return (
        <>
            <PortraitWarning>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-2xl font-bold mb-4">Putar HP Kamu! 📱🔄</h2>
                <p className="text-gray-400">Dunia Alxzy 3D hanya bisa dimainkan dalam mode Landscape (Miring).</p>
            </PortraitWarning>

            <OverlayContainer
                initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            <TopBar>
                <Title>Dunia <span>Alxzy</span></Title>
                <ExitButton onClick={onClose}>
                    <XIcon className="w-6 h-6" />
                </ExitButton>
            </TopBar>

            <WorldCanvas 
                players={players} 
                sendMovement={sendMovement}
                updateSpatialAudio={updateSpatialAudio}
                joystickInput={joystickInput}
                currentUserData={extendedUser}
            />

            {/* Mobile Joystick Zone */}
            <JoystickZone ref={joystickRef} />

            <HUD>
                <ChatContainer>
                    <ChatMessages>
                        {chatMessages.map((msg, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                <ChatBubble>
                                    <strong>{msg.name}</strong> {msg.message}
                                </ChatBubble>
                            </motion.div>
                        ))}
                    </ChatMessages>
                    <ChatInputWrapper>
                        <ChatAltIcon className="w-5 h-5 ml-4 text-white/50" />
                        <ChatInput 
                            ref={chatInputRef}
                            value={chatText}
                            onChange={e => setChatText(e.target.value)}
                            onKeyDown={handleSendChat}
                            placeholder="Ketik pesan..."
                        />
                    </ChatInputWrapper>
                </ChatContainer>

                <MicIndicator 
                    $active={isTalking}
                    onTouchStart={(e) => { e.preventDefault(); !isTalking && startMic(); }}
                    onTouchEnd={(e) => { e.preventDefault(); stopMic(); }}
                    onMouseDown={() => !isTalking && startMic()}
                    onMouseUp={() => stopMic()}
                    onMouseLeave={() => isTalking && stopMic()}
                >
                    <MicrophoneIcon className="w-5 h-5" />
                    {isTalking ? 'Mic Aktif (Proximity)' : 'Tahan "V" atau Tekan'}
                </MicIndicator>
            </HUD>
        </OverlayContainer>
        </>
    );
}
