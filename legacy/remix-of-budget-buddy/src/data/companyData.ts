// ============= ARQEXPRESS - DADOS DA EMPRESA =============

export const companyInfo = {
  name: 'ARQEXPRESS',
  tagline: 'Arquitetura, sem complicar.',
  signature: 'Transformando sonhos em projetos possíveis.',
  year: '2026',
  yearsActive: '10+',
  description: 'A ARQEXPRESS nasceu há mais de 10 anos com o propósito de democratizar a arquitetura, mostrando que arquitetura não é luxo e sim necessidade. Criamos projetos para quem vai viver, independente de estilo ou bolso.',
  valueProposition: 'Você diz quanto quer gastar e nós dizemos o que você pode fazer.',
};

export const mission = {
  mission: 'Resolver casas com arquitetura funcional, bonita e inteligente — usando processo, velocidade e qualidade.',
  vision: 'Ser a maior referência em arquitetura sistematizada e acessível do Brasil.',
  promise: 'Casa bem resolvida. Sem dúvida. Sem surpresa. Sem dor de cabeça.',
};

export const values = [
  { number: 1, title: 'TRANSFORMAR SONHOS', description: 'Todo mundo merece uma casa que diga "essa sou eu".' },
  { number: 2, title: 'RESOLVER É O PADRÃO', description: 'Não entregamos ideia. Entregamos solução.' },
  { number: 3, title: 'PROCESSO VENCE IMPROVISO', description: 'Método antes do feeling.' },
  { number: 4, title: 'VELOCIDADE COM QUALIDADE', description: 'Rápido porque sabemos o que fazemos.' },
  { number: 5, title: 'FUNCIONALIDADE PRIMEIRO', description: 'Casa boa funciona. O resto acompanha.' },
  { number: 6, title: 'CLAREZA RADICAL', description: 'Sem letra miúda. Sem surpresa.' },
];

export const pillars = [
  { icon: '⚡', title: 'RÁPIDA', description: 'Metodologia express, entregas ágeis' },
  { icon: '💡', title: 'INOVADORA', description: 'Tecnologia e processos definidos' },
  { icon: '✓', title: 'DESCOMPLICADA', description: 'Transparência total no orçamento' },
  { icon: '🔄', title: 'HÍBRIDA', description: 'Online + Presencial' },
  { icon: '★', title: 'NOVA ARQUITETURA', description: 'Inteligente, moderna, acessível' },
];

export const differentials = [
  { icon: '📋', title: 'METODOLOGIA EXPRESS', description: 'Processo padronizado, eficiente e previsível' },
  { icon: '💰', title: 'ORÇAMENTO DEFINIDO', description: 'Você define o valor, a gente mostra o que é possível' },
  { icon: '🏠', title: 'ONLINE + PRESENCIAL', description: 'Flexibilidade total para cada cliente' },
  { icon: '⏱️', title: 'PRAZOS CURTOS', description: 'Projetos em dias ou semanas, não meses' },
  { icon: '🛒', title: 'LISTA INTELIGENTE', description: 'Integração com fornecedores e lojas' },
  { icon: '💳', title: 'PARCELAMENTO', description: 'Condições facilitadas de pagamento' },
];

// ============= SERVIÇOS =============

export type ServiceId = 'consultexpress' | 'produzexpress' | 'decorexpress' | 'projetexpress';

export interface ServiceInfo {
  id: ServiceId;
  name: string;
  displayName: string;
  tagline: string;
  badge: string;
  forWho: string[];
  whatIs: string;
  delivery: string;
  modality: string;
  meetings: string;
  prazo3d?: string;
  prazo: string;
  isFeatured?: boolean;
  includes: string[];
  notIncludes?: string[];
  additionalInfo?: string[];
}

