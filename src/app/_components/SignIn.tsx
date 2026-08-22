"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn as SignInAuth } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import Fieldset from "./Fiedset";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const createEmailZod = z.object({
  email: z.string().email({ message: "Infome um e-mail válido" }),
});

type FormData = z.infer<typeof createEmailZod>;

type SignInProps = {
  className?: string;
};

export const SignIn = ({ className }: SignInProps) => {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";
  const emailParam = searchParams.get("email");
  const emailFromInvite = emailParam ? decodeURIComponent(emailParam) : null;

  const createForm = useForm<FormData>({
    resolver: zodResolver(createEmailZod),
    defaultValues: {
      email: emailFromInvite ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = createForm;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const { email } = data;
      await SignInAuth("email", {
        email,
        callbackUrl,
      });
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-col gap-4 sm:p-0">
        <CardTitle>LOGIN</CardTitle>
        <CardDescription className="text-base text-foreground">
          Você receberá um email com um botão escrito <b>Acessar conta</b>{" "}
          clique nele e você estará{" "}
          <strong className="text-primary">autenticado!</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="sm:p-0">
        <FormProvider {...createForm}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-6 flex flex-col gap-6">
              <div>
                <Fieldset className="p-0" legend="E-mail">
                  <Input
                    placeholder="seu-email@exemplo.com"
                    {...register("email")}
                    className="bg-muted"
                  />
                </Fieldset>
                <p className="pt-3 text-xs text-destructive">
                  {errors?.email?.message ? errors.email?.message : ""}
                </p>
              </div>
              <Button
                variant="default"
                type="submit"
                disabled={loading}
                className="font-semibold"
              >
                {loading ? "Enviando ✉️" : "Receber link"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
