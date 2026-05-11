import { create } from 'zustand';

export type AppType = 'terminal' | 'fileManager' | 'settings' | 'webBrowser' | 'missions';

export interface WindowState {
  id: string;
  type: AppType;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface AppStore {
  windows: WindowState[];
  activeWindowId: string | null;
  openApp: (type: AppType) => void;
  closeApp: (id: string) => void;
  focusApp: (id: string) => void;
  toggleMaximize: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  windows: [],
  activeWindowId: null,
  openApp: (type) => set((state) => {
    // Check if already open
    const existing = state.windows.find(w => w.type === type);
    if (existing) {
      return { 
        activeWindowId: existing.id,
        windows: state.windows.map(w => w.id === existing.id ? { ...w, isOpen: true, zIndex: 999 } : { ...w, zIndex: 1 })
      };
    }
    
    const newWindow: WindowState = {
      id: Math.random().toString(36).substring(7),
      type,
      isOpen: true,
      isMaximized: true, // Auto-maximize on mobile
      zIndex: 999,
    };
    
    return {
      windows: [...state.windows.map(w => ({ ...w, zIndex: 1 })), newWindow],
      activeWindowId: newWindow.id
    };
  }),
  closeApp: (id) => set((state) => ({
    windows: state.windows.filter(w => w.id !== id),
    activeWindowId: state.activeWindowId === id ? null : state.activeWindowId
  })),
  focusApp: (id) => set((state) => ({
    activeWindowId: id,
    windows: state.windows.map(w => ({
      ...w,
      zIndex: w.id === id ? 999 : 1
    }))
  })),
  toggleMaximize: (id) => set((state) => ({
    windows: state.windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w)
  }))
}));
