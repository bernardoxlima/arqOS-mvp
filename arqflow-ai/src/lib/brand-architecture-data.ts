// Brand Architecture Types & Constants
export interface BrandIdentity {
  name: string;
  timeInBusiness: string;
  city: string;
  serviceModel: string;
  origin: string;
  milestone: string;
}

export interface BrandEssence {
  existsFor: string;
  personality: string[];
  differential: string;
  dontTransmit: string[];
}

export interface BrandAudience {
  idealClient: string;
  lifeMoments: string[];
  painPoints: string;
  values: string[];
  fears: string[];
  dontWant: string;
}

export interface BrandMethod {
  services: string[];
  flagshipService: string;
  process: string;
  processDifferential: string;
  deadline: string;
  technology: string[];
}

export interface BrandTransformation {
  result: string;
  feeling: string;
  referral: string;
}

export interface BrandVision {
  future: string;
  success: string[];
  knownFor: string;
  frustrations: string;
  belief: string;
  wouldChange: string;
}

export interface BrandSynthesis {
  forWho: string;
  notForWho: string;
  threeWords: string;
}

export interface BrandArchitecture {
  identity: BrandIdentity;
  essence: BrandEssence;
  audience: BrandAudience;
  method: BrandMethod;
  transformation: BrandTransformation;
  vision: BrandVision;
  synthesis: BrandSynthesis;
  brandbook?: string;
  generatedAt?: string;
}

