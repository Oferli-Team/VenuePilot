"use client";

import { ActionsButtonTable } from "@/components/actions-button-table";
import { CheckinButton } from "@/components/checkin/checkin-button";
import { SelectFamily } from "@/components/select-family";
import { Button } from "@/components/ui/button";
import {
  addColorByPaymentStatus,
  getStatusClass,
} from "@/lib/utils/getStatusClass";
import { filterFn, multiColumnFilter } from "@/lib/utils/filterColumn";
import type { Evento, Inscricao } from "@prisma/client";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { type ColumnDef } from "@tanstack/react-table";
import { ParticipantNumberInput } from "@/components/participant-number-input";
import { SelectHealth } from "@/components/hakuna/select-health";
import { SelectLgndJob } from "@/components/select-lgnd-job";
import { Award, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LettersReceivedButton } from "@/components/cartas/letters-recieved-button";
import { ContactIsValidButton } from "@/components/cartas/contact-isvalid-button";
import { paymentStatusOptions, statusOptions } from "../constants";
import { classifyIMC } from "../utils/classifyIMC";
import { calculateAge } from "../utils/calculateAge";
import { formatDateToDDMMYYYY } from "../utils/formatDateToDDMMYYYY";
import { SelectVehicleParticipants } from "@/components/select-vehicle-participants";
import { SelectVehicleLegendary } from "@/components/select-vehicle-legendary";
import { InternationalPhoneWppButton } from "@/components/international-phone-wpp-button";
import {
  ENUM_EVENT_TYPE,
  type ENUM_PAYMENT_STATUS,
  type ENUM_STATUS,
  type ENUM_CHECKIN_STATUS,
} from "../enum";
import { CheckInStatusSelect } from "@/components/checkin/checkin-status-select";
import { CheckInStatusInfoCardHover } from "@/components/checkin-status-info-card-hover";
import { CPFMask } from "@/components/ui/cpf-mask";
import { Badge } from "@/components/ui/badge";

// Função para formatar booleanos para "Sim" ou "Não"
const formatBoolean = (value: boolean | undefined): string =>
  value ? "Sim" : "Não";

