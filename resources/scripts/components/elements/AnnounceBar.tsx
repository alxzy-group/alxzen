import React, { useState, useEffect } from 'react';
import { XIcon, InformationCircleIcon, ExclamationIcon, SpeakerphoneIcon } from '@heroicons/react/solid';
import getAnnouncements, { Announcement } from '@/api/account/getAnnouncements';
import markAnnouncementRead from '@/api/account/markAnnouncementRead';
import tw, { styled } from 'twin.macro';

const Container = styled.div<{ $type: string }>`
    ${tw`relative px-5 py-4 rounded-2xl mb-6 flex items-start justify-between transition-all duration-200`};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: hsl(var(--text-primary));

    ${(props) => {
        switch (props.$type) {
            case 'critical':
                return `
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.08) 100%);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    box-shadow: 0 8px 25px -4px rgba(239, 68, 68, 0.25);
                `;
            case 'warning':
                return `
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.08) 100%);
                    border: 1px solid rgba(245, 158, 11, 0.4);
                    box-shadow: 0 8px 25px -4px rgba(245, 158, 11, 0.25);
                `;
            case 'promo':
                return `
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.08) 100%);
                    border: 1px solid rgba(168, 85, 247, 0.4);
                    box-shadow: 0 8px 25px -4px rgba(168, 85, 247, 0.25);
                `;
            default:
                return `
                    background: linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(2, 132, 199, 0.08) 100%);
                    border: 1px solid rgba(14, 165, 233, 0.4);
                    box-shadow: 0 8px 25px -4px rgba(14, 165, 233, 0.25);
                `;
        }
    }}

    &:hover {
        transform: translateY(-1px);
        filter: brightness(1.03);
    }
`;

const Content = styled.div`
    ${tw`flex-1 ml-4`}
    & h3 {
        ${tw`font-black text-lg m-0`}
        color: hsl(var(--text-primary));
    }
    & p {
        ${tw`m-0 mt-1 text-sm font-medium`}
        color: hsl(var(--text-primary));
    }
`;

const CloseButton = styled.button`
    ${tw`p-1 rounded-md transition-colors duration-200 hover:bg-white/20`}
`;

interface Props {
    displayLocation: 'dashboard' | 'console';
}

export default ({ displayLocation }: Props) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [visible, setVisible] = useState<Announcement[]>([]);

    useEffect(() => {
        getAnnouncements().then((data) => {
            const today = new Date().toDateString();
            let dismissed: Record<number, string> = {};
            try {
                dismissed = JSON.parse(localStorage.getItem('alx_dismissed_announcements') || '{}');
            } catch (e) {}

            const filtered = data.filter((a) => {
                const isTargetLocation = a.target_display.includes(displayLocation);
                const isDismissedToday = dismissed[a.id] === today;
                return isTargetLocation && !isDismissedToday;
            });
            
            setAnnouncements(filtered);
            setVisible(filtered);
        }).catch(console.error);
    }, [displayLocation]);

    const handleDismiss = (id: number) => {
        setVisible((s) => s.filter((a) => a.id !== id));
        
        const today = new Date().toDateString();
        let dismissed: Record<number, string> = {};
        try {
            dismissed = JSON.parse(localStorage.getItem('alx_dismissed_announcements') || '{}');
        } catch (e) {}
        
        dismissed[id] = today;
        localStorage.setItem('alx_dismissed_announcements', JSON.stringify(dismissed));
    };

    if (visible.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {visible.map((announcement) => (
                <Container key={announcement.id} $type={announcement.type}>
                    <div className="flex-shrink-0 mt-1">
                        {announcement.type === 'critical' || announcement.type === 'warning' ? (
                            <ExclamationIcon className="w-6 h-6" />
                        ) : announcement.type === 'promo' ? (
                            <SpeakerphoneIcon className="w-6 h-6" />
                        ) : (
                            <InformationCircleIcon className="w-6 h-6" />
                        )}
                    </div>
                    <Content>
                        <h3>{announcement.title}</h3>
                        <p dangerouslySetInnerHTML={{ __html: announcement.content }} />
                    </Content>
                    <CloseButton onClick={() => handleDismiss(announcement.id)}>
                        <XIcon className="w-5 h-5" />
                    </CloseButton>
                </Container>
            ))}
        </div>
    );
};