export const services: Record<ServiceId, ServiceInfo> = {
  consultexpress: {
    id: 'consultexpress',
    name: 'CONSULTEXPRESS',
    displayName: 'CONSULT<span>EXPRESS</span>',
    tagline: 'Orientação profissional para você decidir melhor.',
    badge: 'ONLINE OU PRESENCIAL • 7-14 DIAS',
    forWho: [
      'Quem tem dúvidas pontuais e quer direcionamento rápido',
      'Quem quer ajuda para escolher itens ou validar ideias',
      'Quem ainda não sabe qual serviço precisa'
    ],
    whatIs: 'Consultoria com arquiteta. Rápida, objetiva e eficaz.',
    delivery: 'Clareza para você decidir os próximos passos.',
    modality: 'Online ou Presencial',
    meetings: '1',
    prazo: '7-14 dias',
    includes: [
      'REUNIÃO COM ARQUITETA (ONLINE OU PRESENCIAL)',
      'ANÁLISE DO AMBIENTE E NECESSIDADES',
      'ORIENTAÇÕES PERSONALIZADAS',
      'DIRECIONAMENTO PARA PRÓXIMOS PASSOS'
    ],
    additionalInfo: [
      'LAYOUT BÁSICO',
      'LISTA DE INDICAÇÕES',
      'DETALHAMENTO DE MARCENARIA',
      'OUTROS MATERIAIS TÉCNICOS'
    ]
  },
  produzexpress: {
    id: 'produzexpress',
    name: 'PRODUZEXPRESS',
    displayName: 'PRODUZ<span>EXPRESS</span>',
    tagline: 'A gente finaliza, você só aproveita.',
    badge: 'PRESENCIAL • 10-15 DIAS',
    forWho: [
      'Quem já tem os móveis e só precisa finalizar',
      'Quem quer ajuda para montar e organizar',
      'Quem não tem tempo de produzir o ambiente'
    ],
    whatIs: 'Produção e finalização presencial do ambiente. A gente vai até você e deixa tudo pronto.',
    delivery: 'Ambiente finalizado, organizado e pronto para usar.',
    modality: 'Presencial',
    meetings: '1 + Dia de Produção',
    prazo: '10-15 dias',
    includes: [
      'REUNIÃO DE BRIEFING',
      'DIA DE PRODUÇÃO PRESENCIAL',
      'ORGANIZAÇÃO DO AMBIENTE',
      'MONTAGEM E POSICIONAMENTO',
      'DECORAÇÃO E TOQUES FINAIS',
      'STYLING COMPLETO'
    ],
    notIncludes: [
      'PROJETO DE INTERIORES',
      'COMPRA DE ITENS',
      'MONTAGEM DE MÓVEIS',
      'INSTALAÇÕES ELÉTRICAS/HIDRÁULICAS',
      'PINTURA OU REFORMAS'
    ]
  },
  decorexpress: {
    id: 'decorexpress',
    name: 'DECOREXPRESS',
    displayName: 'DECOR<span>EXPRESS</span>',
    tagline: 'Transformação completa do seu ambiente.',
    badge: 'CARRO-CHEFE • ONLINE OU PRESENCIAL',
    forWho: [
      'Quem quer transformar ambientes com projeto profissional',
      'Layout, mobiliário, marcenaria, iluminação e decoração',
      'Tudo organizado, dentro do orçamento'
    ],
    whatIs: 'Projeto completo de decoração de interiores. Do conceito ao manual de montagem. Arquitetura que resolve, sem dor de cabeça.',
    delivery: 'Projeto completo com tudo que você precisa para transformar seu ambiente.',
    modality: 'Online ou Presencial',
    meetings: '3-4',
    prazo3d: '15-28 dias',
    prazo: 'Até 60 dias',
    isFeatured: true,
    includes: [
      'REUNIÃO DE BRIEFING',
      'PROJETO DE LAYOUT E FLUXO',
      'PROJETO 3D REALISTA',
      'ESPECIFICAÇÃO DE MOBILIÁRIO',
      'PROJETO DE MARCENARIA',
      'PROJETO DE ILUMINAÇÃO',
      'MANUAL DE MONTAGEM',
      'LISTA DE COMPRAS COM LINKS'
    ],
    notIncludes: [
      'PROJETO EXECUTIVO (CIVIL/ELÉTRICA/HIDRÁULICA)',
      'ART (RESPONSABILIDADE TÉCNICA)',
      'PRODUÇÃO / DIA DE MONTAGEM'
    ]
  },
  projetexpress: {
    id: 'projetexpress',
    name: 'PROJETEXPRESS',
    displayName: 'PROJET<span>EXPRESS</span>',
    tagline: 'Projeto completo para sua obra.',
    badge: 'PRESENCIAL • PRAZO PERSONALIZADO',
    forWho: [
      'Apartamento completo ou obra',
      'Quem precisa de projeto executivo',
      'Quem vai fazer reforma com obra civil'
    ],
    whatIs: 'Projeto completo de interiores. Executivo + Decoração. Tudo para sua obra.',
    delivery: 'Executivo + Manual + ART',
    modality: 'Presencial',
    meetings: '5+',
    prazo: 'Sob consulta',
    includes: [
      'TUDO DO DECOREXPRESS',
      'PROJETO EXECUTIVO COMPLETO',
      'PROJETO ELÉTRICO',
      'PROJETO HIDRÁULICO',
      'PROJETO DE FORRO',
      'DETALHAMENTOS TÉCNICOS',
      'ART (RESPONSABILIDADE TÉCNICA)',
      'ACOMPANHAMENTO DE OBRA (OPCIONAL)'
    ]
  }
};

