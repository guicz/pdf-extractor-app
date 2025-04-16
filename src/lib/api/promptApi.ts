import { Prompt } from '@/lib/types';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: '/api',
});

// Prompts predefinidos traduzidos para português
const PRESET_PROMPTS: Prompt[] = [
  {
    id: 'preset-summary',
    name: 'Matrículas imobiliárias',
    content: `Extraia da matrícula imobiliária as seguintes informações:
- Nome e município do cartório de registro de imóveis
- Número da matrícula
- Descrição completa do imóvel (com averbações e registros relacionados à garantia)
- Situação quanto a outras garantias
- Existência de averbações impeditivas de alienação
- Nome(s) do(s) proprietário(s)
- Destaque se há hipoteca, alienação ou qualquer outro gravame/ônus

Organize o resultado como um relatório em markdown, usando títulos, subtítulos e listas, para facilitar a leitura e interpretação humana. Não utilize JSON ou tabelas em formato de código.`,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-technical',
    name: 'Análise contábil',
    content: `Analise o(s) documento(s) contábil(is) fornecido(s), que podem incluir:
- DRE (Demonstração do Resultado do Exercício)
- Balanço Patrimonial
- Demonstração de Fluxo de Caixa
- Relatórios de conciliação contábil
- Balancetes, razão e livros auxiliares

A partir do conteúdo, extraia e interprete:
- Identificação do tipo de documento
- Período abrangido
- Resumo dos principais valores
- Receita bruta
- Lucro/Prejuízo líquido
- Custos e despesas operacionais
- Total de ativos e passivos
- Fluxo de caixa (operacional, investimento, financiamento)
- Indicadores financeiros chave (margem de lucro, endividamento, liquidez, etc.)
- Pontos críticos ou irregulares detectados
- Sugestões ou recomendações contábeis ou gerenciais

Retorne a análise em markdown, com títulos, listas e tabelas (markdown), organizando as informações de forma clara e legível para humanos. Não utilize JSON.`,
    isPreset: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-legal',
    name: 'Análise Produtividade Rural',
    content: `Analise o laudo de produtividade rural fornecido, identificando:
- Cultura agrícola
- Área plantada
- Produtividade estimada/realizada (sacas/hectare)
- Valor da saca
- Receita bruta
- Custo por hectare
- Rentabilidade
- Outros dados relevantes
- Inconsistências ou valores fora do padrão

Gere um relatório técnico detalhado em markdown, com títulos, subtítulos, listas e tabelas, apresentando conclusão final e interpretação gerencial e técnica dos dados. Não utilize JSON.`,
    isPreset: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'preset-data',
    name: 'Extração de Dados',
    content: `Extraia todos os dados numéricos, estatísticas e tabelas deste documento.
Organize as informações em markdown, usando listas e tabelas (em markdown), para facilitar a leitura e exportação. Não utilize JSON.`,
    isPreset: true,
    createdAt: new Date().toISOString()
  }
];

export async function listPrompts(): Promise<Prompt[]> {
  try {
    const response = await api.get('/prompts');
    
    if (response.data.success) {
      // Combine preset prompts with user prompts
      const userPrompts = response.data.prompts || [];
      return [...PRESET_PROMPTS, ...userPrompts];
    } else {
      console.error('Failed to list prompts:', response.data.error);
      // Return only preset prompts if API call fails
      return PRESET_PROMPTS;
    }
  } catch (error) {
    console.error('Error listing prompts:', error);
    // Return only preset prompts if API call fails
    return PRESET_PROMPTS;
  }
}

export async function createPrompt(name: string, content: string): Promise<Prompt> {
  try {
    const response = await api.post('/prompts', {
      name,
      content
    });
    
    if (response.data.success) {
      return response.data.prompt;
    } else {
      throw new Error(response.data.error || 'Failed to create prompt');
    }
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

export async function updatePrompt(id: string, name: string, content: string): Promise<Prompt> {
  try {
    const response = await api.put(`/prompts/${id}`, {
      name,
      content
    });
    
    if (response.data.success) {
      return response.data.prompt;
    } else {
      throw new Error(response.data.error || 'Failed to update prompt');
    }
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

export async function deletePrompt(id: string): Promise<void> {
  try {
    const response = await api.delete(`/prompts/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete prompt');
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
} 