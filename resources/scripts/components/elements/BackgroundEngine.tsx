import React, { useEffect, useState, useRef } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { motion, AnimatePresence } from 'framer-motion';
import DNABackground from '@/components/elements/DNABackground';

const BackgroundWrapper = styled.div`
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
`;

const MediaOverlay = styled(motion.div)`
    ${tw`absolute inset-0 w-full h-full`}
    img, video {
        ${tw`w-full h-full object-cover`}
        opacity: 0.15;
    }
`;

const AudioToggle = styled.button`
    ${tw`fixed bottom-6 right-6 z-50 p-3 rounded-full text-white transition-all shadow-xl`}
    pointer-events: auto;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.2);
    &:hover { background: rgba(255,255,255,0.2); }
`;

const BackgroundEngine = () => {
    const [bgType, setBgType] = useState<string>('network');
    const [bgData, setBgData] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const themeConfig = (window as any).SiteConfiguration?.theme;
        if (themeConfig) {
            setBgType(themeConfig.type || 'network');
            setBgData(themeConfig.data || null);
        }

        // Audio preference stored locally per user
        import('localforage').then(localforage => {
            localforage.default.getItem<boolean>('bgAudio').then(audio => {
                if (audio !== null) setAudioEnabled(audio);
            });
        });
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = !audioEnabled;
        }
        import('localforage').then(localforage => {
            localforage.default.setItem('bgAudio', audioEnabled);
        });
    }, [audioEnabled]);

    // tsParticles for 'network' and 'bubbles' are handled by wrapper.blade.php
    // This component only handles DNA, image, and video backgrounds
    const showDna = bgType === 'dna';
    const showImage = bgType === 'image' && !!bgData;
    const showVideo = bgType === 'video' && !!bgData;

    // Don't render the wrapper at all for particle types (network/bubbles)
    // because tsParticles runs in its own div outside React
    if (!showDna && !showImage && !showVideo) {
        return null;
    }

    return (
        <>
            <BackgroundWrapper>
                <AnimatePresence mode="wait">
                    {showDna && (
                        <motion.div
                            key="dna"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <DNABackground />
                        </motion.div>
                    )}

                    {showImage && (
                        <MediaOverlay
                            key="image"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <img src={bgData!} alt="Custom Background" />
                        </MediaOverlay>
                    )}

                    {showVideo && (
                        <MediaOverlay
                            key="video"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <video
                                ref={videoRef}
                                src={bgData!}
                                autoPlay
                                loop
                                playsInline
                                muted={!audioEnabled}
                            />
                        </MediaOverlay>
                    )}
                </AnimatePresence>
            </BackgroundWrapper>

            {showVideo && (
                <AudioToggle onClick={() => setAudioEnabled(!audioEnabled)}>
                    {audioEnabled ? (
                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707a1 1 0 001.707-.707V4.993a1 1 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z" />
                        </svg>
                    ) : (
                        <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </AudioToggle>
            )}
        </>
    );
};

export default BackgroundEngine;