// ============= ETAPAS DE PROCESSO =============

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  detail?: string;
  prazo?: { value: string; label: string };
  isHighlight?: boolean;
}

export const processSteps: Record<ServiceId, { online?: ProcessStep[]; presencial?: ProcessStep[]; default?: ProcessStep[] }> = {
  consultexpress: {
    default: [
      { number: 1, title: 'PAGAMENTO', description: 'Cliente realiza o pagamento e a consultoria é iniciada.', prazo: { value: '—', label: 'INÍCIO' } },
      { number: 2, title: 'QUESTIONÁRIO PRÉ-BRIEFING', description: 'Cliente preenche o formulário com suas dúvidas, fotos do ambiente e o que precisa resolver.', prazo: { value: '2', label: 'DIAS ÚTEIS' } },
      { number: 3, title: 'REUNIÃO DE CONSULTORIA', description: 'Reunião online ou presencial com a arquiteta para análise e orientações personalizadas.', detail: 'Agendamos em até 7 dias após o envio do briefing.', prazo: { value: '7', label: 'DIAS' }, isHighlight: true },
      { number: 4, title: 'ENTREGA DO MATERIAL (OPCIONAL)', description: 'Se houver material adicional contratado, entregamos em até 7 dias após a reunião.', prazo: { value: '7', label: 'DIAS' } }
    ]
  },
  produzexpress: {
    default: [
      { number: 1, title: 'PAGAMENTO', description: 'Cliente realiza o pagamento e o serviço é iniciado.', prazo: { value: '—', label: 'INÍCIO' } },
      { number: 2, title: 'QUESTIONÁRIO PRÉ-BRIEFING', description: 'Cliente preenche o formulário com fotos do ambiente atual, o que já tem, o que falta e o resultado esperado.', prazo: { value: '2', label: 'DIAS ÚTEIS' } },
      { number: 3, title: 'REUNIÃO DE BRIEFING', description: 'Reunião presencial ou online para alinhamento do que será feito no dia da produção.', prazo: { value: '1h', label: 'DURAÇÃO' } },
      { number: 4, title: 'DIA DE PRODUÇÃO', description: 'A arquiteta vai até o local e finaliza tudo: organização, montagem, decoração e toques finais.', detail: 'Agendamos em até 10-15 dias após o briefing.', prazo: { value: '10-15', label: 'DIAS' }, isHighlight: true },
      { number: 5, title: 'AMBIENTE FINALIZADO', description: 'Tudo pronto! Cliente só aproveita.', detail: 'Quer um projeto completo antes? Combine com o DECOREXPRESS.', prazo: { value: '✓', label: 'ENTREGA' } }
    ]
  },
  decorexpress: {
    online: [
      { number: 1, title: 'PAGAMENTO', description: 'Cliente realiza o pagamento e o projeto é iniciado oficialmente.', prazo: { value: '—', label: 'INÍCIO' } },
      { number: 2, title: 'QUESTIONÁRIO PRÉ-BRIEFING', description: 'Cliente preenche formulário detalhado com perfil, referências, necessidades e orçamento.', prazo: { value: '2', label: 'DIAS ÚTEIS' } },
      { number: 3, title: 'MEDIÇÃO DO AMBIENTE', description: 'Cliente envia medidas e fotos detalhadas seguindo o guia de medição.', detail: 'Disponibilizamos tutorial de como medir.', prazo: { value: '3', label: 'DIAS ÚTEIS' } },
      { number: 4, title: 'REUNIÃO DE BRIEFING', description: 'Videoconferência para alinhar expectativas, validar informações e definir diretrizes.', prazo: { value: '1h', label: 'DURAÇÃO' } },
      { number: 5, title: 'DESENVOLVIMENTO DO PROJETO', description: 'A equipe desenvolve o projeto 3D com layout, mobiliário, iluminação e decoração.', prazo: { value: '15', label: 'DIAS ÚTEIS' }, isHighlight: true },
      { number: 6, title: 'REUNIÃO DE APRESENTAÇÃO', description: 'Apresentação completa do projeto 3D, explicação de cada escolha e aprovação.', prazo: { value: '1h', label: 'DURAÇÃO' } },
      { number: 7, title: 'AJUSTES (SE NECESSÁRIO)', description: 'Até 2 rodadas de ajustes inclusos para garantir que o projeto fique perfeito.', prazo: { value: '5', label: 'DIAS ÚTEIS' } },
      { number: 8, title: 'ENTREGA FINAL', description: 'Projeto 3D finalizado + Manual de Montagem + Lista de Compras com links.', detail: 'Tudo organizado para você executar com autonomia.', prazo: { value: '✓', label: 'ENTREGA' } }
    ],
    presencial: [
      { number: 1, title: 'PAGAMENTO', description: 'Cliente realiza o pagamento e o projeto é iniciado oficialmente.', prazo: { value: '—', label: 'INÍCIO' } },
      { number: 2, title: 'QUESTIONÁRIO PRÉ-BRIEFING', description: 'Cliente preenche formulário detalhado com perfil, referências, necessidades e orçamento.', prazo: { value: '2', label: 'DIAS ÚTEIS' } },
      { number: 3, title: 'VISITA TÉCNICA + MEDIÇÃO', description: 'Arquiteta vai até o local, conhece o espaço, faz a medição e registra tudo.', detail: 'Conhecer o espaço pessoalmente permite decisões mais precisas.', prazo: { value: '2h', label: 'DURAÇÃO' }, isHighlight: true },
      { number: 4, title: 'REUNIÃO DE BRIEFING', description: 'Reunião presencial ou online para alinhar expectativas e definir diretrizes.', prazo: { value: '1h', label: 'DURAÇÃO' } },
      { number: 5, title: 'DESENVOLVIMENTO DO PROJETO', description: 'A equipe desenvolve o projeto 3D com layout, mobiliário, iluminação e decoração.', prazo: { value: '15-28', label: 'DIAS ÚTEIS' }, isHighlight: true },
      { number: 6, title: 'REUNIÃO DE APRESENTAÇÃO', description: 'Apresentação completa do projeto 3D, explicação de cada escolha e aprovação.', prazo: { value: '1h', label: 'DURAÇÃO' } },
      { number: 7, title: 'AJUSTES (SE NECESSÁRIO)', description: 'Até 2 rodadas de ajustes inclusos para garantir que o projeto fique perfeito.', prazo: { value: '5', label: 'DIAS ÚTEIS' } },
      { number: 8, title: 'ENTREGA FINAL', description: 'Projeto 3D finalizado + Manual de Montagem + Lista de Compras com links.', detail: 'Tudo organizado para você executar com autonomia.', prazo: { value: '✓', label: 'ENTREGA' } }
    ]
  },
  projetexpress: {
    default: [
      { number: 1, title: 'PAGAMENTO', description: 'Cliente realiza o pagamento e o projeto é iniciado oficialmente.', prazo: { value: '—', label: 'INÍCIO' } },
      { number: 2, title: 'QUESTIONÁRIO PRÉ-BRIEFING', description: 'Cliente preenche formulário completo: perfil, necessidades, orçamento, expectativas para obra.', prazo: { value: '2', label: 'DIAS ÚTEIS' } },
      { number: 3, title: 'VISITA TÉCNICA + MEDIÇÃO', description: 'Arquiteta vai ao local, analisa estrutura, instalações existentes e faz medição completa.', detail: 'Essencial para projetos executivos precisos.', prazo: { value: '3h', label: 'DURAÇÃO' }, isHighlight: true },
      { number: 4, title: 'REUNIÃO DE BRIEFING', description: 'Alinhamento completo de expectativas, definição de escopo e prioridades.', prazo: { value: '2h', label: 'DURAÇÃO' } },
      { number: 5, title: 'DESENVOLVIMENTO DO PROJETO 3D', description: 'Criação do projeto de interiores completo: layout, mobiliário, iluminação, decoração.', prazo: { value: '15-28', label: 'DIAS ÚTEIS' }, isHighlight: true },
      { number: 6, title: 'REUNIÃO DE APRESENTAÇÃO 3D', description: 'Apresentação e aprovação do projeto de interiores.', prazo: { value: '2h', label: 'DURAÇÃO' } },
      { number: 7, title: 'DESENVOLVIMENTO EXECUTIVO', description: 'Elaboração de todos os projetos técnicos: elétrica, hidráulica, forro, detalhamentos.', prazo: { value: '20-30', label: 'DIAS ÚTEIS' }, isHighlight: true },
      { number: 8, title: 'REUNIÃO DE ENTREGA EXECUTIVO', description: 'Apresentação dos projetos técnicos e orientações para execução da obra.', prazo: { value: '2h', label: 'DURAÇÃO' } },
      { number: 9, title: 'ENTREGA FINAL', description: 'Projeto 3D + Executivo + Manual + Lista de Compras + ART', detail: 'Tudo pronto para começar a obra com segurança.', prazo: { value: '✓', label: 'ENTREGA' } }
    ]
  }
};

// ============= COMPARATIVO DE SERVIÇOS =============

export const serviceComparison = [
  { service: 'CONSULTEXPRESS', forWho: 'Dúvidas pontuais', modality: 'Online / Presencial', prazo: '7-14 dias', delivery: 'Orientação + Material (opcional)' },
  { service: 'PRODUZEXPRESS', forWho: 'Finalizar ambiente', modality: 'Presencial', prazo: '10-15 dias', delivery: 'Ambiente montado' },
  { service: 'DECOREXPRESS', forWho: 'Transformar ambientes', modality: 'Online / Presencial', prazo: 'Até 60 dias', delivery: 'Projeto 3D + Manual', featured: true },
  { service: 'PROJETEXPRESS', forWho: 'Apartamento completo / Obra', modality: 'Presencial', prazo: 'Sob consulta', delivery: 'Executivo + Manual + ART' }
];
