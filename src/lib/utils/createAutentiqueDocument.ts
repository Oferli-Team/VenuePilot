import FormData from "form-data";
import axios from "axios";
import { env } from "@/env";

type Props = {
  blobUrl: string;
  user: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  };
  event: {
    topNumber: number;
    organization: string;
    initialDate: string;
  };
};

type CreateDocumentSuccess = {
  data: {
    createDocument: {
      id: string;
      name: string;
      created_at: string;
      signatures: {
        email: string;
        link: string | null;
      }[];
    };
  };
};

const API_TOKEN = env.AUTENTIQUE_API_TOKEN;
const API_URL = "https://api.autentique.com.br/v2/graphql";

const isProdEnvironment = () => {
  const isProdEnv = env.NODE_ENV === "production";
  return isProdEnv;
};

export async function createAutentiqueDocument({
  blobUrl,
  user,
  event,
}: Props): Promise<{
  status: "CREATED" | "NOT_CREATED";
  message: unknown;
  documentId: string | null;
}> {
  const action = "SIGN";
  const notify_at = event.initialDate;
  const docName = `${user.name.replaceAll(" ", "_")}_top_${event.topNumber}_${event.organization.replaceAll(" ", "_")}_termo`;
  const docMessage = `Olá, ${user.name}. Assine o termo de responsabilidade para o TOP#${event.topNumber} - ${event.organization}`;

  const operations = JSON.stringify({
    query: `
      mutation CreateDocumentMutation(
        $document: DocumentInput!,
        $signers: [SignerInput!]!,
        $file: Upload!
      ) {
        createDocument(
      ${isProdEnvironment() ? "" : "sandbox: true,"}
        document: $document,
        signers: $signers, 
        file: $file
        ) {
          id
          name
          created_at
          signatures {
            email
            link {
              short_link
            }
          }
        }
      }
    `,
    variables: {
      document: {
        name: docName.toUpperCase(),
        message: docMessage,
        footer: "BOTTOM",
        scrolling_required: true,
        stop_on_rejected: true,
        expiration: {
          days_before: 7, // Envia um lembrete em uma quantidade de dias "days_before antes do
          notify_at, // vencimento do documento informada no "notify_at"
        },
      },
      signers: [
        {
          phone: `+${user.phone}`,
          delivery_method: "DELIVERY_METHOD_WHATSAPP",
          action,
          security_verifications: [
            { type: "MANUAL" }, // Exigir documento com foto (Documento com foto)
          ],
        },
        {
          name: user.name,
          action,
        },
      ],
      file: null,
    },
  });

  try {
    const blobResponse = await axios.get(blobUrl, {
      responseType: "arraybuffer",
    });
    const pdfBuffer = Buffer.from(blobResponse.data);

    const map = JSON.stringify({
      file: ["variables.file"],
    });

    const form = new FormData();
    form.append("operations", operations);
    form.append("map", map);
    form.append("file", pdfBuffer, "document.pdf");

    const response = await axios.post(API_URL, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const { data } = (await response.data) as CreateDocumentSuccess;

    if (data.createDocument) {
      return {
        status: "CREATED",
        message: "Document created",
        documentId: data.createDocument.id,
      };
    }
    return {
      status: "NOT_CREATED",
      message: `Error to create the document`,
      documentId: null,
    };
  } catch (error) {
    console.log("Autentique Error: ", error);
    return {
      status: "NOT_CREATED",
      message: error,
      documentId: null,
    };
  }
}
