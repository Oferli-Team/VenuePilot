import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Header,
  AlignmentType,
  ImageRun,
} from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { mask } from "remask";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// const users = [
//   {
//     name: "João da Silva",
//     cpf: "12345678901",
//     maritalStatus: "Solteiro",
//     address: "Rua das Flores, 123",
//     birthDate: "1990-01-01",
//     phone: "11999999999",
//     email: "joao.silva@example.com",
//     emergencyContact: "Maria Oliveira, 11999999999",
//   },
// ];

async function getConfirmedUsers() {
  const registers = await prisma.inscricao.findMany({
    where: {
      status: "CONFIRMADA",
      tipoInscricao: "PARTICIPANTE",
      eventoId: "67aa4abda891b551534709c9",
    },
    select: {
      nome: true,
      cpf: true,
      estadoCivil: true,
      rua: true,
      ruaNumero: true,
      bairro: true,
      cidade: true,
      estado: true,
      cep: true,
      dataNascimento: true,
      celular: true,
      email: true,
      celularContatoEmergencia: true,
      nomeContatoEmergencia: true,
      evento: {
        select: {
          topNumero: true,
        },
      },
    },
  });

  console.log(registers[0]);

  const formattedUsers = registers.map((register) => {
    return {
      name: register.nome,
      cpf: register.cpf && mask(register.cpf, "999.999.999-99"),
      maritalStatus: register.estadoCivil,
      address: `${register.rua}, ${register.ruaNumero}. ${register.bairro}. ${register.cidade}/${register.estado} - ${register.cep}`,
      birthDate: register.dataNascimento
        ? format(register.dataNascimento, "dd/MM/yyyy")
        : "",
      phone: register.celular && mask(register.celular, "+99(99) 99999-9999"),
      email: register.email,
      emergencyContact: `${register.nomeContatoEmergencia}, ${register.celularContatoEmergencia && mask(register.celularContatoEmergencia, "+99(99) 99999-9999")}`,
      topNumber: String(register.evento.topNumero),
    };
  });

  return formattedUsers;
}

function createImageBackground() {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: fs.readFileSync("./public/logo-lgnd.png"),
            type: "png",
            transformation: {
              width: 600,
              height: 600,
            },
            floating: {
              horizontalPosition: {
                offset: 1016000,
              },
              verticalPosition: {
                offset: 1016000,
              },
              behindDocument: true,
              zIndex: -1,
            },
          }),
        ],
      }),
    ],
  });
}

/**
 * @param {string} label
 * @param {string} value
 */
function createFieldParagraph(label, value) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        size: 24, // 12pt
      }),
      new TextRun({
        text: value || "Não informado",
        size: 24, // 12pt,
      }),
    ],
    spacing: { after: 200 }, // <-- Adiciona espaçamento para separar do próximo bloco
  });
}

/**
 * @param {string} title
 * @param {string[]} texts
 */
function createBoxedParagraph(title, texts) {
  const table = new Paragraph({
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 60 },
  });

  const paragraph = texts.map(
    (text) =>
      new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
  );

  return [table, ...paragraph];
}

/**
 * @param {string[]} texts
 */
function createTextsParagraph(texts) {
  return texts.map(
    (text) =>
      new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200 },
      }),
  );
}

/**
 * @param {{name: string | null, cpf: string | null, maritalStatus: string | null, address: string | null, birthDate: string | null, phone: string | null, email: string | null, emergencyContact: string | null, topNumber: string | null  }} user
 * @param {string} topNumber
 */
