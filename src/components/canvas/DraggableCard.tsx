'use client';

import { useEffect, useState } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { CanvasItem } from '@/store/types';
import { useCanvasStore } from '@/store/useStore';
import { X, GripVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DraggableCardProps {
    item: CanvasItem;
    scale: number;
}

export default function DraggableCard({ item, scale }: DraggableCardProps) {
    const updateItem = useCanvasStore((state) => state.updateItem);
    const bringToFront = useCanvasStore((state) => state.bringToFront);
    const deleteItem = useCanvasStore((state) => state.deleteItem);
    const setIsDraggingItem = useCanvasStore((state) => state.setIsDraggingItem);

    const [isDragging, setIsDragging] = useState(false);
    const controls = useDragControls();

    // Use motion values to manually sync state, ensuring Undo overrides internal drag state
    const x = useMotionValue(item.x);
    const y = useMotionValue(item.y);

    useEffect(() => {
        x.set(item.x);
        y.set(item.y);
    }, [item.x, item.y, x, y]);

    return (
        <motion.div
            drag
            dragMomentum={false}
            dragControls={controls}
            dragListener={false}
            style={{ x, y, touchAction: 'none', zIndex: item.zIndex, width: item.width }}
            onDragStart={() => {
                setIsDragging(true);
                setIsDraggingItem(true);
                // bringToFront handled in onPointerDown to avoid double-history or race
            }}
            onDragEnd={(_, info) => {
                setIsDragging(false);
                setIsDraggingItem(false);
                updateItem(item.id, {
                    x: item.x + info.offset.x,
                    y: item.y + info.offset.y,
                });
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
                // Pause history for Z-index change so "Undo" only reverts the move, not the click
                const temporal = useCanvasStore.temporal.getState();
                temporal.pause();
                bringToFront(item.id);
                temporal.resume();
            }}
            className={cn(
                "absolute flex flex-col shadow-md rounded-lg overflow-hidden group border border-transparent hover:border-blue-400 transition-colors nopan",
                item.type === 'note' ? "bg-yellow-100" : "bg-white",
                "w-fit h-fit"
            )}
        >
            {/* Header / Drag Handle */}
            <div
                onPointerDown={(e) => { controls.start(e) }}
                className="h-6 bg-black/5 hover:bg-black/10 cursor-grab active:cursor-grabbing flex items-center justify-between px-1"
            >
                <GripVertical size={14} className="opacity-50" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 rounded text-red-600 transition-opacity"
                >
                    <X size={14} />
                </button>
            </div>

            {item.type === 'note' ? (
                <textarea
                    className="w-full h-full bg-transparent resize-none outline-none p-3 text-sm font-medium text-gray-800 min-h-[100px] min-w-[200px] cursor-text select-text nopan"
                    value={item.content}
                    onChange={(e) => {
                        updateItem(item.id, { content: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Type something..."
                    style={{ height: item.height }}
                />
            ) : (
                <div className="relative group/image">
                    <img
                        src={item.content}
                        alt="Upload"
                        className="pointer-events-none select-none block"
                        draggable={false}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block'
                        }}
                    />
                </div>
            )}
        </motion.div>
    );
}
