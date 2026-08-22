"use client";

import { type ChangeEvent, useEffect, useMemo } from "react";
import { mask } from "remask";
import { GridTwoColumns } from "../grid-two-columns";
import { ItemUser } from "./item-user";
import { checkinStatusMap, MASK_PATTERN } from "@/lib/constants";
import { ENUM_CHECKIN_STATUS, ENUM_STATUS } from "@/lib/enum";
import Fieldset from "../Fiedset";
import { Input } from "../ui/input";
import { getStatusClass } from "@/lib/utils/getStatusClass";
import { useUserCheckInStore } from "./user-checkin-store";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export const ItemsUser = () => {
  const { user, updateUserCheckInObs, setCheckinObs, checkinObs } =
    useUserCheckInStore();

  const styles = useMemo(() => {
    const statusClass = !!user && getStatusClass(user.status as ENUM_STATUS);
    const splited = statusClass.toString().split(" ");
    return {
      bg: splited[0],
      text: splited[1],
    };
  }, [user]);

  const statusLabel =
    user?.status !== ENUM_STATUS.CONFIRMADA
      ? "Pendente"
      : ENUM_STATUS.CONFIRMADA;

  const checkInStatusLabel = user?.checkinStatus
    ? checkinStatusMap[user.checkinStatus as ENUM_CHECKIN_STATUS]
    : "-";

  const checkinStatusLabelColor = useMemo(() => {
    if (user?.checkinStatus === ENUM_CHECKIN_STATUS.VALID_DOCUMENTS) {
      return "text-success";
    }
    return "text-destructive";
  }, [user]);

  const registerIsConfirmed = useMemo(() => {
    if (user?.checkinCode && user.status === ENUM_STATUS.CONFIRMADA) {
      return true;
    }
    return false;
  }, [user]);

  const documentsIsValid = useMemo(() => {
    if (
      user?.checkinCode &&
      user.checkinStatus === ENUM_CHECKIN_STATUS.VALID_DOCUMENTS
    ) {
      return true;
    }
    return false;
  }, [user]);

  const handleCheckInObsInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    const value = target.value;
    if (value) setCheckinObs(value);
  };

  const onBlurUpdateUserWithCheckInObs = () => {
    if (checkinObs) updateUserCheckInObs(checkinObs);
  };

  useEffect(() => {
    setCheckinObs(user?.check_obs ?? "");
  }, [user]);

  return (
    user && (
      <GridTwoColumns className="w-full grid-cols-2 sm:gap-2">
        <ItemUser
          label="Documentação"
          description={checkInStatusLabel.toUpperCase()}
          className="space-y-0"
          classNameDesc={`w-fit rounded-md ${checkinStatusLabelColor} p-1`}
        />
        <ItemUser
          label="Status"
          description={statusLabel.toUpperCase()}
          className="space-y-0"
          classNameDesc={`w-fit rounded-md ${styles.text} p-1 ${styles.bg}`}
        />
        <ItemUser label="Inscrição" description={user?.tipoInscricao ?? ""} />
        <ItemUser label="Nome" description={user?.nome ?? ""} />
        <ItemUser
          label="CPF"
          description={mask(user?.cpf ?? "", MASK_PATTERN.cpf)}
        />
        <ItemUser
          label="Celular"
          description={mask(user?.celular ?? "", MASK_PATTERN.phone)}
        />
        <ItemUser
          label="Família"
          description={user?.familia?.toString() ?? ""}
        />

        {registerIsConfirmed && documentsIsValid && user.checkin !== true && (
          <Fieldset
            legend="Adicione uma observação de Check-in"
            className="text-semibold col-span-full mt-3"
          >
            <Input
              noInputZoom={false}
              value={checkinObs ?? ""}
              disabled={user?.status !== ENUM_STATUS.CONFIRMADA}
              onChange={handleCheckInObsInput}
              onBlur={onBlurUpdateUserWithCheckInObs}
            />
          </Fieldset>
        )}

        {(!registerIsConfirmed || !documentsIsValid) && (
          <Alert variant="destructive" className="col-span-full text-xs">
            <AlertTitle className="text-sm">
              Não é possível realizar Check-In do inscrito.
            </AlertTitle>
            <AlertDescription className="text-xs">
              {!registerIsConfirmed && !documentsIsValid
                ? "Inscrição não Confirmada e Documentos não entregues."
                : !registerIsConfirmed
                  ? "Inscrição não Confirmada."
                  : "Documentos não foram entregues ou não foram validados."}
            </AlertDescription>
          </Alert>
        )}
      </GridTwoColumns>
    )
  );
};