function createUserDocument(user, topNumber) {
  return new Document({
    sections: [
      {
        headers: {
          default: createImageBackground(),
        },
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "TERMO DE ISENÇÃO DE RESPONSABILIDADE, CONFIDENCIALIDADE E COMPROMISSO PARA PARTICIPAÇÃO EM EVENTO",
                bold: true,
                size: 24,
                color: "000000",
              }),
            ],
            alignment: AlignmentType.JUSTIFIED,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          }),

          // Fields
          createFieldParagraph("Nome Completo", user.name),
          createFieldParagraph("CPF", user.cpf),
          createFieldParagraph("Endereço Completo", user.address),
          createFieldParagraph("Estado Civil", user.maritalStatus),
          createFieldParagraph("Data de Nascimento", user.birthDate),
          createFieldParagraph("Telefone", user.phone),
          createFieldParagraph("E-mail", user.email),
          createFieldParagraph(
            "Contato de Emergência (nome e celular)",
            user.emergencyContact,
          ),

          ...createBoxedParagraph(
            "1. PARTICIPAÇÃO VOLUNTÁRIA: estou aqui por minha livre e espontânea vontade.",
            [
              `O acima qualificado 'PARTICIPANTE' declara para todos os fins que entende e confirma que o seu comparecimento e participação no evento Track Outdoor de Potencial (TOP), criado pela LEGENDARIOS INTERNACIONAL LLC, cuja execução foi devidamente licenciada à Sede VALE DAONÇA LTDA (aqui designadas, em conjunto, como 'LEGENDARIOS'), 'EVENTO' a ser realizado na pista VALE ONÇA TRACK ${topNumber}, na cidade de DOURADOS/MS, estado MS no Brasil, é baseado na sua vontade e desejo voluntário.`,
              "Todas as instruções dadas pelos coordenadores ou equipe do evento são e serão seguidas voluntariamente, afirma que não foi manipulado, induzido, obrigado ou fisicamente ameaçado a cumprir quaisquer instruções.",
            ],
          ),

          ...createBoxedParagraph(
            "2. CONCORDÂNCIA COM OS RISCOS: fui devidamente informado sobre todos os riscos e perigos da atividade e estou apto física e mentalmente.",
            [
              "O PARTICIPANTE, ao assinar o presente termo, declara ter sido plenamente informado sobre os riscos e perigos inerentes às atividades que serão realizadas no evento, incluindo, mas não se limitando a riscos físicos, ambientais e climáticos. O PARTICIPANTE confirma estar apto para as atividades físicas propostas, não possuindo qualquer restrição médica física ou psicológica que o impeça de participar.",
            ],
          ),

          ...createBoxedParagraph(
            "3. CIÊNCIA DA POSSIBILIDADE DE DANOS PERMANENTES: reconheço que existe risco de danos permanentes e ferimentos, bem como risco de morte e me declaro apto ao exercício das atividades.",
            [
              "O PARTICIPANTE reconhece e aceita que, mesmo com a supervisão de profissionais capacitados e o controle técnico das atividades, existem riscos inerentes à sua participação, tais como:  lesões corporais, incapacidade temporária ou permanente e, em casos extremos, risco de morte;   Riscos relacionados a condições climáticas adversas (calor extremo, chuva, frio extremo, hipotermia, entre outros); Riscos de impacto corporal contra objetos naturais ou acidentes geográficos; Riscos de contato com animais, que podem resultar em ferimentos, arranhões, transmissão de doenças, mordidas, picadas ou outros danos físicos ou emocionais.",
            ],
          ),

          ...createBoxedParagraph(
            "4. ACEITAÇÃO DE RESPONSABILIDADE: sou responsável pelos meus atos, e os riscos decorrentes de todas as atividades do evento são de minha exclusiva responsabilidade.",
            [
              "O PARTICIPANTE concorda que é de sua exclusiva responsabilidade os riscos decorrentes, mas NÃO exclusivamente de:",
              "a. Sua própria negligência ou a de terceiros;",
              "b. Decisões tomadas pelos organizadores ou membros legendários",
              "c. Erros de cálculo do terreno, condições climáticas ou rotas;",
              "d. Ataques de insetos, répteis, felinos, Insetos, anfíbios, aracnídeos, aves ou outros animais;",
              "e. Acidentes ou doenças em locais remotos onde a assistência médica imediata não esteja disponível;",
              "f. Fadiga, calafrios, tonturas ou outras condições que possam afetar seu tempo de reação e aumentar o risco de acidentes;",
              "g. Qualquer outro risco, conhecido ou desconhecido, previsível ou imprevisível, incluindo eventos fortuitos ou de força maior",
            ],
          ),

          ...createBoxedParagraph(
            "5. LIBERAÇÃO E ISENÇÃO: libero e isento todos os envolvidos na realização do evento de quaisquer responsabilidades sobre danos físicos, morais, materiais e emocionais que eu possa sofrer em decorrência do evento. Não irei reivindicar quaisquer tipos de indenização, reembolso, reparação ou compensação.",
            [
              "O PARTICIPANTE reconhece e aceita que a organização do EVENTO, incluindo seus responsáveis, equipe, voluntários e demais envolvidos na realização, não se responsabilizam por quaisquer danos de natureza pessoal, física, moral ou material que possam ocorrer durante sua participação. Essa isenção abrange todos os tipos de incidentes, incluindo casos extremos, como fatalidades, bem como acidentes ocorridos durante as atividades, deslocamentos entre locais do EVENTO ou qualquer outra situação decorrente da participação.",
              "Ao aderir ao EVENTO, o PARTICIPANTE declara estar ciente dos riscos envolvidos e assume total responsabilidade por sua participação, renunciando expressamente a qualquer direito de reivindicar reparação, compensação ou qualquer ação contra os organizadores e envolvidos. Além disso, reconhece que seus herdeiros e sucessores não poderão pleitear indenizações ou reembolsos, inclusive referentes a despesas médicas, hospitalares ou advocatícias, relacionadas a qualquer eventualidade ocorrida no decorrer do EVENTO ou em razão dele.",
            ],
          ),

          ...createBoxedParagraph(
            "6. PANDEMIAS E DOENÇAS TRANSMISSÍVEIS: declaro que estou ciente dos riscos de pandemias e doenças de qualquer tipo e renuncio a reivindicação de qualquer ação ou medida reparatória nesse sentido.",
            [
              "O PARTICIPANTE reconhece os riscos inerentes à participação no EVENTO em meio a pandemias, surtos epidêmicos ou qualquer outra doença transmissível, incluindo, mas não se limitando a, exposição a vírus, infecções bacterianas e fúngicas, complicações de saúde e possíveis consequências decorrentes.",
              "O PARTICIPANTE declara que sua participação no EVENTO ocorre por sua livre e espontânea vontade, assumindo total responsabilidade por sua saúde e bem-estar. Dessa forma, isenta expressamente a LEGENDARIOS, seus organizadores, patrocinadores, parceiros, funcionários e qualquer pessoa envolvida na realização do EVENTO de qualquer responsabilidade por possíveis infecções, sequelas ou impactos à sua saúde decorrentes de sua participação, renunciando a qualquer reivindicação, ação ou pedido de indenização relacionados a essa questão.",
            ],
          ),

          ...createBoxedParagraph(
            "7. HERDEIROS E SUCESSORES: as declarações e disposições deste termo se aplicam aos meus herdeiros, sucessores ou representantes.",
            [
              "O PARTICIPANTE declara estar ciente de que as disposições deste TERMO têm caráter pessoal e produzirão efeitos enquanto aplicáveis à sua participação no EVENTO. Caso aplicável, seus herdeiros ou sucessores poderão ser responsáveis pelo cumprimento de eventuais obrigações remanescentes, nos limites da legislação vigente.",
            ],
          ),

          ...createBoxedParagraph(
            "8. DIVISIBILIDADE: declaro estar ciente de que a eventual invalidação de qualquer dos dispositivos deste termo não invalida os demais.",
            [
              "Caso qualquer disposição deste TERMO seja considerada inválida, ilegal ou inexequível por qualquer motivo, tal invalidação não afetará as demais disposições, que permanecerão em pleno vigor e efeito. Nesses casos, a cláusula afetada será interpretada e ajustada na máxima extensão permitida pela legislação aplicável, garantindo que a intenção original das partes seja preservada.",
            ],
          ),

          ...createBoxedParagraph(
            "9. LEI APLICÁVEL: declaro estar de acordo que este termo é firmado de acordo comas leis do Brasil.",
            [
              "Este TERMO será regido, interpretado e executado de acordo com as leis da República Federativa do Brasil.",
            ],
          ),

          ...createBoxedParagraph(
            "10. DIREITOS DE IMAGEM: estou de acordo com o uso de minha imagem, voz e conteúdo de minhas falas para fins de divulgação do evento, por prazo indeterminado, salvo disposição em contrária das partes, por escrito, em separado. DECLARO AINDA QUE ESTOU CIENTE DE QUE NÃO POSSO TIRAR FOTOS, GRAVAR VÍDEOS E ÁUDIOS DURANTE O EVENTO, SALVO SE SOLICITADO PRÉVIA E EXPRESSAMENTE PELA LEGENDARIOS.",
            [
              "O PARTICIPANTE declara que:",
              "a. A LEGENDARIOS pode registrar sua participação no EVENTO por meio de fotografias, vídeos ou gravações de áudio e suas transcrições, e utilizá-los para fins publicitários, de propaganda e marketing, em quaisquer meios ou veículos, impressos ou virtuais, de baixa a alta circulação, privados ou públicos, com ou sem fins lucrativos, no Brasil ou exterior, sem necessidade de quaisquer autorizações adicionais.",
              "b. Está ciente de que não poderá tirar fotos e gravar vídeos ou áudios relativos à realização do evento, salvo autorização prévia e expressa da organização.",
              "c. Esta declaração é irrevogável e irretratável e não possui prazo de validade, prevalecendo seus efeitos após a realização do evento, por prazo indeterminado.",
            ],
          ),

          ...createBoxedParagraph(
            "11. DA PROPRIEDADE INTELECTUAL DA LEGENDARIOS: declaro estar ciente dos direitos de propriedade intelectual, abaixo descritos, que são integralmente da LEGENDÁRIOS e não me foram transferidos. DECLARO, AINDA QUE NÃO IREI UTILIZÁ-LOS PARA QUAISQUER FINALIDADES E, ESPECIALMENTE, NÃO IREI EMPREENDER EM NENHUM NEGÓCIO OU INICIAR QUAISQUER ATIVIDADES, AINDA QUE SEM FINS LUCRATIVOS, FAZENDO USO DOS MESMOS OU FAZENDO MENÇÃO DIRETA OU INDIRETA À LEGENDARIOS.",
            [
              "O PARTICIPANTE reconhece que todas as marcas, logotipos, designs, elementos nominativos, estilizados ou não, e qualquer outro sinal de propriedade intelectual associado ao evento ou à LEGENDARIOS (aqui designados simplesmente MARCAS) são de propriedade exclusiva da LEGENDARIOS e não podem ser utilizados para nenhuma finalidade pelo PARTICIPANTE. Dentre as MARCAS a LEGENDARIOS cita, sem se limitar, as seguintes:",
            ],
          ),

          new Paragraph({
            children: [
              new ImageRun({
                data: fs.readFileSync("./public/lgnd-marcas.png"),
                type: "png",
                transformation: {
                  width: 660,
                  height: 220,
                },
              }),
            ],
            spacing: { after: 200 },
            alignment: AlignmentType.CENTER,
          }),

          ...createTextsParagraph([
            "a. No conceito de MARCAS também estão incluídos quaisquer palavras, frases, slogans gritos de guerra que possam estar relacionados à LEGENDÁRIOS. Cita-se, dentre outros:",
            "i. Track Outdoor de Potencial – TOP;",
            "ii. Desafio Intensivo de Oração – RIO;",
            "iii. Desafio de Ajuda Comunitária;",
            "iv. Legado;",
            "v. Reto por tu Mês/Desafio para o seu Mês (RPM);",
            "vi. Uma História Digna De Ser Contada;",
            "vii. Cúpula Mundial Legendários;",
            "viii. Congresso o Poder da Manada/Manada.",
            "b. O PARTICIPANTE reconhece que a LEGENDARIOS poderá, a qualquer momento, protocolar novas marcas junto ao Instituto Nacional da Propriedade Intelectual (INPI) ou outros órgãos competentes, as quais serão automaticamente incorporadas a este termo, sem necessidade de formalização de aditivo ou comunicação prévia ao PARTICIPANTE.",
            "c. O PARTICIPANTE não possui qualquer direito de uso, exploração ou registro das MARCAS, estejam elas registrados ou não pela LEGENDÁRIOS, salvo se previamente e expressamente autorizado por escrito pela LEGENDARIOS INTERNATIONAL LLC, nem farei referência direta ou indireta à LEGENDARIOS e seus sinais distintivos.",
            "d. É expressamente vedado ao PARTICIPANTE:",
            "i. utilizar, explorar ou registrar quaisquer marcas, designs ou elementos que sejam iguais ou semelhantes às MARCAS da LEGENDARIOS, seja em sua parte nominativa ou visual;",
            "ii. criar, reproduzir ou distribuir materiais, produtos, serviços, publicações (físicas ou virtuais), livros, artigos ou qualquer outro conteúdo que utilize ou faça menção à PROPRIEDADE INTELECTUAL da LEGENDARIOS, sem a prévia e expressa autorização por escrito da LEGENDARIOS;",
            "iii. utilizar as MARCAS ou a PROPRIEDADE INTELECTUAL da LEGENDARIOS para fins comerciais, promocionais ou pessoais, seja com ou sem finalidade lucrativa, sem autorização formal e por escrito da LEGENDARIOS INTERNATIONAL LLC.",
            "e. O PARTICIPANTE notificará imediatamente a LEGENDARIOS em caso de conhecimento de qualquer uso não autorizado das MARCAS, sinais distintivos ou violação dos direitos de propriedade intelectual da LEGENDARIOS.",
            "f. Consequências do Descumprimento: o PARTICIPANTE está ciente de que o descumprimento das disposições desta cláusula acarretará responsabilidades legais, incluindo, mas não se limitando a, ações judiciais criminais e cíveis por violação de propriedade intelectual e/ou concorrência desleal, com direito a indenizações por perdas e danos, além de outras medidas cabíveis.",
          ]),

          ...createBoxedParagraph(
            "12. DA NÃO COMPETIÇÃO: DECLARO QUE NÃO FAREI USO DAS INFORMAÇÕES CONFIDENCIAIS E/OU DA PROPRIEDADE INTELECTUAL DA LEGENDARIOS PARA EMPREENDER EM NENHUM NEGÓCIO OU INICIAR QUAISQUER ATIVIDADES, AINDA QUE SEM FINS LUCRATIVOS, FAZENDO USO DOS MESMOS OU FAZENDO MENÇÃO DIRETA OU INDIRETA À LEGENDARIOS.",
            [
              "O PARTICIPANTE declara e reconhece que os 'modelos de negócio' e 'trade dress' dos eventos da LEGENDARIOS, dentre eles o Track Outdoor de Potencial – TOP; o Desafio Intensivo de Oração–RIO; o Desafio de Ajuda Comunitária; Legado; Reto por tu Mês/Desafio para o seu Mês (RPM); a Cúpula Mundial Legendários e o Congresso o Poder da Manada, dentre outros, foram criados e desenvolvidos pela LEGENDARIOS e não podem ser copiados, no todo ou em partes, pelo PARTICIPANTE. Qualquer ato que conote a criação de um evento igual ou similar aos acima citados demandarão o pagamento de uma multa de US$100.000,00 (cem mil dólares) sem prejuízo de outras indenizações, sanções e cominações legais imputadas judicialmente.",
            ],
          ),

          ...createBoxedParagraph(
            "13. DA CONFIDENCIALIDADE: declaro que manterei em sigilo e não utilizarei, para fins públicos ou privados, com ou sem fins lucrativos, especialmente não utilizarei para fins políticos e partidários as INFORMAÇÕES CONFIDENCIAIS abaixo descritas, obtidas em decorrência do EVENTO, antes, durante e após o EVENTO.",
            [
              "DECLARO AINDA QUE ESTOU CIENTE DE QUE NÃO POSSO ESCREVER ARTIGOS, LIVROS, DAR ENTREVISTAS OU PULICAR, DE QUALQUER FORMA, CONTEÚDO QUE TENHA RELAÇÃO DIRETA OU INDIRETA COM A LEGENDARIOS E O EVENTO, SALVO AUTORIZAÇÃO DA LEGENDARIOS.",
              "O PARTICIPANTE declara e reconhece que:",
              "a. Todas as informações relacionadas à PROPRIEDADE INTELECTUAL da LEGENDARIOS, incluindo conhecimentos técnicos e comerciais, estratégias de marketing, lista de fornecedores, estrutura e dinâmica dos EVENTOS, materiais de treinamento, guias e quaisquer outros dados obtidos pelo PARTICIPANTE, formal ou informalmente, autorizado ou não, são confidenciais e protegidos como segredos comerciais;",
              "b. Manterá o sigilo sobre essas informações e a não divulgá-las, compartilhá-las ou utilizá-las, em qualquer meio, incluindo redes sociais, plataformas digitais, veículos de mídia, blogs, fóruns, canais de vídeo ou aplicativos de mensagens, independentemente da existência de remuneração ou benefício;",
              "c. Qualquer experiência vivida, situação presenciada, acontecimento ocorrido ou informação obtida pelo PARTICIPANTE antes, durante ou após sua participação no evento e em decorrência dele ou de seu relacionamento com a LEGENDARIOS será considerada CONFIDENCIAL, independentemente do meio pelo qual tenha sido acessada, adquirida ou presenciada. Qualquer exposição, por meio de testemunho ou publicação, poderá ser autorizada pela LEGENDARIOS;",
              "d. Está ciente de que a divulgação não autorizada dessas informações será considerada uma violação grave deste TERMO, estando sujeito às sanções cíveis e penais cabíveis, bem como ao pagamento de indenizações de ordem material e moral;",
              "e. Todas as informações confidenciais fornecidas pela LEGENDARIOS devem ser utilizadas exclusivamente para fins relacionados à execução dos EVENTOS e à sua participação nos mesmos, comprometendo-se a adotar o mais alto grau de cuidado para proteger a confidencialidade desses dados;",
              "f. Consequências por Violação: o PARTICIPANTE declara estar ciente de que a violação desta cláusula acarretará penalidades severas, incluindo, mas não se limitando a, exclusão da sua participação no evento, indenizações por danos e a possibilidade de medidas judiciais para cessação da quebra de confidencialidade e correção de suas consequências.",
              "g. Aplicabilidade Pós-Evento: as obrigações de confidencialidade estabelecidas nesta cláusula permanecerão válidas mesmo após o término da participação do PARTICIPANTE nos EVENTOS, aplicando-se a qualquer informação obtida durante o período de sua participação.",
            ],
          ),

          ...createBoxedParagraph(
            "14. PROTEÇÃO E USO DE DADOS: estou ciente e anuente com a coleta, uso e armazenamento dos meus dados pessoais revelados por meio da minha participação no EVENTO, por parte da LEGENDARIOS, que poderão ser compartilhados com terceiros sem qualquer autorização adicional, para fins de marketing, publicidade e propaganda, bem como para o oferecimento de produtos e serviços da LEGENDÁRIOS e seus parceiros comerciais.",
            [
              "O PARTICIPANTE declara estar ciente e de acordo com a coleta, uso e armazenamento de seus dados pessoais para fins relacionados à sua inscrição, participação e comunicação referente ao evento TOP LEGENDÁRIOS. As informações fornecidas poderão incluir, mas não se limitam a, nome, contato, documento de identificação e demais dados necessários para a organização do evento.",
              "a. Os dados serão protegidos por medidas de segurança apropriadas e acessíveis apenas aos responsáveis pela administração do evento. As informações não serão compartilhadas com terceiros sem autorização expressa do PARTICIPANTE, salvo nos casos em que sejam exigidas por obrigações legais ou para resguardar direitos da organização.",
              "b. O PARTICIPANTE poderá, a qualquer momento, solicitar acesso, correção, atualização ou exclusão de seus dados, bem como revogar o consentimento para seu tratamento, mediante solicitação formal aos organizadores do evento.",
              "c. Caso o PARTICIPANTE não concorde com os termos desta cláusula, poderá optar por não fornecer seus dados sem que isso lhe acarrete qualquer prejuízo. No entanto, entende que algumas informações podem ser essenciais para sua participação no evento.",
              "d. As disposições relativas ao tratamento de dados permanecerão em vigor enquanto necessário para atender às finalidades informadas, podendo se estender para cumprimento de exigências regulatórias e legais aplicáveis.",
              "DO ATENDIMENTO MÉDICO, DA SAÚDE E OUTRAS AVENÇAS: autorizo a LEGENDARIOS a providenciar assistência médica ou transporte em caso de necessidade, sem que isso imponha a LEGENDARIOS qualquer obrigação de fazê-lo.",
            ],
          ),

          ...createBoxedParagraph(
            "15. CONSENTIMENTO PARA ATENDIMENTO MÉDICO: autorizo a LEGENDARIOS a providenciar assistência médica ou transporte em caso de necessidade, sem que isso imponha a LEGENDARIOS qualquer obrigação de fazê-lo.",
            [
              "A LEGENDARIOS poderá, a seu exclusivo critério e sem qualquer obrigação, disponibilizar atendimento médico emergencial durante o EVENTO, visando a segurança dos PARTICIPANTES. No entanto, o PARTICIPANTE reconhece e concorda que a ORGANIZAÇÃO não assume qualquer responsabilidade pela prestação, qualidade, continuidade ou eficácia desse atendimento, bem como por eventuais custos decorrentes de assistência médica, hospitalar ou medicamentos a necessária antes, durante ou após o EVENTO.",
              "Caso ocorra alguma emergência médica, a ORGANIZAÇÃO poderá, se entender necessário, acionar serviços médicos externos ou encaminhar o PARTICIPANTE para atendimento especializado, ficando este responsável por quaisquer despesas envolvidas."
            ],
          ),

          ...createBoxedParagraph(
            "16. CONDUTA E ÉTICA: Concordo em não portar ou consumir drogas, álcool ou cigarros durante o EVENTO e manterei durante e após o evento uma conduta ética, respeitando à imagem da LEGENDÁRIOS, não praticando violência física, verbal ou psicológica contra ninguém, nem adotar posturas e praticar atos que atentem contra a moral e bons costumes, nem que atentem contra os princípios e valores da LEGENDÁRIOS, sob pena de expulsão do movimento.",
            [
              "O PARTICIPANTE compromete-se a manter conduta ética e respeitosa antes, durante e após o EVENTO, bem como em todas as interações relacionadas aos demais participantes e colaboradores da LEGENDARIOS. É expressamente proibida para o PARTICIPANTE qualquer forma de violência física, verbal ou psicológica, incluindo intimidações, ameaças, assédio, agressões ou qualquer outro ato que comprometa a segurança e o bem-estar dos envolvidos.",
              "a. Além disso, o PARTICIPANTE não poderá praticar atos que atentem contra a moral, os bons costumes e a imagem do EVENTO e do GRUPO, tais como, mas não se limitando a:",
              "- Uso de linguagem ou comportamento inadequado, ofensivo ou discriminatório;",
              "- Embriaguez ou consumo de substâncias ilícitas durante ou em razão do EVENTO. O PARTICIPANTE concorda que não irá portar ou consumir drogas, álcool ou cigarros durante o EVENTO. Caso contrário, será enviado de volta às suas próprias custas, sem reembolsos de qualquer sorte;",
              "- Postagens em redes sociais, declarações públicas ou qualquer conduta que possa difamar ou prejudicar a reputação do GRUPO e de seus integrantes;",
              "- Atitudes que causem constrangimento ou desrespeito a outros participantes, organizadores ou terceiros.",
              "b. O descumprimento desta cláusula poderá resultar em imediata exclusão do PARTICIPANTE do EVENTO e/ou do GRUPO, sem direito a reembolso de valores pagos, além de possíveis medidas legais cabíveis.",
            ],
          ),

          ...createBoxedParagraph(
            "17. SAÚDE: Declaro que estou totalmente apto a praticar atividades físicas extremas e poderei, em caso de acidente, assumindo a total responsabilidade pelas despesas médicas que possa ter em decorrência da minha participação no EVENTO.",
            [
              "O PARTICIPANTE declara estar ciente da necessidade de possuir seguro e/ou plano de saúde que cobre integralmente sua participação durante o EVENTO. Caso não possua cobertura de seguro, assume total e exclusiva responsabilidade por quaisquer despesas médicas, hospitalares ou tratamento que possam ser necessárias durante ou após o EVENTO, incluindo, mas não se limitando a atendimentos de emergência, internações, medicamentos e procedimentos cirúrgicos.",
              "a. O PARTICIPANTE reconhece que, em caso de não possuir seguro/plano de saúde, bem como condições financeiras de arcar com as despesas médicas, hospitalares, será encaminhado ao sistema único de Saúde, sobre o qual a organização do evento não se responsabiliza por eventuais falhas, demoras ou limitações no atendimento, sendo de sua exclusiva responsabilidade a escolha e a qualidade do tratamento médico recebido.",
              "b. Por fim, o PARTICIPANTE REITERA estar completamente apto e saudável para realizar as atividades físicas exigidas no evento, não possuindo qualquer restrição médica que impeça sua participação.",
            ],
          ),

          ...createBoxedParagraph(
            "18. DECLARAÇÕES FINAIS: ter lido e compreendido integralmente o presente TERMO, ratificando todas as cláusulas, condições e obrigações nele estabelecidas, reconhecendo que este documento constitui um acordo vinculante.",
            [
              "O PARTICIPANTE afirma que assina o TERMO de forma livre, espontânea e consciente, sem qualquer tipo de coação, reserva ou vício de consentimento, assumindo plena responsabilidade por todas as declarações aqui firmadas. Este TERMO entra em vigor a partir da data de sua assinatura, produzindo efeitos legais para todas as atividades relacionadas à participação do PARTICIPANTE no evento.",
            ],
          ),

          new Paragraph({
            children: [
              new TextRun({
                text: "Data: ",
                bold: true,
                break: 2,
                size: 18,
              }),
              new TextRun({
                text: "Cidade: ",
                bold: true,
                break: 2,
                size: 18,
              }),
            ],
            spacing: { after: 200, before: 200 },
            alignment: AlignmentType.START,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "_________________________________________",
                bold: true,
                break: 2,
              }),
              new TextRun({
                text: "Assinatura do participante",
                size: 18,
                break: 2,
              }),
            ],
            spacing: { after: 200, before: 200 },
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });
}

