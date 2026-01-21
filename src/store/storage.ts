import { get, set, del } from 'idb-keyval';
import { StateStorage } from 'zustand/middleware';

const storage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        const value = await get(name);
        return value || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

export default storage;
