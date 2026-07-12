import { useCallback } from 'react'
import { useHistoryStore } from '@/store/editorStore'

export function useCommandHistory() {
  const { addToHistory, undo, redo, canUndo, canRedo, clear } = useHistoryStore()

  const executeCommand = useCallback((state: string) => {
    addToHistory(state)
  }, [addToHistory])

  const undoCommand = useCallback(() => {
    return undo()
  }, [undo])

  const redoCommand = useCallback(() => {
    return redo()
  }, [redo])

  return {
    executeCommand,
    undo: undoCommand,
    redo: redoCommand,
    canUndo: canUndo(),
    canRedo: canRedo(),
    clear,
  }
}
