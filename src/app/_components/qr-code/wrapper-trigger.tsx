import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";

export const WrapperTrigger = ({ children }: { children: React.ReactNode }) => {
  return (
    <Alert>
      <AlertTitle>
        Check-in com QR Code <Badge>Novo</Badge>
      </AlertTitle>
      <AlertDescription className="flex flex-col items-center justify-between gap-2 lg:flex-row">
        <div className="">
          <p>
            Agora você pode realizar check-ins de forma mais rápida e eficiente
            usando QR Code.
          </p>
          <p>
            Experimente agora esta nova funcionalidade e agilize seu check-in.
            Clique no botão para começar!
          </p>
        </div>

        {children}
      </AlertDescription>
    </Alert>
  );
};
