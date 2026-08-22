import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-modal";
import Link from "next/link";

export const LinkSecretoErrorMessage = ({
  linkSecretoError,
}: {
  linkSecretoError: string;
}) => {
  return (
    <AlertDialog open={!!linkSecretoError}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <AlertTriangle />
            <AlertDialogTitle>Ops, {linkSecretoError}!</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-foreground">
            Entre em contato com os administradores do evento para confirmar o
            link.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Link href="/">Ok</Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
