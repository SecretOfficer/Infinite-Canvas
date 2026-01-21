'use client';

import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useCanvasStore, useHydrationStore } from '@/store/useStore';
import DraggableCard from './DraggableCard';
import { useEffect, useState } from 'react';
import { generateId } from '@/utils/ids';

export default function CanvasBoard() {
    const items = useCanvasStore((state) => state.items);
    const addItem = useCanvasStore((state) => state.addItem);
    const isDraggingItem = useCanvasStore((state) => state.isDraggingItem);
    const hasHydrated = useHydrationStore((state) => state._hasHydrated);

    // Mount check to avoid hydration mismatch with IDB loading steps if any (though logic handles it)
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    useCanvasStore.temporal.getState().redo();
                } else {
                    useCanvasStore.temporal.getState().undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                useCanvasStore.temporal.getState().redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!mounted || !hasHydrated) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-50 text-gray-400">
                Loading Canvas...
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-gray-50 overflow-hidden relative">
            <TransformWrapper
                initialScale={1}
                minScale={0.1}
                maxScale={4}
                centerOnInit
                limitToBounds={false}
                panning={{ velocityDisabled: true, disabled: isDraggingItem, excluded: ['nopan'] }} // Disable panning when dragging items, and ignore nopan elements (textareas)
                doubleClick={{ disabled: true }} // Handle double click manually for adding notes
            >
                {({ zoomToElement, resetTransform, setTransform, ...rest }) => (
                    <>
                        {/* We can expose these controls via context or refs if needed by toolbar */}
                        <TransformComponent
                            wrapperClass="w-full h-screen"
                            contentClass="w-full h-screen relative" // Ensure relative for absolute children
                            contentStyle={{ width: '100%', height: '100%' }} // Infinite illusion relies on unbound logic usually, but here likely just a very large area or virtual.
                        // react-zoom-pan-pinch's content is the "canvas".
                        >
                            <div
                                className="w-[10000px] h-[10000px] bg-slate-50 relative" // Giant fixed canvas for "infinite" feel
                                style={{
                                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}
                                onDoubleClick={(e) => {
                                    // Coordinates relative to the container
                                    // rect gives us the viewport position
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    // But we need the position relative to the transform content (0,0 of this div)
                                    // e.nativeEvent.offsetX/Y is usually reliable on the target
                                    if (e.target !== e.currentTarget) return; // Ignore if clicking on an item

                                    const x = e.nativeEvent.offsetX;
                                    const y = e.nativeEvent.offsetY;

                                    addItem({
                                        id: generateId(),
                                        type: 'note',
                                        x: x - 100, // Center roughly
                                        y: y - 50,
                                        content: '',
                                        width: 200,
                                        height: 150,
                                        zIndex: 1,
                                    });
                                }}
                            >
                                {items.map((item) => (
                                    <DraggableCard key={item.id} item={item} scale={rest.instance.transformState.scale} />
                                ))}
                            </div>
                        </TransformComponent>

                        {/* Controls can be injected here or outside */}
                    </>
                )}
            </TransformWrapper>
        </div>
    );
}
