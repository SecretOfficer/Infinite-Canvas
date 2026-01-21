import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';
import storage from './storage';
import { CanvasItem, CanvasState } from './types';

interface HelperState {
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useCanvasStore = create<CanvasState>()(
    temporal(
        persist(
            (set, get) => ({
                items: [],
                maxZIndex: 1,
                addItem: (item) =>
                    set((state) => ({
                        items: [...state.items, { ...item, zIndex: state.maxZIndex + 1 }],
                        maxZIndex: state.maxZIndex + 1
                    })),
                updateItem: (id, updates) =>
                    set((state) => ({
                        items: state.items.map((item) =>
                            item.id === id ? { ...item, ...updates } : item
                        ),
                    })),
                deleteItem: (id) =>
                    set((state) => ({
                        items: state.items.filter((item) => item.id !== id),
                    })),
                bringToFront: (id) =>
                    set((state) => {
                        const item = state.items.find((i) => i.id === id);
                        if (!item || item.zIndex === state.maxZIndex) return state; // No change needed

                        const newZ = state.maxZIndex + 1;
                        return {
                            items: state.items.map((i) =>
                                i.id === id ? { ...i, zIndex: newZ } : i
                            ),
                            maxZIndex: newZ,
                        };
                    }),
                setItems: (items) => set({ items }),
                isDraggingItem: false,
                setIsDraggingItem: (isDragging) => set({ isDraggingItem: isDragging }),
            }),
            {
                name: 'infinite-canvas-storage',
                storage: createJSONStorage(() => storage),
                onRehydrateStorage: () => (state) => {
                    useHydrationStore.getState().setHasHydrated(true)
                }
            }
        ),
        {
            partialize: (state) => ({
                items: state.items
            }),
            equality: (pastState, currentState) => {
                return JSON.stringify(pastState) === JSON.stringify(currentState);
            }
        }
    )
) as unknown as import('zustand').UseBoundStore<import('zustand').StoreApi<CanvasState>> & { temporal: import('zustand').StoreApi<import('zundo').TemporalState<CanvasState>> };

export const useHydrationStore = create<HelperState>((set) => ({
    _hasHydrated: false,
    setHasHydrated: (state) => set({ _hasHydrated: state }),
}));
