import { create } from "zustand";
import { type z } from "zod";
import { type Evento } from "@prisma/client";
import {
  type createDadosSaudeSchema,
  type createDadosPessoaisSchema,
  type createFardamentoETermoSchema,
  type createServirSchema,
  type spousePersonalInfoSchema,
} from "@/app/zod-validation/schemas";
import { getEventPostedByNumberTop } from "@/lib/queries/client";
import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type DadosPessoais = z.infer<typeof createDadosPessoaisSchema>;
type DadosSaude = z.infer<typeof createDadosSaudeSchema>;
type Fardamento = z.infer<typeof createFardamentoETermoSchema>;
type Legendarios = z.infer<typeof createServirSchema>;
type SpouseDataRem = z.infer<typeof spousePersonalInfoSchema>;

type FormData = DadosPessoais &
  DadosSaude &
  Fardamento &
  Legendarios &
  SpouseDataRem & {
    id?: string;
    imc: number;
    lgnd_certificado: string;
    //REM
    hasHealthIssues: boolean;
    healthIssuesDescription: string;
    isPregnant: boolean;
    womanTshirtSize: string;
    manTshirtSize: string;
    buyTShirts: boolean | undefined;
    nrRem: string | undefined;
  };

interface FormStore {
  eventRegister: Evento | null;
  setEventRegister: (
    topNumber: string,
    router: AppRouterInstance,
  ) => Promise<void>;
  formData: FormData;
  setFormData: (data: Partial<FormData>) => void;
  resetFormStore: () => void;
  secretLink: { id: string; link: string } | undefined;
  setSecretLink: (secretLink: { id: string; link: string }) => void;
}

export const initialFormData: FormData = {
  id: "",
  cpf: "",
  nome: "",
  email: "",
  data_nascimento: "",
  celular: "",
  estado_civil: "",
  nome_contato_cartas: "",
  celular_contato_cartas: "",
  peso: "",
  altura: "",
  igreja: "",
  igreja_pastor: "",
  tem_filhos: "",
  qtd_filhos: "",
  quem_convidou: "",
  como_conheceu_legendarios: "",
  pais: "",
  cep: "",
  rua: "",
  rua_numero: "",
  bairro: "",
  rua_complemento: "",
  cidade: "",
  estado: "",
  nome_contato_emergencia: "",
  celular_contato_emergencia: "",
  tipo_vinculo_contato_emergencia: "",
  biotipo: "",
  possui_plano_saude: "",
  nome_plano_saude: "",
  possui_alergia: "",
  possui_diabetes: "",
  possui_convulsoes: "",
  possui_desmaios: "",
  possui_problemas_cardiacos: "",
  possui_disturbios_alimentares: "",
  possui_problemas_respiratorios: "",
  cuidados_psiquiatricos: "",
  medicacao_depressao: "",
  possui_problemas_musculoesqueleticos: "",
  doenca_ou_condicao: "",
  medicacoes: "",
  outras_informacoes_medicas: "",
  motivos_dieta_especial: "",
  nrLgnd: "",
  lgnd_certificado: "",
  orientador_espiritual: "",
  possui_autorizacao_servir: "",
  aceitaTermos: false,
  tamanho_farda: "",
  spousePhoneNumber: "",
  spouseCPF: "",
  spouseName: "",
  spouseEmail: "",
  spouseBirthDate: "",
  buyTShirts: undefined,
};

export const useFormStore = create<FormStore>((set) => ({
  eventRegister: null,
  setEventRegister: async (topNumber: string, router) => {
    try {
      const evento = await getEventPostedByNumberTop(topNumber);

      if (evento) {
        set({ eventRegister: evento });
      } else {
        // Redireciona para 404 se o evento não for encontrado
        router.push("/404");
      }
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      router.push("/404");
    }
  },
  formData: initialFormData,
  setFormData: (data) => {
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    }));
  },
  resetFormStore: () => {
    set({ formData: initialFormData, eventRegister: null });
  },
  secretLink: undefined,
  setSecretLink: (secretLink: { id: string; link: string }) => {
    set({ secretLink });
  },
}));
