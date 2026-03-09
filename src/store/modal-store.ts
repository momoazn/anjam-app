import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ModalType =
  | "create-project"
  | "create-task"
  | "edit-project"
  | "edit-task"
  | null;

interface ModalState {
  type: ModalType;
  isOpen: boolean;
  data?: {
    projectId?: string;
    taskId?: string;
  };
  openModal: (
    type: ModalType,
    data?: { projectId?: string; taskId?: string },
  ) => void;
  closeModal: () => void;
}

const useModalStore = create<ModalState>()(
  devtools(
    (set) => ({
      type: null,
      isOpen: false,
      data: undefined,

      openModal: (type, data) => {
        set({ type, isOpen: true, data });
      },

      closeModal: () => {
        set({ type: null, isOpen: false, data: undefined });
      },
    }),
    { name: "modal-store", enabled: import.meta.env.DEV },
  ),
);

export const useModalType = () => useModalStore((state) => state.type);
export const useModalIsOpen = () => useModalStore((state) => state.isOpen);
export const useModalData = () => useModalStore((state) => state.data);
export const useOpenModal = () => useModalStore((state) => state.openModal);
export const useCloseModal = () => useModalStore((state) => state.closeModal);
