import { getCurrentMembership } from "@/lib/hooks/member";
import { useEventStore } from "@/lib/store/EventStore";
import { isSuperAdmin } from "@/lib/utils/hasRole";
import { api } from "@/trpc/react";
import type { Inscricao, Member } from "@prisma/client";
import React from "react";
import type {
  AllFieldsProps,
  ENUM_CATEGORY,
} from "../inscricao-detail/allFields";
import { toast } from "../ui/use-toast";

type isEditingType = {
  personal: boolean;
  spousePersonal: boolean;
  address: boolean;
  health: boolean;
  otherInfoMedicine: boolean;
  emergency: boolean;
  letters: boolean;
  religion: boolean;
  payment: boolean;
  legendary: boolean;
  refund: boolean;
};

export function useEditUser(user: Inscricao) {
  const { event } = useEventStore();

  const { membership } = getCurrentMembership();

  const [isEditing, setIsEditing] = React.useState<isEditingType>({
    personal: false,
    spousePersonal: false,
    address: false,
    health: false,
    otherInfoMedicine: false,
    emergency: false,
    letters: false,
    religion: false,
    payment: false,
    legendary: false,
    refund: false,
  });

  const handleChangeIsEditing = (
    stateName:
      | "personal"
      | "spousePersonal"
      | "address"
      | "health"
      | "otherInfoMedicine"
      | "emergency"
      | "letters"
      | "religion"
      | "payment"
      | "legendary"
      | "refund",
  ) => {
    setIsEditing((prevState) => ({
      ...prevState,
      [stateName]: !prevState[stateName],
    }));
  };

  const utils = api.useUtils();

  const { mutateAsync: updateRegister, isPending } =
    api.inscricao.updateInscricao.useMutation({
      onError: () => {
        toast({
          title: "Ops, algo deu errado",
          description: "Não foi possível atualizar dados.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        await Promise.all([
          utils.inscricao.getPByUserId.invalidate(),
          utils.inscricao.getAllInscritosParticipantes.invalidate(),
          utils.inscricao.getAllRegistersWithPagination.invalidate(),
        ]);

        toast({
          title: "Dados atualizados com sucesso",
          variant: "success",
        });
      },
    });

  const { mutateAsync: updateRemRegister, isPending: loadingRem } =
    api.inscricao.updateRegisterEditingUser.useMutation({
      onError: () => {
        toast({
          title: "Ops, algo deu errado",
          description: "Não foi possível atualizar dados.",
          variant: "destructive",
        });
      },
      onSuccess: async () => {
        await Promise.all([
          utils.inscricao.getPByUserId.invalidate(),
          utils.inscricao.getAllInscritosParticipantes.invalidate(),
          utils.inscricao.getAllRegistersWithPagination.invalidate(),
        ]);

        toast({
          title: "Dados atualizados com sucesso",
          variant: "success",
        });
      },
    });

  const shouldHideField = (
    tipoInscricao: "PARTICIPANTE" | "SERVIR",
    fieldId: string,
  ) => {
    const fieldsToHide = {
      SERVIR: ["comoConheceuLegendarios", "quemConvidou", "tamanhoFarda"],
      PARTICIPANTE: [""],
    };

    return fieldsToHide[tipoInscricao]?.includes(fieldId);
  };

  type EditRules = Record<
    string,
    (
      isEditing: isEditingType,
      membership?: Member,
      eventEnded?: boolean,
    ) => boolean
  >;

  const editRules: EditRules = {
    status: (isEditing, membership, eventEnded) =>
      !eventEnded && (isEditing.personal || isEditing.legendary) && isSuperAdmin(membership),
    createdAt: () => false,
    imc: () => false,
    spouseCPF: () => false,
    linkSecreto: () => false,
    tipoInscricao: (isEditing, membership) =>
      isEditing && isSuperAdmin(membership),
    pagamento_link_url: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_top_value: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_total_value: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_discount_value: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_couponValue: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_fee_card: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_data: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    pagamento_status: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
    metodo_pagamento: (isEditing, membership, eventEnded) =>
      !eventEnded && isEditing.payment && isSuperAdmin(membership),
  };

  const now = new Date();
  const eventEnded = event && event.dataFim <= now;

  function canEditField(fieldId: string): boolean {
    const rule = editRules[fieldId];

    if (rule) {
      return rule(isEditing, membership, !!eventEnded);
    }
    return true;
  }

  type Category = keyof typeof ENUM_CATEGORY;
  const filterFieldsToRenderByCategory = (
    fields: AllFieldsProps[],
    categories: Category[],
  ) => {
    return fields
      .filter((field) => categories.includes(field.category))
      .filter(
        (field) =>
          !shouldHideField(
            user.tipoInscricao as "PARTICIPANTE" | "SERVIR",
            field.id,
          ),
      );
  };

  return {
    updateRegister,
    updateRemRegister,
    loading: isPending,
    loadingRem,
    isEditing,
    handleChangeIsEditing,
    filterFieldsToRenderByCategory,
    canEditField,
    eventEnded,
  };
}
