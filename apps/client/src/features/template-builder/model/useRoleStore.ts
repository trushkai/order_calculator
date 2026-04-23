import { create } from 'zustand';
import type { RoleMode } from '@/entities/template/model/types';

interface RoleState {
  role: RoleMode;
  setRole: (role: RoleMode) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: 'admin',
  setRole: (role) => set({ role }),
}));