// Função para formatar data para "dd-mm-yyyy"
const formatDateDMY = (date: Date | undefined): string => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}/${month}/${year}`;
};

type CustomHeaderProps = {
  value: string | number;
  className?: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ value, className }) => {
  return <div className={`truncate ${className ?? ""}`}>{value}</div>;
};

type CustomCellProps = {
  value: string | number;
  className?: string;
};

const CustomCell: React.FC<CustomCellProps> = ({ value, className }) => {
  return <div className={`truncate  ${className ?? ""}`}>{value}</div>;
};

const CustomLegendaryCertificate: React.FC<{
  legendaryNumber: string;
  legendaryCertificate?: boolean;
  eventType: ENUM_EVENT_TYPE;
}> = ({ legendaryCertificate, legendaryNumber, eventType }) => {
  return (
    <p className="text-sm text-muted-foreground">
      LGND {legendaryNumber}
      {eventType === ENUM_EVENT_TYPE.LEGENDARIOS && (
        <b
          className={`text-xs font-normal ${legendaryCertificate ? "text-success" : "text-muted-foreground"}`}
        >
          {" "}
          | {legendaryCertificate ? "Certificado" : "Não certificado"}
        </b>
      )}
    </p>
  );
};

type RegisterWithEvent = Inscricao & {
  evento: Pick<
    Evento,
    "topNumero" | "pista" | "dataInicio" | "dataFim" | "type"
  >;
};

export const allColumns: ColumnDef<RegisterWithEvent>[] = [
  {
    id: "index",
    enableHiding: true,
    accessorKey: "index",
    header: () => <CustomHeader value="Nr" />,
    cell: ({ row, table }) => {
      const sortedIndex = table
        .getSortedRowModel()
        .rows.findIndex((sortedRow) => sortedRow.id === row.id);
      return sortedIndex + 1;
    },
  },
  {
    id: "actions",
    enableHiding: true,
    accessorKey: "actions",
    header: () => <CustomHeader className="text-center" value="Ações" />,
    cell: ({ row }) => {
      return (
        <ActionsButtonTable
          registerId={row.original.id}
          checkinStatus={
            (row.original.checkinStatus as ENUM_CHECKIN_STATUS) ?? null
          }
        />
      );
    },
  },
  {
    id: "cartas_contato_valido",
    enableHiding: true,
    accessorKey: "cartas_contato_valido",
    header: () => <CustomHeader value="Contato?" />,
    cell: ({ row }) => {
      return (
        <ContactIsValidButton
          inscricao={row.original}
          initialState={row.original.cartas_contato_valido}
        />
      );
    },
  },
  {
    id: "cartas_recebida",
    enableHiding: true,
    accessorKey: "cartas_recebida",
    header: () => <CustomHeader value="Cartas?" />,
    cell: ({ row }) => {
      return (
        <LettersReceivedButton
          inscricao={row.original}
          initialState={row.original.cartas_recebida}
        />
      );
    },
  },
  {
    id: "cartas_obs",
    enableHiding: true,
    accessorKey: "cartas_obs",
    header: () => <CustomHeader value="Obs Cartas" />,
    cell: ({ row }) => (
      <CustomCell
        className="min-w-56 text-wrap"
        value={row.getValue("cartas_obs")}
      />
    ),
  },
  {
    enableHiding: true,
    id: "checkin",
    accessorKey: "checkin",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Check-in
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <CheckinButton
          id={row.original.id}
          initialCheckinStatus={row.original.checkin ?? false}
        />
      </div>
    ),
    accessorFn: (row) => row.checkin,
    enableSorting: true,
  },
  {
    enableHiding: true,
    id: "checkinStatus",
    accessorKey: "checkinStatus",
    header: () => {
      return (
        <div className="flex items-center justify-center gap-2">
          <p>Documentos</p>
          <CheckInStatusInfoCardHover />
        </div>
      );
    },
    cell: ({ row }) => {
      const value = row.original.checkinStatus as ENUM_CHECKIN_STATUS;
      return (
        <CheckInStatusSelect
          name={row.original.nome ?? ""}
          initialValue={value}
          registerId={row.original.id}
        />
      );
    },
  },
  {
    id: "familia",
    accessorKey: "familia",
    filterFn: filterFn,
    enableHiding: true,
    accessorFn: (row) => row.familia,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Família
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <SelectFamily row={row} />,
    enableSorting: true,
    sortingFn: (rowA, rowB, columnId) => {
      const familiaA = Number(rowA.getValue(columnId));
      const familiaB = Number(rowB.getValue(columnId));
      return isNaN(familiaA) || isNaN(familiaB) ? 0 : familiaA - familiaB;
    },
  },
  {
    id: "saude",
    accessorKey: "saude",
    enableHiding: true,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Saúde
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <SelectHealth row={row} />,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: () => <CustomHeader value="Data Insc" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("createdAt"))} />
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: () => <CustomHeader value="Status" className="text-center" />,
    cell: ({ row }) => {
      const value: ENUM_STATUS = row.getValue("status");
      const label = statusOptions.find(
        (status) => status.value === value,
      )?.label;
      return (
        <div className="flex w-full justify-center">
          <Badge
            variant="secondary"
            className={`w-max self-center text-xs ${getStatusClass(value)}`}
          >
            {label}
          </Badge>
        </div>
      );
    },

    filterFn: multiColumnFilter,
  },
  {
    id: "nrLgnd",
    accessorKey: "nrLgnd",
    header: () => <CustomHeader value="Nr Legendário" className="capitalize" />,
    cell: ({ row }) => <ParticipantNumberInput type="nrLgnd" row={row} />,
    filterFn: multiColumnFilter,
  },
  {
    id: "nrRem",
    accessorKey: "nrRem",
    header: () => (
      <CustomHeader value="Nr REM do casal" className="capitalize" />
    ),
    cell: ({ row }) => <ParticipantNumberInput type="nrRem" row={row} />,
    filterFn: multiColumnFilter,
  },
  {
    id: "nome",
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Nome</span>
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const cpf: string | undefined = row.getValue("cpf") ?? undefined;
      const participantType = row.original.tipoInscricao;
      const legendaryCertificate = row.original.lgndCertificado!;
      const legendaryNumber = row.original.nrLgnd;

      const eventType = row.original.evento.type as ENUM_EVENT_TYPE;
      return (
        <div className="min-w-max">
          <p>{row.original.nome}</p>
          {participantType === "PARTICIPANTE" && cpf ? (
            <CPFMask value={cpf} />
          ) : (
            legendaryNumber && (
              <CustomLegendaryCertificate
                eventType={eventType}
                legendaryCertificate={
                  eventType === ENUM_EVENT_TYPE.LEGENDARIOS
                    ? legendaryCertificate
                    : undefined
                }
                legendaryNumber={legendaryNumber}
              />
            )
          )}
        </div>
      );
    },
    filterFn: multiColumnFilter,
  },
  {
    id: "spouseAge",
    accessorKey: "spouseAge",
    header: () => <CustomHeader value="Idade Esposa" className="text-center" />,
    cell: ({ row }) => {
      const spouseBirthDate =
        row.original.spouseBirthDate &&
        formatDateToDDMMYYYY(row.original.spouseBirthDate);
      const age = spouseBirthDate && calculateAge(spouseBirthDate);
      return <CustomCell className="text-center" value={age ?? "-"} />;
    },
  },
  {
    id: "spouseName",
    accessorKey: "spouseName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Cônjuge</span>
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const cpf: string | undefined = row.getValue("spouseCPF") ?? undefined;
      return (
        <div className="min-w-max">
          <p>{row.original.spouseName}</p>
          {cpf && <CPFMask value={cpf} />}
        </div>
      );
    },
  },
  {
    id: "spouseCPF",
    accessorKey: "spouseCPF",
    enableHiding: true,
    header: () => (
      <CustomHeader
        value="Cônjuge CPF"
        className="whitespace-pre-wrap text-center"
      />
    ),
    cell: ({ row }) => <CPFMask value={row.getValue("spouseCPF")} />,
    enableSorting: true,
  },
  {
    id: "spousePhoneNumber",
    accessorKey: "spousePhoneNumber",
    enableHiding: true,
    header: () => (
      <CustomHeader value="Cônjuge Celular" className="text-center" />
    ),
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.spousePhoneNumber ?? ""}
      />
    ),
  },
  {
    id: "spouseEmail",
    accessorKey: "spouseEmail",
    enableHiding: true,
    header: () => (
      <CustomHeader value="Cônjuge Email" className="text-center" />
    ),
    cell: ({ row }) => <CustomCell value={row.getValue("spouseEmail")} />,
  },
  {
    accessorKey: "spouseBirthDate",
    header: () => <CustomHeader value="Cônjuge Nascimento" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("spouseBirthDate"))} />
    ),
  },
  {
    id: "womanTshirtSize",
    accessorKey: "womanTshirtSize",
    enableHiding: true,
    header: () => (
      <CustomHeader
        value="Camiseta Esposa"
        className="whitespace-pre-wrap text-center"
      />
    ),
    cell: ({ row }) => (
      <CustomCell
        className="text-center"
        value={row.getValue("womanTshirtSize")}
      />
    ),
    enableSorting: true,
  },
  {
    id: "manTshirtSize",
    accessorKey: "manTshirtSize",
    enableHiding: true,
    header: () => (
      <CustomHeader
        value="Camiseta Esposo"
        className="whitespace-pre-wrap text-center"
      />
    ),
    cell: ({ row }) => (
      <CustomCell
        className="text-center"
        value={row.getValue("manTshirtSize")}
      />
    ),
    enableSorting: true,
  },
  {
    id: "hasHealthIssues",
    accessorKey: "hasHealthIssues",
    enableHiding: true,
    header: () => (
      <CustomHeader value="Problema de saúde?" className="text-center" />
    ),
    cell: ({ row }) => {
      const value = formatBoolean(row.original.hasHealthIssues ?? false);
      return <CustomCell className="text-center" value={value} />;
    },
    enableSorting: true,
  },
  {
    id: "healthIssuesDescription",
    accessorKey: "healthIssuesDescription",
    enableHiding: true,
    header: () => (
      <CustomHeader value="Descrição de saúde" className="text-center" />
    ),
    cell: ({ row }) => (
      <CustomCell value={row.getValue("healthIssuesDescription")} />
    ),
    enableSorting: true,
  },
  {
    id: "isPregnant",
    accessorKey: "isPregnant",
    enableHiding: true,
    header: () => (
      <CustomHeader
        value="Esposa Grávida?"
        className="whitespace-pre-wrap text-center"
      />
    ),
    cell: ({ row }) => {
      const value = formatBoolean(row.original.isPregnant ?? false);
      return <CustomCell className="text-center" value={value} />;
    },
    enableSorting: true,
  },
  {
    id: "lgnd_funcao",
    accessorKey: "lgnd_funcao",
    enableHiding: true,
    filterFn: filterFn,
    header: () => <CustomHeader value="Função" className="text-center" />,
    cell: ({ row }) => <SelectLgndJob row={row} />,
    enableSorting: true,
  },
  {
    id: "vehicleId",
    accessorKey: "vehicleId",
    enableHiding: true,
    filterFn: filterFn,
    header: () => <CustomHeader value="Viatura" className="text-center" />,
    cell: ({ row }) => {
      if (row.original.tipoInscricao === "PARTICIPANTE") {
        return <SelectVehicleParticipants row={row} />;
      }
      return <SelectVehicleLegendary row={row} />;
    },
    enableSorting: true,
  },
  {
    id: "lgndCertificado",
    accessorKey: "lgndCertificado",
    header: () => <CustomHeader value="Certificado" />,
    cell: ({ row }) => {
      const isCertified = row.getValue("lgndCertificado");
      const certifedString = formatBoolean(row.getValue("lgndCertificado"));

      return (
        <div className="flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {isCertified ? (
                  <Award className="text-success/80" />
                ) : (
                  <X className="text-destructive/80" />
                )}
              </TooltipTrigger>
              <TooltipContent>{certifedString}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "possuiAutorizacaoServir",
    header: () => <CustomHeader value="Possui autorização" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("possuiAutorizacaoServir")} />
    ),
  },
  {
    id: "cpf",
    accessorKey: "cpf",
    header: () => <CustomHeader value="CPF" />,
    cell: ({ row }) => <CPFMask value={row.getValue("cpf")} />,
    filterFn: multiColumnFilter,
  },
  {
    id: "celular",
    accessorKey: "celular",
    header: () => <CustomHeader className="text-center" value="Celular" />,
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.celular ?? ""}
      />
    ),
  },
  {
    accessorKey: "dataNascimento",
    header: () => <CustomHeader value="Nascimento" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("dataNascimento"))} />
    ),
  },
  {
    accessorKey: "idade",
    header: () => <CustomHeader value="Idade" className="text-center" />,
    cell: ({ row }) => {
      const dataNascimento = formatDateToDDMMYYYY(row.original.dataNascimento);
      const idade = calculateAge(dataNascimento);
      return <CustomCell className="text-center" value={idade} />;
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>Email</span>
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <CustomCell value={row.getValue("email")} className="lowercase" />
    ),
    filterFn: multiColumnFilter,
  },
  {
    accessorKey: "igreja",
    header: () => <CustomHeader value="Igreja" />,
    cell: ({ row }) => <CustomCell value={row.getValue("igreja")} />,
  },
  {
    accessorKey: "igrejaPastor",
    header: () => <CustomHeader value="Líder Espiritual" />,
    cell: ({ row }) => <CustomCell value={row.getValue("igrejaPastor")} />,
  },
  {
    accessorKey: "estadoCivil",
    header: () => <CustomHeader className="text-center" value="Estado Civil" />,
    cell: ({ row }) => (
      <CustomCell className="text-center" value={row.getValue("estadoCivil")} />
    ),
  },
  {
    accessorKey: "temFilhos",
    header: () => <CustomHeader value="Tem Filhos" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("temFilhos"))} />
    ),
  },
  {
    accessorKey: "qtdFilhos",
    header: () => <CustomHeader value="Qtd de Filhos" />,
    cell: ({ row }) => <CustomCell value={row.getValue("qtdFilhos")} />,
  },
  {
    accessorKey: "tamanhoFarda",
    header: () => <CustomHeader value="Farda" />,
    cell: ({ row }) => <CustomCell value={row.getValue("tamanhoFarda")} />,
  },
  {
    accessorKey: "peso",
    header: () => <CustomHeader value="Peso" />,
    cell: ({ row }) => <CustomCell value={row.getValue("peso")} />,
  },
  {
    accessorKey: "altura",
    header: () => <CustomHeader value="Altura" />,
    cell: ({ row }) => <CustomCell value={row.getValue("altura")} />,
  },
  {
    accessorKey: "imc",
    header: () => <CustomHeader value="IMC" />,
    cell: ({ row }) => <CustomCell value={row.getValue("imc")} />,
  },
  {
    accessorKey: "classificacaoIMC",
    header: () => <CustomHeader value="Classificação IMC" />,
    cell: ({ row }) => {
      return (
        <CustomCell value={classifyIMC(row.original.imc ?? 0).classification} />
      );
    },
  },
  {
    accessorKey: "biotipo",
    header: () => <CustomHeader value="Biotipo" />,
    cell: ({ row }) => {
      return <CustomCell value={row.original.biotipo ?? "-"} />;
    },
  },
  {
    accessorKey: "rua",
    header: () => <CustomHeader value="Rua" />,
    cell: ({ row }) => <CustomCell value={row.getValue("rua")} />,
  },
  {
    accessorKey: "ruaNumero",
    header: () => <CustomHeader value="Número da Rua" />,
    cell: ({ row }) => <CustomCell value={row.getValue("ruaNumero")} />,
  },
  {
    accessorKey: "ruaComplemento",
    header: () => <CustomHeader value="Complemento da Rua" />,
    cell: ({ row }) => <CustomCell value={row.getValue("ruaComplemento")} />,
  },
  {
    accessorKey: "bairro",
    header: () => <CustomHeader className="text-center" value="Bairro" />,
    cell: ({ row }) => (
      <CustomCell className="text-center" value={row.getValue("bairro")} />
    ),
  },
  {
    accessorKey: "cidade",
    header: () => (
      <CustomHeader className="text-center" value="Cidade/Estado" />
    ),
    cell: ({ row }) => {
      const city = row.original.cidade ?? "";
      const state = row.original.estado ?? "";
      return <CustomCell className="text-center" value={`${city}/${state}`} />;
    },
  },
  // {
  //   accessorKey: "estado",
  //   header: () => <CustomHeader value="Estado" />,
  //   cell: ({ row }) => {
  //     return <CustomCell value={row.getValue("estado")} />;
  //   },
  // },
  {
    accessorKey: "cep",
    header: () => <CustomHeader value="CEP" />,
    cell: ({ row }) => <CustomCell value={row.getValue("cep")} />,
  },
  {
    accessorKey: "comoConheceuLegendarios",
    header: () => <CustomHeader value="Como Conheceu os Legendários" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("comoConheceuLegendarios")} />
    ),
  },
  {
    accessorKey: "quemConvidou",
    header: () => <CustomHeader value="Quem Convidou" />,
    cell: ({ row }) => <CustomCell value={row.getValue("quemConvidou")} />,
  },
  {
    accessorKey: "nomeContatoCartas",
    header: () => <CustomHeader value="Nome Contato p/ Cartas" />,
    cell: ({ row }) => (
      <CustomCell
        className={`${!row.original.nomeContatoCartas && "text-center"}`}
        value={row.getValue("nomeContatoCartas") ?? "-"}
      />
    ),
  },
  {
    accessorKey: "celularContatoCartas",
    header: () => <CustomHeader value="Celular Contato p/ Cartas" />,
    cell: ({ row }) => {
      if (!row.original.celularContatoCartas)
        return <p className="text-center">-</p>;
      return (
        <InternationalPhoneWppButton
          className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
          phone={row.original.celularContatoCartas ?? ""}
        />
      );
    },
  },
  {
    accessorKey: "nomeContatoEmergencia",
    header: () => <CustomHeader value="Nome Contato de Emergência" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("nomeContatoEmergencia")} />
    ),
  },
  {
    accessorKey: "celularContatoEmergencia",
    header: () => <CustomHeader value="Celular Contato de Emergência" />,
    cell: ({ row }) => (
      <InternationalPhoneWppButton
        className="group w-full self-center bg-muted/30 text-foreground hover:bg-card/60"
        phone={row.original.celularContatoEmergencia ?? ""}
      />
    ),
  },
  {
    accessorKey: "tipoVinculoContatoEmergencia",
    header: () => <CustomHeader value="Vínculo Contato de Emergência" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("tipoVinculoContatoEmergencia")} />
    ),
  },
  {
    accessorKey: "possuiPlanoSaude",
    header: () => <CustomHeader value="Possui Plano de Saúde" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("possuiPlanoSaude"))} />
    ),
  },
  {
    accessorKey: "nomePlanoSaude",
    header: () => <CustomHeader value="Nome do Plano de Saúde" />,
    cell: ({ row }) => <CustomCell value={row.getValue("nomePlanoSaude")} />,
  },
  {
    accessorKey: "possuiAlergia",
    header: () => <CustomHeader value="Possui Alergia" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("possuiAlergia"))} />
    ),
  },
  {
    accessorKey: "possuiDiabetes",
    header: () => <CustomHeader value="Possui Diabetes" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("possuiDiabetes"))} />
    ),
  },
  {
    accessorKey: "possuiConvulsoes",
    header: () => <CustomHeader value="Possui Convulsões" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("possuiConvulsoes"))} />
    ),
  },
  {
    accessorKey: "possuiDesmaios",
    header: () => <CustomHeader value="Possui Desmaios" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("possuiDesmaios"))} />
    ),
  },
  {
    accessorKey: "possuiProblemasCardiacos",
    header: () => <CustomHeader value="Possui Problemas Cardíacos" />,
    cell: ({ row }) => (
      <CustomCell
        value={formatBoolean(row.getValue("possuiProblemasCardiacos"))}
      />
    ),
  },
  {
    accessorKey: "possuiDisturbiosAlimentares",
    header: () => <CustomHeader value="Possui Distúrbios Alimentares" />,
    cell: ({ row }) => (
      <CustomCell
        value={formatBoolean(row.getValue("possuiDisturbiosAlimentares"))}
      />
    ),
  },
  {
    accessorKey: "possuiProblemasRespiratorios",
    header: () => <CustomHeader value="Possui Problemas Respiratórios" />,
    cell: ({ row }) => (
      <CustomCell
        value={formatBoolean(row.getValue("possuiProblemasRespiratorios"))}
      />
    ),
  },
  {
    accessorKey: "cuidadosPsiquiatricos",
    header: () => <CustomHeader value="Cuidados Psiquiátricos" />,
    cell: ({ row }) => (
      <CustomCell
        value={formatBoolean(row.getValue("cuidadosPsiquiatricos"))}
      />
    ),
  },
  {
    accessorKey: "medicacaoDepressao",
    header: () => <CustomHeader value="Medicação para Depressão" />,
    cell: ({ row }) => (
      <CustomCell value={formatBoolean(row.getValue("medicacaoDepressao"))} />
    ),
  },
  {
    accessorKey: "possuiProblemasMusculoesqueleticos",
    header: () => <CustomHeader value="Possui Problemas Musculoesqueléticos" />,
    cell: ({ row }) => (
      <CustomCell
        value={formatBoolean(
          row.getValue("possuiProblemasMusculoesqueleticos"),
        )}
      />
    ),
  },
  {
    accessorKey: "doencaOuCondicao",
    header: () => <CustomHeader value="Doença ou Condição" />,
    cell: ({ row }) => <CustomCell value={row.getValue("doencaOuCondicao")} />,
  },
  {
    accessorKey: "medicacoes",
    header: () => <CustomHeader value="Medicações" />,
    cell: ({ row }) => <CustomCell value={row.getValue("medicacoes")} />,
  },
  {
    accessorKey: "motivosDietaEspecial",
    header: () => <CustomHeader value="Motivos Dieta Especial" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("motivosDietaEspecial")} />
    ),
  },
  {
    accessorKey: "outrasInformacoesMedicas",
    header: () => <CustomHeader value="Outras Informações Médicas" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("outrasInformacoesMedicas")} />
    ),
  },
  {
    accessorKey: "check_obs",
    header: () => <CustomHeader value="Observação de Check-in" />,
    cell: ({ row }) => (
      <CustomCell
        className="min-w-56 text-wrap"
        value={row.getValue("check_obs")}
      />
    ),
  },
  {
    accessorKey: "saude_obs",
    header: () => <CustomHeader value="Observação de Saúde" />,
    cell: ({ row }) => {
      const { saude_obs } = row.original;
      const value = saude_obs ?? "-";

      return (
        <CustomCell
          className={`min-w-56 text-wrap ${value === "-" ? "text-center" : "text-start"}`}
          value={value}
        />
      );
    },
  },
  {
    accessorKey: "pagamento_status",
    header: () => <CustomHeader value="Status Pagamento" />,
    cell: ({ row }) => {
      const value: ENUM_PAYMENT_STATUS = row.getValue("pagamento_status");
      const paymentStatus = paymentStatusOptions.find(
        (item) => item.value === value,
      )?.label;
      return (
        <div className="flex w-full justify-center">
          <Badge
            variant="secondary"
            className={`w-max self-center text-xs ${addColorByPaymentStatus(value, "bg")}`}
          >
            {paymentStatus}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "pagamento_data",
    header: () => <CustomHeader value="Data Pagamento" />,
    cell: ({ row }) => (
      <CustomCell value={formatDateDMY(row.getValue("pagamento_data"))} />
    ),
  },
  {
    id: "pagamento_couponValue",
    accessorKey: "pagamento_couponValue",
    header: () => <CustomHeader value="Cupom de Desconto" />,
    cell: ({ row }) => {
      const value: string = row.getValue("pagamento_couponValue");
      return <CustomCell value={value === "none" ? "-" : value} />;
    },
    filterFn: filterFn,
  },
  {
    accessorKey: "obs",
    header: () => <CustomHeader value="Observação" />,
    cell: ({ row }) => (
      <CustomCell className="min-w-56 text-wrap" value={row.getValue("obs")} />
    ),
  },
  {
    id: "linkSecreto",
    accessorKey: "linkSecreto",
    header: () => <CustomHeader value="Link secreto" />,
    cell: ({ row }) => (
      <CustomCell value={row.getValue("linkSecreto") ?? "-"} />
    ),
    filterFn: filterFn,
  },
];
