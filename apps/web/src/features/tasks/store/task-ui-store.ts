import { create } from "zustand";

type TaskDrawerMode = "create" | "edit";

type TaskUiState = {
  isTaskDrawerOpen: boolean;
  drawerMode: TaskDrawerMode;
  selectedTaskId: string | null;
  openDrawer: (mode: TaskDrawerMode, taskId?: string) => void;
  closeDrawer: () => void;
};

export const useTaskUiStore = create<TaskUiState>((set) => ({
  isTaskDrawerOpen: false,
  drawerMode: "create",
  selectedTaskId: null,
  openDrawer: (mode, taskId) =>
    set({
      isTaskDrawerOpen: true,
      drawerMode: mode,
      selectedTaskId: taskId ?? null
    }),
  closeDrawer: () =>
    set({
      isTaskDrawerOpen: false,
      drawerMode: "create",
      selectedTaskId: null
    })
}));
