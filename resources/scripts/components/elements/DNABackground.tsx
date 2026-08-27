import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveAnimation = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.3; }
  90% { opacity: 0.3; }
  100% { transform: translateY(-1000px) rotate(360deg); opacity: 0; }
`;

const BackgroundContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    overflow: hidden;
    background-color: #09090b; /* AMOLED black */
    background-image: radial-gradient(circle at 50% 0%, #0c4a6e 0%, #09090b 60%); /* Sky Dark Blue glow */
`;

const Particle = styled.div<{ $left: string; $size: string; $delay: string; $duration: string }>`
    position: absolute;
    bottom: -100px;
    left: ${(props) => props.$left};
    width: ${(props) => props.$size};
    height: ${(props) => props.$size};
    background: rgba(56, 189, 248, 0.15);
    border: 1px solid rgba(56, 189, 248, 0.3);
    border-radius: 50%;
    animation: ${moveAnimation} ${(props) => props.$duration} linear infinite;
    animation-delay: ${(props) => props.$delay};
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
    
    &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: -150%;
        width: 400%;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.2), transparent);
        transform: rotate(45deg);
    }
`;

const DNABackground = () => {
    // Generate some random particles for the background
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 40 + 10}px`,
        delay: `${Math.random() * 20}s`,
        duration: `${Math.random() * 20 + 20}s`,
    }));

    return (
        <BackgroundContainer>
            {particles.map((p) => (
                <Particle
                    key={p.id}
                    $left={p.left}
                    $size={p.size}
                    $delay={p.delay}
                    $duration={p.duration}
                />
            ))}
        </BackgroundContainer>
    );
};

export default DNABackground;
