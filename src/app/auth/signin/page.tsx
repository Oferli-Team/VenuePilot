import { getProviders } from "next-auth/react";
import { SignIn } from "@/components/SignIn";
import { DetailBlur } from "@/components/DetailBlur";
import img from "../../../../public/lading-page/layer-dashboard.png";
import { Suspense } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default async function SignInPage() {
  const providers = await getProviders();

  if (!providers) {
    return <p>...loading</p>;
  }

  const provider = Object.values(providers).find(
    (provider) => provider.id === "email",
  );

  if (!provider) {
    return <p>...loading</p>;
  }

  return (
    <div className="mx-auto grid h-full max-w-screen-xl grid-cols-1 items-center justify-end gap-4 sm:grid-cols-2">
      <div className="flex h-full w-full flex-col pl-4 pt-32 sm:pt-48">
        <div>
          <h1>Comece Agora!</h1>
          <h2>Tenha a melhor experiência de Administração de Eventos</h2>
        </div>
        <Separator className="my-6" />
        <SignIn className="border-none bg-transparent p-0" />
      </div>

      <div className="hidden h-full w-full flex-col items-center justify-center gap-6 px-4 py-24 sm:flex sm:pl-10">
        <div className="relative flex h-full flex-col justify-around rounded-lg bg-primary">
          <Image
            src={img}
            width={800}
            height={800}
            alt="image"
            className="h-auto w-full pr-6 pt-6"
          />
          <p className="p-6 font-semibold">
            Desenvolvido para o gerenciamento completo dos TOP's. Tudo em um só
            lugar, desde inscrições dos participantes até classificação das
            famílias, saúde, entrega dos bonés e muito mais.
          </p>

          <DetailBlur direction="bottom" side="left" />
        </div>
      </div>
    </div>
  );
}
