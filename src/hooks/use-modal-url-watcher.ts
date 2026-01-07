import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useOpenModal } from "@/store/modal-store";

export function useModalUrlWatcher() {
  const location = useLocation();
  const openModal = useOpenModal();

  useEffect(() => {
    if (location.pathname === "/projects/new") {
      openModal("create-project");
    } else if (location.pathname === "/tasks/new") {
      openModal("create-task");
    } else if (location.pathname.match(/^\/projects\/[^/]+\/tasks\/new$/)) {
      const projectId = location.pathname.split("/")[2];
      openModal("create-task", { projectId });
    }
  }, [location.pathname, openModal]);
}
