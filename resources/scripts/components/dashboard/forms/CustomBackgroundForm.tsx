import React, { useState, useEffect } from 'react';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import localforage from 'localforage';
import { useStoreActions } from 'easy-peasy';

export default () => {
    const [bgType, setBgType] = useState<'default' | 'image' | 'video'>('default');
    const [bgData, setBgData] = useState<string>('');
    const { addFlash } = useStoreActions((actions: any) => actions.flashes);

    useEffect(() => {
        localforage.getItem<'default' | 'image' | 'video'>('bgType').then(type => {
            if (type) setBgType(type);
        });
        localforage.getItem<string>('bgData').then(data => {
            if (data) setBgData(data);
        });
    }, []);

    const handleSave = async () => {
        await localforage.setItem('bgType', bgType);
        if (bgType !== 'default') {
            await localforage.setItem('bgData', bgData);
        } else {
            await localforage.removeItem('bgData');
        }
        
        // Trigger global event so BackgroundEngine updates immediately
        window.dispatchEvent(new Event('pterodactyl:bgUpdate'));

        addFlash({
            type: 'success',
            key: 'account:background',
            message: 'Your background settings have been updated.',
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setBgData(base64);
            if (file.type.startsWith('video/')) {
                setBgType('video');
            } else {
                setBgType('image');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div css={tw`flex flex-col`}>
            <div css={tw`mb-4`}>
                <label css={tw`block text-sm text-gray-300 mb-2`}>Background Type</label>
                <select 
                    value={bgType}
                    onChange={(e) => setBgType(e.target.value as 'default' | 'image' | 'video')}
                    css={tw`w-full bg-[#1a1a1f] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500`}
                >
                    <option value="default">Default (3D Particles)</option>
                    <option value="image">Custom Image (URL / Upload)</option>
                    <option value="video">Custom Video (URL / Upload)</option>
                </select>
            </div>

            {bgType !== 'default' && (
                <div css={tw`mb-6`}>
                    <label css={tw`block text-sm text-gray-300 mb-2`}>Upload or Enter URL</label>
                    <div css={tw`flex flex-col gap-3`}>
                        <input
                            type="text"
                            placeholder="https://example.com/background.jpg"
                            value={bgData.startsWith('data:') ? '' : bgData}
                            onChange={(e) => setBgData(e.target.value)}
                            css={tw`w-full bg-[#1a1a1f] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500`}
                        />
                        <div css={tw`relative w-full h-12`}>
                            <input
                                type="file"
                                accept={bgType === 'image' ? 'image/*' : 'video/*'}
                                onChange={handleFileUpload}
                                css={tw`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10`}
                            />
                            <div css={tw`absolute inset-0 bg-[#24242a] border border-dashed border-white/20 rounded-lg flex items-center justify-center text-sm text-gray-400 font-medium pointer-events-none`}>
                                {bgData.startsWith('data:') ? 'File Selected' : 'Or Click to Upload File'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div css={tw`mt-4`}>
                <Button 
                    onClick={handleSave}
                    css={tw`w-full bg-indigo-500 hover:bg-indigo-400 border-none rounded-xl text-white font-semibold py-3 shadow-[0_4px_14px_0_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] transition-all`}
                >
                    Save Background
                </Button>
            </div>
        </div>
    );
};
