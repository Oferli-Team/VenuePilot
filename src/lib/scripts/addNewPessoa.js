// prisma/seed.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const data = {
  // Relacionamentos com outras tabelas
  userId: '669692d4ced91342a7c536be', // Certifique-se de que este ID existe na tabela User

  // Dados Pessoais
  cpf: '01843807661',
  nome: 'Asaphe Guimarães Araújo Recaldes',
  rg: '2785663',
  orgaoExpedidor: 'Paracatu MG',
  dataNascimento: new Date('1998-04-15'),
  estadoCivil: 'Casado',
  celular: '67992335889',
  email: 'asapherecaldesaraujo@gmail.com',

  // Endereço
  cep: '79904374',
  rua: 'Tiradentes',
  ruaNumero: '205',
  ruaComplemento: '',
  bairro: 'Vila Izabel',
  cidade: 'Ponta Porã',
  estado: 'MS',

  // Saúde
  peso: 75.0,
  altura: 175.0,

  // Religião
  igreja: 'Igreja CTV',
  igrejaPastor: 'Pastor Neto',
  
  // Família
  temFilhos: false,
  qtdFilhos: 0,

  // Contato de Emergência
  nomeContatoEmergencia: 'Lais Recaldes',
  emailContatoEmergencia: 'laisrecaldes@gmail.com',
  celularContatoEmergencia: '67992948004',
  tipoVinculoContatoEmergencia: 'Esposa',

  possuiPlanoSaude: false,
  nomePlanoSaude: '',
  possuiAlergia: false,
  possuiDiabetes: false,
  possuiConvulsoes: false,
  possuiDesmaios: false,
  possuiProblemasCardiacos: false,
  possuiDisturbiosAlimentares: false,
  possuiProblemasRespiratorios: false,
  cuidadosPsiquiatricos: false,
  medicacaoDepressao: false,
  possuiProblemasMusculoesqueleticos: false,
  doencaOuCondicao: 'Nenhuma',
  medicacoes: 'Nenhuma',
  outrasInformacoesMedicas: 'Nenhuma',
  motivosDietaEspecial: 'Nenhuma',

  // Pagamento
  pagamento_status: 'PAGAMENTO_PIX_EXTERNO',
  pagamento_data: new Date('2024-07-15'),
  pagamento_topValue: '1390',
  pagamento_couponValue: '',
  pagamento_valueDiscount: '',
  pagamento_feeCard: '',
  pagamento: [],

  // Status
  ativo: true,
  status: 'CONFIRMADA',
  createdAt: new Date(),
  updatedAt: new Date(),

  // caravana: '',
  tamanhoFarda: 'G',
  aceitaTermos: true,
  tipoInscricao: 'PARTICIPANTE',

  // Legendários
  comoConheceuLegendarios: 'Outros',
  quemConvidou: 'Mário Sérgio',
  // top: 'Top Exemplo',
  // nrLgnd: '123456',
  // lgndCertificado: false,
  // lgndManadaDourados: false,
  // possuiAutorizacaoServir: true,
}

data.imc = data.peso / ((data.altura / 100) * (data.altura / 100));

// 173

async function main() {
  const novaPessoa = await prisma.pessoa.create({
    data
  });

  console.log('Nova pessoa inserida:', novaPessoa);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
