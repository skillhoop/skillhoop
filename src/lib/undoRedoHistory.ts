/**
 * Undo/Redo History Management
 * Manages history stack for undo/redo functionality
 */

import { ResumeData } from '../types/resume';

export interface HistoryState {
  past: ResumeData[];
  present: ResumeData;
  future: ResumeData[];
}

const MAX_HISTORY_SIZE = 50; // Maximum number of undo steps

/**
 * Create initial history state
 */
export function createHistoryState(initialState: ResumeData): HistoryState {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

/**
 * Add a new state to history
 * This should be called when the user makes a change
 */
export function addToHistory(
  history: HistoryState,
  newState: ResumeData
): HistoryState {
  // Don't add if state hasn't changed
  if (JSON.stringify(history.present) === JSON.stringify(newState)) {
    return history;
  }

  const newPast = [...history.past, history.present];
  
  // Limit history size
  const trimmedPast = newPast.length > MAX_HISTORY_SIZE
    ? newPast.slice(-MAX_HISTORY_SIZE)
    : newPast;

  return {
    past: trimmedPast,
    present: newState,
    future: [], // Clear redo stack when new action is performed
  };
}

/**
 * Undo - move current state to future, restore previous state
 */
export function undo(history: HistoryState): HistoryState | null {
  if (history.past.length === 0) {
    return null; // Nothing to undo
  }

  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);
  const newFuture = [history.present, ...history.future];

  return {
    past: newPast,
    present: previous,
    future: newFuture,
  };
}

/**
 * Redo - move current state to past, restore next state
 */
export function redo(history: HistoryState): HistoryState | null {
  if (history.future.length === 0) {
    return null; // Nothing to redo
  }

  const next = history.future[0];
  const newPast = [...history.past, history.present];
  const newFuture = history.future.slice(1);

  return {
    past: newPast,
    present: next,
    future: newFuture,
  };
}

/**
 * Check if undo is available
 */
export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

/**
 * Get current state from history
 */
export function getCurrentState(history: HistoryState): ResumeData {
  return history.present;
}

/**
 * Clear history (useful when loading a new resume)
 */
export function clearHistory(initialState: ResumeData): HistoryState {
  return createHistoryState(initialState);
}

/**
 * Get history statistics
 */
export function getHistoryStats(history: HistoryState): {
  undoSteps: number;
  redoSteps: number;
} {
  return {
    undoSteps: history.past.length,
    redoSteps: history.future.length,
  };
}



