import { DetailBlur } from "@/components/DetailBlur";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function VerifyRequest() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6">
      <p className="text-xl font-bold text-primary">
        Acesse sua Conta com Segurança 🔐
      </p>

      <Card className="w-full py-4 sm:w-[480px]">
        <CardHeader className="items-center gap-2 text-center">
          <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-primary-foreground/10 bg-card">
            <Mail className="text-primary" />
          </div>
          <CardTitle>Entre em seu e-mail para continuar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          <Separator />
          <p>
            Clique no link enviado para o e-mail fornecido para completar o{" "}
            <strong className="text-primary">Login</strong>
          </p>
          <p>Dica: Veja se o email está em spam ou lixo eletrônico</p>
        </CardContent>
      </Card>

      <DetailBlur direction="bottom" side="left" />
    </div>
  );
}
