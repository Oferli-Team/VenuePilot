import * as React from "react";
import { maskCPF } from "@/lib/utils/maskCPF";
import type { Inscricao, Evento } from "@prisma/client";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Column,
  Row,
  Link,
  Img,
  Button,
} from "@react-email/components";
import { ITOP } from "@/lib/constants";
import { FaWhatsapp } from "react-icons/fa6";
import { ENUM_EVENT_TYPE } from "@/lib/enum";

export type SubscriptionConfirmationEmailTemplateProps = Readonly<{
  register: Pick<Inscricao, "nome" | "cpf" | "tipoInscricao" | "status"> & {
    otherName?: string;
    otherCPF?: string;
    participants?: { name: string; cpf?: string }[];
    identifier?: string;
  };
  event: Pick<
    Evento,
    | "id"
    | "titulo"
    | "banner"
    | "periodo"
    | "pista"
    | "linkWhatsappGrupoParticipante"
    | "linkWhatsappGrupoServir"
    | "slug"
    | "type"
    | "local"
  >;
}>;
export default function SubscriptionConfirmationEmailTemplate({
  register,
  event,
}: SubscriptionConfirmationEmailTemplateProps) {
  const currentYear = new Date().getFullYear();
  const copyrightDate = currentYear > 2024 ? `${currentYear}` : "";

  const previewText = "Confirmação de Inscrição | Inscrições TOP";

  const footerTextContent = `
  Bem-vindo ao suporte oficial do sistema Inscrições TOP! 
  
  Aqui você encontra ajuda para realizar suas inscrições de forma rápida e fácil. 
  Participe e sirva com excelência através de nossa plataforma. Estamos prontos para ajudar você!
      
  ${copyrightDate} ${ITOP.name}.

  AHU! 🐆🧡⛰️
  `;

  const eventType = event.type as ENUM_EVENT_TYPE;
  const linkGroupWhatsApp =
    register.tipoInscricao === "SERVIR"
      ? event.linkWhatsappGrupoServir
      : event.linkWhatsappGrupoParticipante;

  const linkList = `${ITOP.site}/evento/${event.slug}`;
  const linkTicket =
    eventType === ENUM_EVENT_TYPE.MANADADAY
      ? `${ITOP.site}/manadaday/ticket/${register.identifier}`
      : `${ITOP.site}/ticket/${event.id}/${register.cpf}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Section
          style={{
            height: "8px",
            background: "rgb(230,94,10)",
            marginBottom: "48px",
          }}
        />
        <Container style={container}>
          <Text style={{ ...title, fontSize: "16px" }}>
            Inscrição Confirmada ✅
          </Text>
          <Text style={{ ...title, marginBottom: "24px" }}>🎟️ Ticket</Text>

          <Row> </Row>

          {/* QR Code */}
          <Row>
            <Column style={{ alignContent: "start", marginRight: "16px" }}>
              <Text style={ticketId}>
                {event.type} | {event.titulo}
              </Text>
              <Text style={org}>{event.pista}</Text>
              <Text style={label}>{event.periodo}</Text>
              <Text style={label}>{event.local}</Text>
            </Column>
            <Column style={{ paddingLeft: "16px" }}>
              <Img
                src={event.banner}
                alt="Imagem do Evento"
                width={120}
                height={120}
                style={{
                  borderRadius: "8px",
                  border: "2px solid #555",
                  boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
                }}
              />
            </Column>
          </Row>

          {/* Conteúdo ao lado */}
          <Row>
            <Column style={{ paddingLeft: "0px" }}>
              <Row>
                {eventType === ENUM_EVENT_TYPE.LEGENDARIOS && (
                  <Column>
                    <Text style={label}>Inscrito</Text>
                    <Text>
                      {register.nome}
                      <br />
                      {maskCPF(register.cpf!)}
                    </Text>
                  </Column>
                )}

                {[
                  ENUM_EVENT_TYPE.REM,
                  ENUM_EVENT_TYPE.LEGADO_FILHA,
                  ENUM_EVENT_TYPE.LEGADO_FILHO,
                ].includes(eventType) && (
                  <Column>
                    <Text style={label}>Inscritos</Text>
                    <Text>
                      {register.nome}
                      <br />
                      {maskCPF(register.cpf!)}
                    </Text>
                    <Text>
                      {register.otherName}
                      <br />
                      {maskCPF(register.otherCPF!)}
                    </Text>
                  </Column>
                )}

                {eventType === ENUM_EVENT_TYPE.MANADADAY && (
                  <Column>
                    <Text style={label}>
                      {register.participants &&
                      register.participants?.length > 1
                        ? "Inscritos"
                        : "Inscrito"}
                    </Text>

                    {register.participants?.map((part) => (
                      <Text key={part.name.replaceAll(" ", "-")}>
                        {part.name}
                        <br />
                        {part.cpf && maskCPF(part.cpf)}
                      </Text>
                    ))}
                  </Column>
                )}

                <Hr style={hr} />

                <Column>
                  {register.tipoInscricao !== "" && (
                    <>
                      <Text style={label}>Inscrição</Text>
                      <Text>{register.tipoInscricao}</Text>
                    </>
                  )}

                  <Text style={label}>Status</Text>
                  <Text style={{ color: "green" }}>{register.status}</Text>
                </Column>
              </Row>

              <Row>
                {eventType !== ENUM_EVENT_TYPE.MANADADAY && (
                  <Button
                    href={linkGroupWhatsApp}
                    style={{
                      ...whatsappButton,
                      marginRight: "8px",
                      marginTop: "16px",
                    }}
                  >
                    <FaWhatsapp size={16} style={{ marginRight: "4px" }} />
                    Entrar no Grupo
                  </Button>
                )}

                {eventType !== ENUM_EVENT_TYPE.MANADADAY && (
                  <Button
                    href={linkList}
                    style={{ ...listButton, marginTop: "8px" }}
                  >
                    Ver lista do que levar
                  </Button>
                )}
                <Button
                  href={linkTicket}
                  style={{ ...TicketButton, marginTop: "8px" }}
                >
                  QRCode Ingresso
                </Button>
              </Row>

              <Hr style={hr} />
              <Text style={{ ...org, marginTop: "16px" }}>
                Leve Ingresso (QrCode) no dia do Check-in
              </Text>
            </Column>
          </Row>
        </Container>

        <Container style={{ padding: "8px 0" }}>
          <Row style={{ width: "100%" }}>
            <Column style={{ textAlign: "left" }}>
              <Img
                src={`${ITOP.site}/itop-og-logo.png`}
                alt="ITOP Logo"
                width={60}
                height={60}
                style={{ borderRadius: "12px", objectFit: "cover" }}
              />
              <Text style={footerText}>
                Inscrições Top - Sistema de Gerenciamento de Inscrição
              </Text>
            </Column>

            <Column
              style={{
                display: "flex",
                textAlign: "right",
                verticalAlign: "middle",
              }}
            >
              <Link
                href={ITOP.whatsapp_suporte}
                style={{ ...mediaButton, marginLeft: "4px" }}
              >
                WhatsApp
              </Link>
              <Link
                href={ITOP.site}
                style={{ ...mediaButton, marginLeft: "4px" }}
              >
                Site
              </Link>
            </Column>
          </Row>
          <Hr />
          <Text style={footerText}>{footerTextContent}</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  padding: "20px",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  borderRadius: "8px",
  padding: "20px",
  height: "auto",
  margin: "0 auto",
  fontFamily: "Poppins, sans-serif",
  boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
  backgroundColor: "#1C1C1C10",
  backgroundImage:
    "radial-gradient(circle at bottom right,rgb(230,94,10,0.6) 0%,transparent 60%)",
};

const button = {
  padding: "10px 20px",
  color: "#fff",
  borderRadius: "6px",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  fontWeight: "bold",
};

const mediaButton = {
  padding: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  color: "#1C1C1C",
  boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px",
  backgroundColor: "#1C1C1C10",
};

const whatsappButton = {
  ...button,
  backgroundColor: "#25D366",
};

const listButton = {
  ...button,
  backgroundColor: "#E65E0A",
};

const TicketButton = {
  ...button,
  backgroundColor: "#007bff",
};

const footerText = {
  fontSize: "12px",
  fontFamily: "Poppins, sans-serif",
  color: "#000",
};

const hr = {
  borderTop: "2px solid rgb(230,94,10,0.3)",
  margin: "24px 0px",
};

const org = {
  fontSize: "14px",
  color: "#555",
  margin: 0,
};

const title = {
  fontSize: "20px",
  fontWeight: "bold",
};

const ticketId = {
  fontSize: "16px",
  fontWeight: "semibold",
  margin: 0,
};

const label = {
  fontSize: "12px",
  fontWeight: "semibold",
  color: "#000",
  margin: 0,
  marginBottom: "2px",
};
