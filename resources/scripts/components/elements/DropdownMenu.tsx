import React, { createRef } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';
import Portal from '@/components/elements/Portal';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2 flex items-center rounded w-full text-gray-300`};
    transition: 150ms all ease;

    &:hover {
        ${(props) => (props.danger ? tw`text-red-400 bg-red-900 bg-opacity-50` : tw`text-white bg-gray-700`)};
    }
`;

interface State {
    posX: number;
    visible: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    menu = createRef<HTMLDivElement>();

    state: State = {
        posX: 0,
        visible: false,
    };

    componentWillUnmount() {
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        const menu = this.menu.current;

        if (this.state.visible && !prevState.visible && menu) {
            document.addEventListener('click', this.windowListener);
            document.addEventListener('contextmenu', this.contextMenuListener);
            
            // Use fixed positioning relative to viewport
            const rect = menu.getBoundingClientRect();
            const menuWidth = menu.offsetWidth || 192; // 12rem fallback
            const menuHeight = menu.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Calculate where menu should go: try to align right edge to click position
            let left = this.state.posX - menuWidth;
            
            // Clamp horizontal bounds with 8px margin
            if (left < 8) left = 8;
            if (left + menuWidth > viewportWidth - 8) left = viewportWidth - menuWidth - 8;
            
            // Clamp vertical bounds with 8px margin
            let top = rect.top;
            if (top + menuHeight > viewportHeight - 8) {
                // If it goes off the bottom, shift it up
                top = viewportHeight - menuHeight - 8;
            }
            if (top < 8) {
                // If it's taller than the screen, pin to top and enable scroll
                top = 8;
                menu.style.maxHeight = `${viewportHeight - 16}px`;
                menu.style.overflowY = 'auto';
            }
            
            // Apply positioning
            menu.style.position = 'fixed';
            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerMenu(e.clientX);
    };

    contextMenuListener = () => this.setState({ visible: false });

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;

        if (e.button === 2 || !this.state.visible || !menu) {
            return;
        }

        if (e.target === menu || menu.contains(e.target as Node)) {
            return;
        }

        if (e.target !== menu && !menu.contains(e.target as Node)) {
            this.setState({ visible: false });
        }
    };

    triggerMenu = (posX: number) =>
        this.setState((s) => ({
            posX: !s.visible ? posX : s.posX,
            visible: !s.visible,
        }));

    render() {
        return (
            <div>
                {this.props.renderToggle(this.onClickHandler)}
                <Portal>
                    <Fade timeout={150} in={this.state.visible} unmountOnExit>
                        <div
                            ref={this.menu}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ visible: false });
                            }}
                            style={{ width: '12rem' }}
                            css={tw`bg-gray-800 p-2 rounded-lg border border-gray-700 shadow-xl text-gray-300 z-[9999]`}
                        >
                            {this.props.children}
                        </div>
                    </Fade>
                </Portal>
            </div>
        );
    }
}

export default DropdownMenu;
