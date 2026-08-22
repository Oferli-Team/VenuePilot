import { CircleCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";

type SuccessCard = {
  title: string;
  description?: string;
  content?: React.ReactNode;
  className?: string;
};

export const SuccessCard = ({
  title,
  description,
  content,
  className,
}: SuccessCard) => {
  return (
    <Card className={cn("relative overflow-hidden py-5", className)}>
      <div className="absolute left-1/2 top-0 z-0 h-24 w-1/2 -translate-x-1/2 rounded-full bg-success/20 blur-2xl" />

      <CardHeader className="flex flex-col items-center justify-center space-y-4">
        <div className="rounded-lg bg-success p-3 shadow-md">
          <CircleCheck className="h-6 w-6 shadow-none" />
        </div>
        <div className="space-y-2 text-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      {content && (
        <CardContent className="flex flex-col items-center justify-center">
          {content}
        </CardContent>
      )}
    </Card>
  );
};
