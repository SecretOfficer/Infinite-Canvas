import CanvasBoard from '@/components/canvas/CanvasBoard';
import Toolbar from '@/components/ui/Toolbar';

export default function Home() {
    return (
        <main className="relative w-full h-full">
            <CanvasBoard />
            <Toolbar />
        </main>
    );
}
