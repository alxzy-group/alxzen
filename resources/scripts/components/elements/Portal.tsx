import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default ({ children }: { children: React.ReactNode }) => {
    const [element, setElement] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setElement(document.getElementById('modal-portal'));
    }, []);

    if (!element) {
        return null;
    }

    return createPortal(children, element);
};