// Function to generate and save a document for each user
async function generateDocuments() {
  const users = await getConfirmedUsers();

  if (users.length === 0) {
    console.log("No users found");
    return;
  }

  console.log(`Gerando termos para ${users.length} participantes...`);

  const outputDir = path.join(__dirname, "termos_responsabilidade");
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });
  } catch (err) {
    if (err.code !== "EXIST") throw err;
  }

  const BATCH_SIZE = 20;
  let processedCount = 0;

  const usersTests = users.slice(0, 1);
  // Processar em lote
  for (let i = 0; i < usersTests.length; i += BATCH_SIZE) {
    const batch = usersTests.slice(i, i + BATCH_SIZE);

    // Processar lote em paralelo
    await Promise.all(
      batch.map(async (user) => {
        try {
          const doc = createUserDocument(user, user.topNumber);
          const buffer = await Packer.toBuffer(doc);

          // Criar nome de arquivo seguro
          const safeFileName = user?.name
            ?.replace(/[^\w\s]/gi, "")
            .replace(/\s+/g, "_");
          const fileName = path.join(
            outputDir,
            `TermoDeIsencao_${safeFileName}.docx`,
          );

          await fs.promises.writeFile(fileName, buffer);
          processedCount++;
        } catch (error) {
          console.error(`Erro ao processar ${user?.name}: ${error.message}`);
        }
      }),
    );

    console.log(
      `Processamento concluído. ${processedCount} termos foram gerados em ${outputDir}`,
    );
  }
}

// Execute the document generation
generateDocuments().catch((err) => {
  console.error("Error creating documents:", err);
});
