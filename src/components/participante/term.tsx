"use client";

import { useEffect, useState } from "react";
import { useFormStore } from "./useFormStore";
import { formatDateToDDMMYYYY } from "@/lib/utils/formatDateToDDMMYYYY";
import { eventTypeMap } from "@/lib/constants";
import type { ENUM_EVENT_TYPE } from "@/lib/enum";

type TermAndConditionalProps = {
  term?: { title: string; content: string[] }[];
};

export const Termos = (): TermAndConditionalProps["term"] => {
  const { eventRegister } = useFormStore();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    if (eventRegister) {
      setDataInicio(formatDateToDDMMYYYY(eventRegister.dataInicio));
      setDataFim(formatDateToDDMMYYYY(eventRegister.dataFim));
    }
  }, [eventRegister]);

  return [
    {
      title: `I – TERMO DE DECLARAÇÃO`,
      content: [
        `Através do presente TERMO, o PARTICIPANTE declara e atesta, EXPRESSAMENTE, que sua participação no evento denominado ${eventTypeMap[eventRegister?.type as ENUM_EVENT_TYPE]} (Track Outdoor Potencial – LEGENDÁRIOS) se dá de livre e espontânea vontade, estando ciente dos riscos inerentes às atividades. O PARTICIPANTE declara ter sido informado detalhadamente sobre os riscos e responsabilidades, e que assume esses riscos de forma consciente. As atividades a serem desenvolvidas no evento possuem natureza educativa e envolvem trilhas, caminhadas, incursões em rios ou cavernas, alpinismo com uso de equipamentos de mobilização suspensos no ar (sempre com comando de um Supervisor Legendário), dentre outras, e podem se tornar exaustivas.`,
        `O PARTICIPANTE declara ainda que foi totalmente informado (inclusive através do material de divulgação informativa recebido quando de sua inscrição) sobre os riscos inerentes às atividades que serão desenvolvidas no evento denominado ${eventTypeMap[eventRegister?.type as ENUM_EVENT_TYPE]} #${eventRegister?.topNumero} ${eventRegister?.pista}, a ser realizado na região entre os municípios de Bonito-MS, Aquidauana em Bodoquena-MS, a partir das 12:00 do dia ${dataInicio} (check-in), com saída em Dourados, Centro de Convenções Antônio Tonani. Av. Guaicurus, 2030 - Novo Parque Alvorada, Dourados - MS, 79823-490, e retorno por volta das 14:30 do dia ${dataFim} no Centro de Convenções Antônio Tonani. Av. Guaicurus, 2030 - Novo Parque Alvorada, Dourados - MS, 79823-490. Declarando por fim estar APTO para as atividades físicas inerentes ao mencionado evento, NÃO TENDO QUALQUER RESTRIÇÃO MÉDICA REFERENTE AOS EXERCÍCIOS FÍSICOS QUE IRÁ DESENVOLVER, observados o ITEM IV.`,
      ],
    },
    {
      title: `II – CONCORDÂNCIA EXPRESSA COM OS RISCOS DAS ATIVIDADES A SEREM REALIZADAS`,
      content: [
        `O PARTICIPANTE declara ter ciência dos riscos específicos listados abaixo e que aceita participar das atividades com plena compreensão desses riscos. A organização compromete-se a adotar todas as medidas de segurança razoáveis para mitigar esses riscos. Esses riscos incluem, mas não se limitam a:`,
        `Riscos relacionados a elementos climáticos (tais como: calor, chuva e frio).`,
        `Riscos de impacto corporal contra pedras e objetos da natureza.`,
        `Riscos de contato com animais (o que pode implicar em coices, mordidas, picadas, ferroadas e/ou movimentos imprevistos que podem causar danos corporais ou emocionais).`,
        `Riscos oriundos de negligências próprias ou de terceiros, decisões dos organizadores, cálculo incorreto do terreno, clima, rotas, ataque de insetos, répteis ou outros animais, e acidentes ou doenças em lugares remotos sem instalações médicas imediatas.`,
        `Fadiga, calafrios ou tonturas que podem afetar o tempo de reação e aumentar o risco de um acidente.`,
        `Outros riscos, conhecidos ou desconhecidos, previsíveis ou imprevisíveis, eventos fortuitos ou força maior.`,
        `O PARTICIPANTE concorda em seguir todas as instruções de segurança fornecidas pela equipe organizadora.`,
      ],
    },
    {
      title: `III – ISENÇÃO DE RESPONSABILIDADE CIVIL E RENÚNCIA DE QUALQUER REIVINDICAÇÃO`,
      content: [
        `Em troca de ser autorizado a participar do evento ${eventRegister?.topNumero} #${eventRegister?.pista}, o PARTICIPANTE CONCORDA que a organização adotará todas as medidas de segurança necessárias, mas pode haver situações onde riscos inerentes não podem ser totalmente eliminados. A responsabilidade por negligência direta da organização não será exonerada. O PARTICIPANTE renuncia a reivindicações apenas em casos onde os riscos foram plenamente informados e aceitos previamente.`,
        `O PARTICIPANTE exonera os organizadores do evento de qualquer responsabilidade caso o mesmo venha a ser adiado ou cancelado em razão de condições climáticas, caso fortuito ou força maior.`,
        `Este instrumento será vinculativo aos cônjuges, familiares, representantes, herdeiros e beneficiários do PARTICIPANTE, sendo por ele declarado que todos estão CIENTES não somente de sua participação no evento ${eventRegister?.topNumero} ${eventRegister?.pista}, mas também do teor das declarações aqui realizadas.`,
        `Se qualquer disposição deste documento for considerada e declarada judicialmente inválida ou inexequível, não afetará as disposições restantes.`,
        `As partes elegem o Fórum da Comarca de Dourados/MS como competente para dirimir qualquer controvérsia oriunda deste instrumento, sem prejuízo de outras jurisdições aplicáveis que possam ser mais convenientes ao PARTICIPANTE.`,
      ],
    },
    {
      title: `IV – ISENÇÃO DE RESPONSABILIDADE MÉDICA`,
      content: [
        `Para a participação no evento de Legendários, recomenda-se aplicar a vacina contra o tétano e febre amarela atualizados, assim como o restante das imunizações.`,
        `O PARTICIPANTE declara que é responsável por informar à organização sobre quaisquer condições médicas pré-existentes. A organização providenciará um seguro básico de emergência durante o evento, mas o PARTICIPANTE também é incentivado a ter seguro pessoal que cubra atividades físicas em áreas remotas.`,
      ],
    },
    {
      title: `V – PROPRIEDADE INTELECTUAL E DIREITO DE IMAGEM`,
      content: [
        `Através do presente TERMO, o PARTICIPANTE autoriza que os organizadores do evento ${eventRegister?.topNumero} #${eventRegister?.pista} gravem e registrem sua participação no decorrer da atividade, seja em vídeo, áudio e/ou fotografia, inclusive como ANUENTES no uso/sobrevoo de Aeronaves Remotamente Pilotadas (RPA – Drone), podendo usar seu nome, voz ou testemunho, sem restrições, inclusive para futuros eventos promocionais e divulgação de outros eventos ${eventRegister?.topNumero} ${eventRegister?.pista}. O PARTICIPANTE pode solicitar a exclusão de qualquer material que não deseje ser utilizado publicamente.`,
        `Tal autorização se dá de forma gratuita, sendo desde já declarado pelo PARTICIPANTE que os materiais de áudio e vídeo obtidos durante as atividades pertencem exclusivamente aos organizadores do evento ${eventTypeMap[eventRegister?.type as ENUM_EVENT_TYPE]} ${eventRegister?.topNumero} #${eventRegister?.pista}, não podendo o PARTICIPANTE deles dispor pessoalmente ou através de terceiros. A gravação de áudio, vídeo ou registro fotográfico pelo PARTICIPANTE durante o evento é restrita e deve ser previamente autorizada pela organização, justificada para a segurança e integridade do evento.`,
        `O PARTICIPANTE se compromete expressamente a não realizar ou organizar um evento com as características ou elementos que conheça depois de participar do evento ${eventTypeMap[eventRegister?.type as ENUM_EVENT_TYPE]} ${eventRegister?.topNumero} #${eventRegister?.pista}, sem antes ter a autorização prévia por escrito de seus organizadores. Isso inclui, mas não se limita aos ensinamentos apresentados, o formato das atividades e as características distintivas que caracterizam o evento ${eventRegister?.topNumero} #${eventRegister?.pista}.`,
      ],
    },
    {
      title: `VI – POLÍTICA DE CANCELAMENTO E REEMBOLSO`,
      content: [
        `Em conformidade com o Código de Defesa do Consumidor, o PARTICIPANTE terá direito ao reembolso integral do valor da inscrição caso desista do evento no prazo de até 7 (sete) dias úteis contados a partir da data de inscrição.`,
        `Após o período de 7 (sete) dias úteis, em caso de desistência, será aplicada uma multa correspondente a 60% (sessenta por cento) do valor pago pela inscrição. O saldo remanescente será devolvido ao PARTICIPANTE no prazo máximo de 30 (trinta) dias úteis, contados a partir da solicitação de cancelamento.`,
        `A solicitação de cancelamento deve ser formalizada por escrito e enviada para o endereço de e-mail da organização, com a data e motivo da desistência devidamente especificados.`,
      ],
    },
    {
      title: `VII – RATIFICAÇÃO DE DECLARAÇÕES E ACEITE DAS CONDIÇÕES`,
      content: [
        `O PARTICIPANTE declara ter lido a íntegra do presente documento, composto por cinco folhas, sendo sabedor de que o mesmo representa um ACORDO DE PARTICIPAÇÃO, através do qual é ofertada isenção de responsabilidades nos exatos termos acima descritos, bem como são renunciados alguns direitos, sendo por ele RATIFICADAS as declarações firmadas no presente documento que é assinado de livre e espontânea vontade, SEM QUALQUER RESERVA.`,
      ],
    },
    {
      title: `VIII - LEI GERAL DE PROTEÇÃO DE DADOS`,
      content: [
        `A liderança da organização VALE DA ONCA ASSESSORIA E EVENTOS LTDA faz parte da Igreja Comunidade Tempo de Vida (CTV). A organização se compromete a proteger os dados pessoais dos participantes em conformidade com a Lei Geral de Proteção de Dados (LGPD). Os dados serão utilizados exclusivamente para finalidades relacionadas ao evento e conforme descrito em nossa política de privacidade`,
      ],
    },
  ];
};
