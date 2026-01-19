/**
 * CONFIGURAÇÃO CENTRALIZADA DE AMBIENTES
 * 
 * Define todos os ambientes disponíveis e seus itens base
 * para auto-preenchimento.
 */

import { ItemCategory } from "@/types/presentation";

// ============================================
// DEFINIÇÃO DE AMBIENTE
// ============================================

export interface EnvironmentDefinition {
  id: string;
  nome: string;
  icon?: string;  // Ícone lucide (para uso futuro)
  group?: 'social' | 'intimo' | 'servico';  // Agrupamento
}

export const ENVIRONMENTS: EnvironmentDefinition[] = [
  // Áreas Sociais
  { id: 'sala_estar', nome: 'Sala de Estar', group: 'social' },
  { id: 'sala_jantar', nome: 'Sala de Jantar', group: 'social' },
  { id: 'sala_estar_jantar', nome: 'Sala de Estar e Jantar', group: 'social' },
  { id: 'varanda', nome: 'Varanda', group: 'social' },
  
  // Áreas Íntimas
  { id: 'quarto_casal', nome: 'Quarto de Casal', group: 'intimo' },
  { id: 'quarto_solteiro', nome: 'Quarto de Solteiro', group: 'intimo' },
  { id: 'quarto_bebe', nome: 'Quarto de Bebê', group: 'intimo' },
  { id: 'quarto_infantil', nome: 'Quarto Infantil', group: 'intimo' },
  { id: 'closet', nome: 'Closet', group: 'intimo' },
  { id: 'home_office', nome: 'Home Office', group: 'intimo' },
  
  // Áreas de Serviço
  { id: 'cozinha', nome: 'Cozinha', group: 'servico' },
  { id: 'banheiro', nome: 'Banheiro', group: 'servico' },
  { id: 'lavabo', nome: 'Lavabo', group: 'servico' },
];

export type EnvironmentId = typeof ENVIRONMENTS[number]['id'];

// ============================================
// ITEM BASE
// ============================================

export interface BaseItem {
  nome: string;
  cat: ItemCategory;
  qtd?: number;  // Quantidade default (1 se não especificado)
}

// ============================================
// ITENS DE LAYOUT POR AMBIENTE
// ============================================