export const BRAND_QUESTIONS = {
  identity: {
    block: "Identidade",
    subtitle: "Quem você é",
    questions: [
      { id: "name", label: "Qual o nome do seu escritório?", type: "text", placeholder: "Ex: Studio Lina Arquitetura" },
      { id: "timeInBusiness", label: "Há quanto tempo ele existe?", type: "select", options: ["Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "Mais de 10 anos"] },
      { id: "city", label: "Em que cidade/região você atua?", type: "text", placeholder: "Ex: São Paulo - Zona Sul" },
      { id: "serviceModel", label: "Como você atende seus clientes?", type: "select", options: ["Apenas presencial", "Apenas online", "Híbrido (online + presencial)"] },
      { id: "origin", label: "Por que você abriu seu próprio escritório?", type: "textarea", placeholder: "Conte sua história... O que te incomodava? O que você queria fazer diferente?" },
      { id: "milestone", label: "Qual foi o momento mais marcante da sua trajetória?", type: "textarea", placeholder: "Um projeto especial, um cliente, uma virada..." }
    ]
  },
  essence: {
    block: "Essência",
    subtitle: "Sua verdade",
    questions: [
      { id: "existsFor", label: "Complete: 'Meu escritório existe para...'", type: "textarea", placeholder: "Qual é a razão de existir do seu negócio?" },
      { id: "personality", label: "Se seu escritório fosse uma pessoa, como ela seria?", type: "multiselect", options: ["Acolhedor(a)", "Prático(a)", "Criativo(a)", "Sofisticado(a)", "Acessível", "Técnico(a)", "Inovador(a)", "Organizado(a)", "Ousado(a)", "Minimalista", "Caloroso(a)", "Direto(a)"] },
      { id: "differential", label: "O que te diferencia dos outros escritórios?", type: "text", placeholder: "Ex: Arquitetura que escuta antes de desenhar" },
      { id: "dontTransmit", label: "O que você NÃO quer transmitir?", type: "multiselect", options: ["Arrogância", "Inacessibilidade", "Desorganização", "Frieza", "Lentidão", "Confusão", "Elitismo", "Impessoalidade"] }
    ]
  },
  audience: {
    block: "Público",
    subtitle: "Para quem você projeta",
    questions: [
      { id: "idealClient", label: "Quem é seu cliente ideal?", type: "textarea", placeholder: "Descreva: idade, momento de vida, perfil..." },
      { id: "lifeMoments", label: "Em que momento de vida esse cliente te procura?", type: "multiselect", options: ["Comprou o primeiro imóvel", "Vai casar / morar junto", "Teve filhos", "Ninho vazio", "Reformando para vender", "Melhorar qualidade de vida", "Mudança de vida", "Investimento"] },
      { id: "painPoints", label: "Qual o maior problema que seu cliente tem?", type: "textarea", placeholder: "O que tira o sono dele?" },
      { id: "values", label: "O que seu cliente mais valoriza?", type: "multiselect", options: ["Preço acessível", "Velocidade de entrega", "Exclusividade", "Atendimento próximo", "Portfólio bonito", "Processo organizado", "Indicação"] },
      { id: "fears", label: "O que seu cliente mais teme?", type: "multiselect", options: ["Gastar mais que o planejado", "Não gostar do resultado", "Não ser compreendido", "Demora na entrega", "Projeto impraticável", "Falta de acompanhamento"] },
      { id: "dontWant", label: "Que tipo de cliente você NÃO quer?", type: "textarea", placeholder: "Qual perfil não combina com você?" }
    ]
  },
  method: {
    block: "Método",
    subtitle: "Como você entrega",
    questions: [
      { id: "services", label: "Quais serviços você oferece?", type: "multiselect", options: ["Projeto de interiores", "Projeto de reforma", "Projeto arquitetônico", "Consultoria de decoração", "Projeto online", "Acompanhamento de obra", "Projeto de iluminação", "Produção/styling"] },
      { id: "flagshipService", label: "Qual seu serviço 'carro-chefe'?", type: "text", placeholder: "Ex: Projeto de interiores completo" },
      { id: "process", label: "Como funciona seu processo de trabalho?", type: "textarea", placeholder: "Descreva as etapas..." },
      { id: "processDifferential", label: "O que torna seu processo único?", type: "textarea", placeholder: "O que você faz que os outros não fazem?" },
      { id: "deadline", label: "Qual o prazo médio de entrega?", type: "select", options: ["Até 7 dias", "1 a 2 semanas", "2 a 4 semanas", "1 a 2 meses", "Mais de 2 meses"] },
      { id: "technology", label: "Tecnologias que te diferenciam?", type: "multiselect", options: ["Render 3D realista", "Tour virtual", "Inteligência artificial", "Software de gestão", "App para clientes", "Templates próprios", "Nenhuma específica"] }
    ]
  },
  transformation: {
    block: "Transformação",
    subtitle: "O resultado que você entrega",
    questions: [
      { id: "result", label: "Qual resultado concreto seu cliente leva?", type: "textarea", placeholder: "Não o projeto em si, mas a transformação..." },
      { id: "feeling", label: "Como seu cliente se sente depois de trabalhar com você?", type: "textarea", placeholder: "Complete: 'Depois de trabalhar comigo, meu cliente sente...'" },
      { id: "referral", label: "O que seu cliente diria sobre você para um amigo?", type: "textarea", placeholder: "A frase que ele usaria ao te indicar..." }
    ]
  },
  vision: {
    block: "Visão",
    subtitle: "Onde você quer chegar",
    questions: [
      { id: "future", label: "Onde você quer estar daqui a 5 anos?", type: "textarea", placeholder: "Qual é sua ambição?" },
      { id: "success", label: "O que sucesso significa para você?", type: "multiselect", options: ["Faturamento alto", "Liberdade de tempo", "Reconhecimento", "Impacto na vida das pessoas", "Equipe estruturada", "Projetos de alto padrão", "Escala (muitos clientes)", "Ser referência na região"] },
      { id: "knownFor", label: "Se pudesse ser conhecido por UMA coisa, qual seria?", type: "text", placeholder: "Ex: O escritório que mais entende famílias" },
      { id: "frustrations", label: "O que te incomoda no mercado de arquitetura?", type: "textarea", placeholder: "O que está errado? O que te frustra?" },
      { id: "belief", label: "O que você acredita que nem todo mundo concorda?", type: "textarea", placeholder: "Uma bandeira, uma opinião forte..." },
      { id: "wouldChange", label: "Se pudesse mudar UMA coisa na forma como as pessoas veem arquitetura?", type: "textarea", placeholder: "Qual percepção você quer transformar?" }
    ]
  },
  synthesis: {
    block: "Síntese",
    subtitle: "Resumo final",
    questions: [
      { id: "forWho", label: "Meu escritório é para quem...", type: "text", placeholder: "Complete com uma frase curta" },
      { id: "notForWho", label: "Meu escritório NÃO é para quem...", type: "text", placeholder: "Complete com uma frase curta" },
      { id: "threeWords", label: "3 palavras que definem seu escritório:", type: "text", placeholder: "Ex: Acolhimento, Clareza, Funcionalidade" }
    ]
  }
};

export const DEFAULT_BRAND_ARCHITECTURE: BrandArchitecture = {
  identity: {
    name: '',
    timeInBusiness: '',
    city: '',
    serviceModel: '',
    origin: '',
    milestone: ''
  },
  essence: {
    existsFor: '',
    personality: [],
    differential: '',
    dontTransmit: []
  },
  audience: {
    idealClient: '',
    lifeMoments: [],
    painPoints: '',
    values: [],
    fears: [],
    dontWant: ''
  },
  method: {
    services: [],
    flagshipService: '',
    process: '',
    processDifferential: '',
    deadline: '',
    technology: []
  },
  transformation: {
    result: '',
    feeling: '',
    referral: ''
  },
  vision: {
    future: '',
    success: [],
    knownFor: '',
    frustrations: '',
    belief: '',
    wouldChange: ''
  },
  synthesis: {
    forWho: '',
    notForWho: '',
    threeWords: ''
  }
};
