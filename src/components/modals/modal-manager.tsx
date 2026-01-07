import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { EditProjectModal } from "@/components/modals/edit-project-modal";
import { EditTaskModal } from "@/components/modals/edit-task-modal";
import { useModalType } from "@/store/modal-store";

export function ModalManager() {
  const modalType = useModalType();

  return (
    <>
      {modalType === "create-project" && <CreateProjectModal />}
      {modalType === "create-task" && <CreateTaskModal />}
      {modalType === "edit-project" && <EditProjectModal />}
      {modalType === "edit-task" && <EditTaskModal />}
    </>
  );
}
