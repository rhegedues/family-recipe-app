import { useEffect, useRef } from "react";

export function useShortcuts(map: Record<string, (e: KeyboardEvent) => void>, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    const onKey = (e: KeyboardEvent) => {
      const key = (e.ctrlKey || e.metaKey) && e.key === 'Enter' ? 'MOD+Enter' : e.key;
      map[key]?.(e);
    };
    
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, map]);
}

// Hook to manage focus restoration for dialogs
export function useFocusRestore(open: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (open) {
      // Store the currently focused element when dialog opens
      triggerRef.current = document.activeElement as HTMLElement;
    } else if (triggerRef.current) {
      // Restore focus when dialog closes
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);
  
  return triggerRef;
}
