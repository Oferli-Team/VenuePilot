"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface AlertModalProps {
  title: string;
  description: string;
  name?: string;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AlertModal = ({
  title,
  description,
  name,
  isOpen,
  onClose,
  onConfirm,
  loading,
}: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-x-2">
          <span>Certeza que deseja deletar</span>
          <span className="text-lg font-bold text-red-500">{name}</span>?
        </div>
        <div className="flex w-full items-center justify-end space-x-2 pt-6">
          <Button disabled={loading} variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={loading} variant="destructive" onClick={onConfirm}>
            Deletar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
