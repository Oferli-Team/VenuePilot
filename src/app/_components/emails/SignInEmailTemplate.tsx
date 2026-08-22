import { ITOP } from "@/lib/constants";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

type SignInEmailTemplateProps = {
  email: string;
  url: string;
};

export const SignInEmailTemplate = ({
  email,
  url,
}: SignInEmailTemplateProps) => {
  const currentYear = new Date().getFullYear();
  const copyrightDate = currentYear > 2023 ? `${currentYear}` : "";

  function maskEmail(email: string) {
    const [username, domain] = email.split("@");
    const visibleChars = 4; // Número de caracteres visíveis no início do nome de usuário
    const maskedLength = username!.length - visibleChars;
    const maskedUsername =
      username!.slice(0, visibleChars) + "*".repeat(maskedLength);
    return `${maskedUsername}@${domain}`;
  }

  const previewText = "Login sem Senha - Acesse sua Conta com Segurança 🔐";
  const footerTextContent = `
  Suporte ${ITOP.name} - Participar e Servir 🧡🐆⛰️

  Bem-vindo ao suporte oficial do sistema ${ITOP.name}! 
  
  Aqui você encontra ajuda para realizar suas inscrições de forma rápida e fácil. 
  Participe e sirva com excelência através de nossa plataforma. Estamos prontos para ajudar você!

    📞 Whatsapp: ${ITOP.whatsapp_suporte}
    📧 E-mail: ${ITOP.email_suporte}
    🌐 Site: ${ITOP.site}
      
  ${copyrightDate} ${ITOP.name}.

  AHU! 🐆🧡⛰️
  `;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={{ ...imageSection, textAlign: "center" }}>
              <Heading style={{ ...title, textAlign: "center" }}>
                ${ITOP.name}
              </Heading>
            </Section>
            <Section style={upperSection}>
              <Heading style={{ ...h1 }}>
                Login sem Senha - Acesse sua Conta com Segurança 🔐
              </Heading>
              <Section
                style={{
                  ...mainText,
                  textAlign: "center",
                  background: "#F6F6F6",
                }}
              >
                <Text>Recebemos uma solicitação de acesso para o email:</Text>
                <Text style={nameText}>{maskEmail(email)}</Text>
                <Text>
                  Para prosseguir com seu acesso, clique no botão abaixo:
                </Text>

                <Button href={url} style={buttonLink}>
                  Acessar conta
                </Button>

                <Text
                  style={{
                    ...text,
                    marginTop: "20px",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  ⚠️ Importante: Este link é de uso único e expirará em 24 horas.
                  Após usar ou quando expirar, será necessário solicitar um novo
                  link de acesso.
                </Text>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={{ ...h1, textAlign: "center" }}>
                Desfrute o Caminho 🧡 AHU! 🐆🧡⛰️
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            Esta mensagem foi produzida e distribuída por {ITOP.description}.
          </Text>
          <Text style={footerText}>{footerTextContent}</Text>
        </Container>
      </Body>
    </Html>
  );
};

const body = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const title = {
  color: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
};

const imageSection = {
  backgroundColor: "#F9802D",
  padding: "20px 0",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "35px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const buttonLink = {
  ...text,
  padding: "8px",
  color: "#FFF",
  background: "#F9802D",
  borderRadius: "8px",
  fontWeight: "bold",
};

const nameText = {
  ...text,
  fontWeight: "bold",
};

const mainText = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "18px",
  paddingBottom: "20px",
};
