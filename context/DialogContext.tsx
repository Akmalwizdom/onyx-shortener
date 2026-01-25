'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CyberDialog } from '@/components/ui/CyberDialog';

interface DialogContextType {
  confirm: (title: string, message: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const resolveRef = useRef<(value: boolean) => void>(() => {});

  const confirm = useCallback((title: string, message: string) => {
    setDialog({
      isOpen: true,
      title,
      message,
    });

    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current(true);
  }, []);

  const handleCancel = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    resolveRef.current(false);
  }, []);

  return (
    <DialogContext.Provider value={{ confirm }}>
      {children}
      <CyberDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a DialogProvider');
  }
  return context;
}