export const LAYOUT_ITEMS: Record<string, BaseItem[]> = {
  sala_estar: [
    { cat: 'mobiliario', nome: 'Sofá', qtd: 1 },
    { cat: 'mobiliario', nome: 'Poltrona', qtd: 2 },
    { cat: 'mobiliario', nome: 'Mesa de centro', qtd: 1 },
    { cat: 'mobiliario', nome: 'Mesa lateral', qtd: 2 },
    { cat: 'marcenaria', nome: 'Painel de TV', qtd: 1 },
    { cat: 'marcenaria', nome: 'Estante/Nichos', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo mesa de centro', qtd: 1 },
    { cat: 'iluminacao', nome: 'Pendente/Lustre', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots embutidos', qtd: 6 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina', qtd: 1 },
    { cat: 'decoracao', nome: 'Almofadas', qtd: 4 },
    { cat: 'decoracao', nome: 'Quadros', qtd: 2 },
  ],
  
  sala_jantar: [
    { cat: 'mobiliario', nome: 'Mesa de jantar', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cadeiras', qtd: 6 },
    { cat: 'mobiliario', nome: 'Buffet/Aparador', qtd: 1 },
    { cat: 'marcenaria', nome: 'Buffet sob medida', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo mesa de jantar', qtd: 1 },
    { cat: 'iluminacao', nome: 'Pendente sobre mesa', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 4 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Quadros', qtd: 2 },
  ],
  
  sala_estar_jantar: [
    { cat: 'mobiliario', nome: 'Sofá 3 lugares', qtd: 1 },
    { cat: 'mobiliario', nome: 'Poltrona', qtd: 1 },
    { cat: 'mobiliario', nome: 'Mesa de centro', qtd: 1 },
    { cat: 'mobiliario', nome: 'Mesa lateral', qtd: 2 },
    { cat: 'mobiliario', nome: 'Mesa de jantar', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cadeiras de jantar', qtd: 6 },
    { cat: 'mobiliario', nome: 'Aparador', qtd: 1 },
    { cat: 'marcenaria', nome: 'Painel de TV', qtd: 1 },
    { cat: 'marcenaria', nome: 'Estante', qtd: 1 },
    { cat: 'marcenaria', nome: 'Buffet', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo mesa jantar', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo aparador', qtd: 1 },
    { cat: 'iluminacao', nome: 'Pendente jantar', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 10 },
    { cat: 'iluminacao', nome: 'Luminária de piso', qtd: 1 },
    { cat: 'decoracao', nome: 'Tapete estar', qtd: 1 },
    { cat: 'decoracao', nome: 'Tapete jantar', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortinas', qtd: 2 },
    { cat: 'decoracao', nome: 'Almofadas', qtd: 6 },
    { cat: 'decoracao', nome: 'Quadros', qtd: 3 },
    { cat: 'decoracao', nome: 'Vasos/Plantas', qtd: 4 },
  ],
  
  quarto_casal: [
    { cat: 'mobiliario', nome: 'Cama casal', qtd: 1 },
    { cat: 'mobiliario', nome: 'Criado-mudo', qtd: 2 },
    { cat: 'mobiliario', nome: 'Cômoda', qtd: 1 },
    { cat: 'mobiliario', nome: 'Poltrona/Recamier', qtd: 1 },
    { cat: 'marcenaria', nome: 'Cabeceira', qtd: 1 },
    { cat: 'marcenaria', nome: 'Guarda-roupa', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo criado-mudo', qtd: 2 },
    { cat: 'iluminacao', nome: 'Pendentes cabeceira', qtd: 2 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 6 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina blackout', qtd: 1 },
    { cat: 'decoracao', nome: 'Almofadas', qtd: 4 },
    { cat: 'decoracao', nome: 'Manta', qtd: 1 },
  ],
  
  quarto_solteiro: [
    { cat: 'mobiliario', nome: 'Cama solteiro', qtd: 1 },
    { cat: 'mobiliario', nome: 'Criado-mudo', qtd: 1 },
    { cat: 'mobiliario', nome: 'Escrivaninha', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cadeira', qtd: 1 },
    { cat: 'marcenaria', nome: 'Cabeceira', qtd: 1 },
    { cat: 'marcenaria', nome: 'Guarda-roupa', qtd: 1 },
    { cat: 'marcenaria', nome: 'Prateleiras', qtd: 3 },
    { cat: 'iluminacao', nome: 'Pendente', qtd: 1 },
    { cat: 'iluminacao', nome: 'Luminária mesa', qtd: 1 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina', qtd: 1 },
  ],
  
  quarto_bebe: [
    { cat: 'mobiliario', nome: 'Berço', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cômoda com trocador', qtd: 1 },
    { cat: 'mobiliario', nome: 'Poltrona amamentação', qtd: 1 },
    { cat: 'mobiliario', nome: 'Pufe', qtd: 1 },
    { cat: 'mobiliario', nome: 'Mesa auxiliar', qtd: 1 },
    { cat: 'marcenaria', nome: 'Guarda-roupa bebê', qtd: 1 },
    { cat: 'marcenaria', nome: 'Nichos decorativos', qtd: 4 },
    { cat: 'marcenaria', nome: 'Prateleiras', qtd: 2 },
    { cat: 'marcenaria', nome: 'Painel decorativo', qtd: 1 },
    { cat: 'marmoraria', nome: 'Tampo cômoda', qtd: 1 },
    { cat: 'iluminacao', nome: 'Lustre infantil', qtd: 1 },
    { cat: 'iluminacao', nome: 'Luminária mesa', qtd: 1 },
    { cat: 'iluminacao', nome: 'Luz noturna', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots dimmerizáveis', qtd: 4 },
    { cat: 'decoracao', nome: 'Tapete infantil', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina blackout', qtd: 1 },
    { cat: 'decoracao', nome: 'Mobile berço', qtd: 1 },
    { cat: 'decoracao', nome: 'Kit berço', qtd: 1 },
    { cat: 'decoracao', nome: 'Quadros infantis', qtd: 3 },
    { cat: 'decoracao', nome: 'Adesivos parede', qtd: 1 },
    { cat: 'decoracao', nome: 'Almofadas', qtd: 3 },
    { cat: 'decoracao', nome: 'Cestos organizadores', qtd: 2 },
  ],
  
  quarto_infantil: [
    { cat: 'mobiliario', nome: 'Cama infantil', qtd: 1 },
    { cat: 'mobiliario', nome: 'Criado-mudo', qtd: 1 },
    { cat: 'mobiliario', nome: 'Escrivaninha', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cadeira', qtd: 1 },
    { cat: 'mobiliario', nome: 'Baú de brinquedos', qtd: 1 },
    { cat: 'marcenaria', nome: 'Guarda-roupa', qtd: 1 },
    { cat: 'marcenaria', nome: 'Nichos', qtd: 4 },
    { cat: 'marcenaria', nome: 'Prateleiras', qtd: 3 },
    { cat: 'marcenaria', nome: 'Bancada estudo', qtd: 1 },
    { cat: 'iluminacao', nome: 'Lustre temático', qtd: 1 },
    { cat: 'iluminacao', nome: 'Luminária mesa', qtd: 1 },
    { cat: 'iluminacao', nome: 'Luz noturna', qtd: 1 },
    { cat: 'decoracao', nome: 'Tapete infantil', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina temática', qtd: 1 },
    { cat: 'decoracao', nome: 'Quadros/Posters', qtd: 3 },
    { cat: 'decoracao', nome: 'Adesivos parede', qtd: 1 },
  ],
  
  cozinha: [
    { cat: 'mobiliario', nome: 'Banquetas', qtd: 3 },
    { cat: 'marcenaria', nome: 'Armários superiores', qtd: 1 },
    { cat: 'marcenaria', nome: 'Armários inferiores', qtd: 1 },
    { cat: 'marcenaria', nome: 'Despenseiro', qtd: 1 },
    { cat: 'marcenaria', nome: 'Ilha (se houver)', qtd: 1 },
    { cat: 'marmoraria', nome: 'Bancada', qtd: 1 },
    { cat: 'marmoraria', nome: 'Frontão', qtd: 1 },
    { cat: 'iluminacao', nome: 'Pendentes', qtd: 2 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 6 },
    { cat: 'iluminacao', nome: 'Fita LED', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina/Persiana', qtd: 1 },
    { cat: 'decoracao', nome: 'Plantas', qtd: 2 },
  ],
  
  banheiro: [
    { cat: 'marcenaria', nome: 'Gabinete', qtd: 1 },
    { cat: 'marcenaria', nome: 'Armário aéreo', qtd: 1 },
    { cat: 'marcenaria', nome: 'Nichos box', qtd: 2 },
    { cat: 'marmoraria', nome: 'Bancada', qtd: 1 },
    { cat: 'marmoraria', nome: 'Soleira box', qtd: 1 },
    { cat: 'iluminacao', nome: 'Arandelas espelho', qtd: 2 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 4 },
    { cat: 'decoracao', nome: 'Espelho', qtd: 1 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
  ],
  
  lavabo: [
    { cat: 'marcenaria', nome: 'Gabinete', qtd: 1 },
    { cat: 'marmoraria', nome: 'Bancada', qtd: 1 },
    { cat: 'iluminacao', nome: 'Pendente/Arandela', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 2 },
    { cat: 'decoracao', nome: 'Espelho', qtd: 1 },
    { cat: 'decoracao', nome: 'Papel de parede', qtd: 1 },
  ],
  
  home_office: [
    { cat: 'mobiliario', nome: 'Mesa/Escrivaninha', qtd: 1 },
    { cat: 'mobiliario', nome: 'Cadeira escritório', qtd: 1 },
    { cat: 'mobiliario', nome: 'Estante', qtd: 1 },
    { cat: 'marcenaria', nome: 'Bancada', qtd: 1 },
    { cat: 'marcenaria', nome: 'Prateleiras', qtd: 3 },
    { cat: 'iluminacao', nome: 'Luminária mesa', qtd: 1 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 4 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Cortina', qtd: 1 },
    { cat: 'decoracao', nome: 'Quadros', qtd: 2 },
    { cat: 'decoracao', nome: 'Plantas', qtd: 2 },
  ],
  
  varanda: [
    { cat: 'mobiliario', nome: 'Sofá/Namoradeira', qtd: 1 },
    { cat: 'mobiliario', nome: 'Poltronas', qtd: 2 },
    { cat: 'mobiliario', nome: 'Mesa de centro', qtd: 1 },
    { cat: 'marcenaria', nome: 'Floreira', qtd: 2 },
    { cat: 'iluminacao', nome: 'Pendente', qtd: 1 },
    { cat: 'iluminacao', nome: 'Arandelas', qtd: 2 },
    { cat: 'decoracao', nome: 'Tapete externo', qtd: 1 },
    { cat: 'decoracao', nome: 'Almofadas', qtd: 4 },
    { cat: 'decoracao', nome: 'Plantas/Vasos', qtd: 5 },
  ],
  
  closet: [
    { cat: 'mobiliario', nome: 'Pufe/Banco', qtd: 1 },
    { cat: 'marcenaria', nome: 'Módulos closet', qtd: 1 },
    { cat: 'marcenaria', nome: 'Gaveteiros', qtd: 2 },
    { cat: 'marcenaria', nome: 'Prateleiras', qtd: 6 },
    { cat: 'marcenaria', nome: 'Araras', qtd: 4 },
    { cat: 'iluminacao', nome: 'Spots', qtd: 6 },
    { cat: 'iluminacao', nome: 'Fita LED', qtd: 4 },
    { cat: 'decoracao', nome: 'Tapete', qtd: 1 },
    { cat: 'decoracao', nome: 'Espelho corpo inteiro', qtd: 1 },
  ],
};

// ============================================
// ITENS COMPLEMENTARES POR AMBIENTE
// ============================================

export const COMPLEMENTARY_ITEMS: Record<string, BaseItem[]> = {
  sala_estar: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortinas' },
  ],
  
  sala_jantar: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto pendente' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
  ],
  
  sala_estar_jantar: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'materiais', nome: 'Papel de parede (se houver)' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'iluminacao', nome: 'Instalação fita LED' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'maoDeObra', nome: 'Instalação marmoraria' },
    { cat: 'acabamentos', nome: 'Instalação cortinas' },
  ],
  
  quarto_casal: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortina blackout' },
  ],
  
  quarto_solteiro: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortina' },
  ],
  
  quarto_bebe: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Papel de parede temático' },
    { cat: 'materiais', nome: 'Piso vinílico/laminado' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Tomadas com proteção' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'eletrica', nome: 'Dimmer iluminação' },
    { cat: 'iluminacao', nome: 'Instalação luminárias dimmerizáveis' },
    { cat: 'maoDeObra', nome: 'Montagem berço' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortina blackout' },
    { cat: 'acabamentos', nome: 'Aplicação adesivos' },
    { cat: 'outros', nome: 'Protetores de quina' },
  ],
  
  quarto_infantil: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Papel de parede temático' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortina' },
    { cat: 'acabamentos', nome: 'Aplicação adesivos' },
  ],
  
  cozinha: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Revestimento paredes' },
    { cat: 'materiais', nome: 'Piso' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Ponto coifa' },
    { cat: 'hidraulica', nome: 'Ponto água' },
    { cat: 'hidraulica', nome: 'Ponto esgoto' },
    { cat: 'hidraulica', nome: 'Ponto gás' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'maoDeObra', nome: 'Instalação marmoraria' },
    { cat: 'maoDeObra', nome: 'Instalação eletros' },
  ],
  
  banheiro: [
    { cat: 'materiais', nome: 'Revestimento paredes' },
    { cat: 'materiais', nome: 'Piso' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'hidraulica', nome: 'Pontos água' },
    { cat: 'hidraulica', nome: 'Ponto esgoto' },
    { cat: 'hidraulica', nome: 'Instalação louças' },
    { cat: 'hidraulica', nome: 'Instalação metais' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'maoDeObra', nome: 'Instalação marmoraria' },
    { cat: 'maoDeObra', nome: 'Instalação box' },
    { cat: 'acabamentos', nome: 'Instalação espelho' },
  ],
  
  lavabo: [
    { cat: 'materiais', nome: 'Revestimento/Papel parede' },
    { cat: 'materiais', nome: 'Piso' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'hidraulica', nome: 'Ponto água' },
    { cat: 'hidraulica', nome: 'Ponto esgoto' },
    { cat: 'hidraulica', nome: 'Instalação louças' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'maoDeObra', nome: 'Instalação marmoraria' },
  ],
  
  home_office: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'eletrica', nome: 'Pontos rede/internet' },
    { cat: 'eletrica', nome: 'Ponto ar condicionado' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação cortina' },
  ],
  
  varanda: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Piso externo' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'iluminacao', nome: 'Instalação luminárias' },
    { cat: 'maoDeObra', nome: 'Montagem móveis' },
    { cat: 'outros', nome: 'Paisagismo' },
  ],
  
  closet: [
    { cat: 'materiais', nome: 'Pintura paredes' },
    { cat: 'materiais', nome: 'Rodapé' },
    { cat: 'eletrica', nome: 'Pontos elétricos' },
    { cat: 'iluminacao', nome: 'Instalação spots' },
    { cat: 'iluminacao', nome: 'Instalação fita LED' },
    { cat: 'maoDeObra', nome: 'Instalação marcenaria' },
    { cat: 'acabamentos', nome: 'Instalação espelhos' },
  ],
};

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Obtém ambiente por ID
 */
export const getEnvironmentById = (id: string): EnvironmentDefinition | undefined => {
  return ENVIRONMENTS.find(env => env.id === id);
};

/**
 * Obtém nome do ambiente por ID
 */
export const getEnvironmentName = (id: string): string => {
  return getEnvironmentById(id)?.nome || id;
};

/**
 * Obtém itens de layout para um ambiente
 */
export const getLayoutItemsForEnvironment = (envId: string): BaseItem[] => {
  return LAYOUT_ITEMS[envId] || [];
};

/**
 * Obtém itens complementares para um ambiente
 */
export const getComplementaryItemsForEnvironment = (envId: string): BaseItem[] => {
  return COMPLEMENTARY_ITEMS[envId] || [];
};

/**
 * Agrupa ambientes por tipo
 */
export const getEnvironmentsByGroup = (): Record<string, EnvironmentDefinition[]> => {
  return ENVIRONMENTS.reduce((acc, env) => {
    const group = env.group || 'outros';
    if (!acc[group]) acc[group] = [];
    acc[group].push(env);
    return acc;
  }, {} as Record<string, EnvironmentDefinition[]>);
};
