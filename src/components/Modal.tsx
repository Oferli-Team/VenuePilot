import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

type ModalProps = {
  children: React.ReactNode;
  btnClose: React.ReactNode;
  isOpen: boolean;
};

export const Modal = ({ children, btnClose, isOpen }: ModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const onClose = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed bottom-0 left-0 right-0 top-0 z-[500] flex items-center justify-center bg-background/30 backdrop-blur-sm backdrop-filter"
    >
      <Card className="relative m-2 bg-background py-4 sm:min-w-[30rem] sm:px-6 md:m-0">
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 m-1 h-6 w-6"
          onClick={onClose}
        >
          {btnClose}
        </Button>
        {children}
      </Card>
    </div>
  );
};
