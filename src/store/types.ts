export type CanvasItemType = 'note' | 'image';

export interface CanvasItem {
    id: string;
    type: CanvasItemType;
    x: number;
    y: number;
    content: string; // Text content or Base64 image string
    width: number;
    height: number;
    color?: string; // For notes
    zIndex: number;
}

export interface CanvasState {
    items: CanvasItem[];
    maxZIndex: number;
    addItem: (item: CanvasItem) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>) => void;
    deleteItem: (id: string) => void;
    bringToFront: (id: string) => void;
    setItems: (items: CanvasItem[]) => void;
    isDraggingItem: boolean;
    setIsDraggingItem: (isDragging: boolean) => void;
}
