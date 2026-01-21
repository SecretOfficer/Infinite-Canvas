'use client';

import { useCanvasStore } from '@/store/useStore';
import { generateId } from '@/utils/ids';
import { compressImage } from '@/utils/image';
import { useStore } from 'zustand';
import { Undo, Redo, PlusSquare, Image as ImageIcon, Save, FolderOpen, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { CanvasItem } from '@/store/types'; // Ensure this is imported
import storage from '@/store/storage';

export default function Toolbar() {
    const addItem = useCanvasStore((state) => state.addItem);
    const setItems = useCanvasStore((state) => state.setItems);

    // Zundo temporal store access
    const temporal = useCanvasStore.temporal;
    const { undo, redo, pastStates, futureStates } = useStore(temporal, (state) => state);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddNote = () => {
        addItem({
            id: generateId(),
            type: 'note',
            x: Math.random() * 200 + 100,
            y: Math.random() * 200 + 100,
            content: '',
            width: 200,
            height: 150,
            zIndex: 10,
        });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const base64 = await compressImage(file);
            addItem({
                id: generateId(),
                type: 'image',
                x: Math.random() * 200 + 100,
                y: Math.random() * 200 + 100,
                content: base64,
                width: 300, // Default width
                height: 300, // Placeholder, will be auto-calculated? Or just let CSS handle max-width.
                zIndex: 10
            });
        } catch (err) {
            console.error("Image upload failed", err);
            alert("Failed to process image.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSaveSnapshot = async () => {
        const name = prompt("Enter snapshot name:");
        if (!name) return;
        const items = useCanvasStore.getState().items;
        try {
            await storage.setItem(`snapshot_${name}`, JSON.stringify(items));
            alert("Snapshot saved!");
        } catch (e) {
            console.error(e);
            alert("Failed to save snapshot.");
        }
    };

    const handleLoadSnapshot = async () => {
        const name = prompt("Enter snapshot name to load:");
        if (!name) return;
        try {
            const data = await storage.getItem(`snapshot_${name}`);
            if (data) {
                const items = JSON.parse(data);
                setItems(items);
                // Clear history maybe?
                temporal.getState().clear();
            } else {
                alert("Snapshot not found.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load snapshot.");
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-xl rounded-2xl p-2 flex items-center gap-2 border border-gray-200 z-50">

            <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-2">
                <button
                    onClick={() => undo()}
                    disabled={pastStates.length === 0}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                    title="Undo"
                >
                    <Undo size={20} />
                </button>
                <button
                    onClick={() => redo()}
                    disabled={futureStates.length === 0}
                    className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                    title="Redo"
                >
                    <Redo size={20} />
                </button>
            </div>

            <button
                onClick={handleAddNote}
                className="p-2 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors flex flex-col items-center gap-1 min-w-[3rem]"
            >
                <PlusSquare size={20} />
                <span className="text-[10px] font-medium">Note</span>
            </button>

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex flex-col items-center gap-1 min-w-[3rem]"
            >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                <span className="text-[10px] font-medium">Image</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            <div className="w-px h-8 bg-gray-200 mx-1" />

            <button
                onClick={handleSaveSnapshot}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Save Snapshot"
            >
                <Save size={20} />
            </button>
            <button
                onClick={handleLoadSnapshot}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Load Snapshot"
            >
                <FolderOpen size={20} />
            </button>

        </div>
    );
}
