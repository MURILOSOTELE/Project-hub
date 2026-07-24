// Lista fixa de categorias disponíveis para os projetos
export const CATEGORIAS = [
  'Tecnologia',
  'E-commerce',
  'Aplicativos',
  'Inteligência Artificial',
  'Outros',
];

// Usuários de exemplo (sem "area" — removido conforme decidimos)
export const USUARIOS_SEED = [
  {
    id: 'u1',
    nome: 'Ana Beatriz',
    email: 'ana@teste.com',
    senha: '123456',
    cidade: 'São Paulo, SP',
    avatar: '',
    bio: 'Investidora anjo focada em startups de tecnologia e saúde.',
    salvos: [],
    verificado: true,
  },

  {
    id: 'u2',
    nome: 'murilo sotele',
    email: 'murilo@teste.com',
    senha: '123456',
    cidade: 'SERRA, ES',
    avatar: '',
    bio: 'DEV PROJECT HUB',
    salvos: [],
    verificado: false,
  },
];

// Projetos de exemplo, um de cada "tipo"
export const PROJETOS_SEED = [
  {
    id: 'p1',
    autorId: 'u2',
    tipo: 'investidor', // procura investidor
    titulo: 'App de delivery sustentável',
    resumo: 'Plataforma de entregas usando bicicletas elétricas.',
    categoria: 'E-commerce',
    valor: 'R$ 150.000',
    procura: null,
    localizacao: 'Belo Horizonte, MG',
    imagem: '',
    interessados: [],
    data: '2026-06-10',
  },

  {
    id: 'p2',
    autorId: 'u1',
    tipo: 'equipe', // procura parceiro/equipe
    titulo: 'Plataforma de telemedicina para zonas rurais',
    resumo: 'Conectamos médicos a pacientes em regiões remotas.',
    categoria: 'Saúde',
    valor: null,
    procura: ['Desenvolvedor Mobile', 'Médico Consultor'],
    localizacao: 'São Paulo, SP',
    imagem:
      '',
    interessados: [],
    data: '2026-06-18',
  },
];
