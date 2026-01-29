import { useCallback, useState } from "react";

export function useTaskSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    setSelectedTasks([]);
  }, []);

  const handleSelectionChange = useCallback((taskIds: string[]) => {
    setSelectedTasks(taskIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTasks([]);
  }, []);

  const selectAll = useCallback((taskIds: string[]) => {
    setSelectedTasks(taskIds);
  }, []);

  const isSelected = useCallback(
    (taskId: string) => {
      return selectedTasks.includes(taskId);
    },
    [selectedTasks],
  );

  const toggleTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      }
      return [...prev, taskId];
    });
  }, []);

  return {
    selectionMode,
    selectedTasks,
    toggleSelectionMode,
    handleSelectionChange,
    clearSelection,
    selectAll,
    isSelected,
    toggleTask,
  };
}
