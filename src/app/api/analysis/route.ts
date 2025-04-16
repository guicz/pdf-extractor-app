import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readFile, mkdir, writeFile } from 'fs/promises';
import axios from 'axios';
import OpenAI from "openai";
import { Anthropic } from "@anthropic-ai/sdk";

// Define upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

// Define analysis directory
const ANALYSIS_DIR = path.join(process.cwd(), 'data', 'analysis');

// Utilidades para chamadas reais às APIs da Anthropic e OpenAI
async function analyzeWithAnthropic(content: string, prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-20250219';
  if (!apiKey) throw new Error('Anthropic API key not configured');
  console.log('[Anthropic] Chamando modelo:', model);
  console.log('[Anthropic] Prompt:', prompt);
  console.log('[Anthropic] Content:', content.slice(0, 300));
  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model,
      max_tokens: 8192,
      messages: [
        { role: 'user', content: `${prompt}\n\n${content}` }
      ]
    });
    console.log('[Anthropic] Resposta bruta:', JSON.stringify(response));
    const block = response.content?.[0];
    if (block && 'text' in block) {
      return block.text;
    }
    return JSON.stringify(response);
  } catch (err) {
    console.error('[Anthropic] ERRO:', err && err.response ? err.response.data : err);
    throw err;
  }
}

async function analyzeWithOpenAI(content: string, prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'o3-mini';
  if (!apiKey) throw new Error('OpenAI API key not configured');
  console.log('[OpenAI] Chamando modelo:', model);
  console.log('[OpenAI] Prompt:', prompt);
  console.log('[OpenAI] Content:', content.slice(0, 300));
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content },
        ],
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`[OpenAI] Erro HTTP ${response.status}: ${errorText}`);
    }
    const completion = await response.json();
    console.log('[OpenAI] Resposta bruta:', JSON.stringify(completion));
    return completion.choices?.[0]?.message?.content || JSON.stringify(completion);
  } catch (err) {
    console.error('[OpenAI] ERRO:', err);
    throw err;
  }
}

// Função auxiliar para aceitar qualquer nome de modelo (sem restrição)
function normalizeModelName(model: string) {
  return model || '';
}

// Ensure the directory exists
async function ensureAnalysisDir() {
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
  }
  return ANALYSIS_DIR;
}

// Dummy model endpoint function (replace with real API endpoints)
async function analyzeWithModel(model: string, content: string, prompt: string) {
  // This is a placeholder - in a real implementation, you would call the actual API endpoints
  // For now, we'll simulate different responses based on the model
  
  let responseText = '';
  
  try {
    if (model === 'claude-3-7-sonnet-20250219') {
      // Simulate Claude Sonnet 3.7 API call
      // In a real implementation, you would use the appropriate API client
      responseText = `Claude Sonnet 3.7 Analysis:\n\n${prompt}\n\nAnalysis of the provided content:\n${content.substring(0, 200)}...\n\nThis is a simulated response. In production, this would call the Claude API.`;
    } else if (model === 'o3-mini') {
      // Simulate OpenAI o3-mini API call
      responseText = `OpenAI o3-mini Analysis:\n\n${prompt}\n\nAnalysis of the provided content:\n${content.substring(0, 200)}...\n\nThis is a simulated response. In production, this would call the OpenAI API.`;
    } else {
      throw new Error(`Unsupported model: ${model}`);
    }
    
    return responseText;
  } catch (error) {
    console.error(`Error analyzing with ${model}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  await ensureAnalysisDir();
  try {
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      console.error('[API] Sessão não encontrada no cookie');
      return NextResponse.json(
        { success: false, error: 'Nenhuma sessão encontrada. Faça login novamente.' },
        { status: 400 }
      );
    }
    // Parse request body
    const { extractionId, promptId, model } = await request.json();
    if (!extractionId || !model) {
      console.error('[API] Campos obrigatórios faltando', { extractionId, model });
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios faltando: extractionId ou model.' },
        { status: 400 }
      );
    }
    // Normaliza modelo
    const normalizedModel = normalizeModelName(model);
    // Gera ID único
    const analysisId = uuidv4();
    // Cria resultado inicial
    const analysisResult = {
      id: analysisId,
      extractionId,
      promptId,
      model: normalizedModel,
      content: 'Analysis in progress...',
      analyzedAt: new Date().toISOString(),
      sessionId,
    };
    console.log('[API] Criando análise inicial:', analysisResult);
    // Salva análise inicial
    const analysisPath = path.join(ANALYSIS_DIR, `${analysisId}.json`);
    await writeFile(analysisPath, JSON.stringify(analysisResult, null, 2));
    console.log('[API] Análise inicial salva em:', analysisPath);
    // Processamento assíncrono
    setTimeout(async () => {
      try {
        console.log('[API] Iniciando processamento assíncrono da análise:', analysisId);
        const extractionRaw = await readFile(path.join(process.cwd(), 'data', 'extractions', sessionId, `${extractionId}.json`), 'utf-8');
        console.log('[API] Conteúdo bruto da extração:', extractionRaw.slice(0, 500));
        const extractionData = JSON.parse(extractionRaw);
        // Lê prompt customizado se houver
        let promptContent = 'Extraia o conteúdo completo do documento, sem abreviações nem placeholders. O conteúdo precisa ser COMPLETO IPSIS LITTERIS.';
        if (promptId) {
          try {
            const promptPath = path.join(process.cwd(), 'data', 'prompts', sessionId, `${promptId}.json`);
            if (fs.existsSync(promptPath)) {
              const promptDataRaw = await readFile(promptPath, 'utf-8');
              console.log('[API] Prompt customizado bruto:', promptDataRaw);
              const promptData = JSON.parse(promptDataRaw);
              promptContent = promptData.content;
            }
          } catch (error) {
            console.error('[API] Erro ao ler prompt customizado:', error);
          }
        }
        let analysisContent = '';
        if (normalizedModel === 'claude-3-7-sonnet-20250219') {
          analysisContent = await analyzeWithAnthropic(extractionData.content, promptContent);
        } else if (normalizedModel === 'o3-mini') {
          analysisContent = await analyzeWithOpenAI(extractionData.content, promptContent);
        } else {
          analysisContent = `Modelo não suportado: ${normalizedModel}`;
        }
        const updatedAnalysis = {
          ...analysisResult,
          content: analysisContent,
          status: 'completed',
          completedAt: new Date().toISOString(),
        };
        await writeFile(analysisPath, JSON.stringify(updatedAnalysis, null, 2));
        console.log(`[API] Análise concluída para ${analysisId}`);
      } catch (error) {
        console.error('[API] Erro no processamento da análise:', error);
      }
    }, 3000);
    // Resposta imediata
    return NextResponse.json({
      success: true,
      analysisResult,
    });
  } catch (error) {
    console.error('[API] Erro ao criar análise:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar análise.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get sessionId from cookie
    const sessionId = request.cookies.get('sessionId')?.value;
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 400 }
      );
    }
    // Get analysis ID from query params
    const analysisId = new URL(request.url).searchParams.get('id');
    if (!analysisId) {
      return NextResponse.json(
        { success: false, error: 'No analysis ID provided' },
        { status: 400 }
      );
    }
    // Path to session directory
    const sessionDir = path.join(UPLOAD_DIR, sessionId);
    // Check if directory exists
    if (!fs.existsSync(sessionDir)) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    // Path to analysis file
    const analysisPath = path.join(ANALYSIS_DIR, `${analysisId}.json`);
    // Check if analysis exists
    if (!fs.existsSync(analysisPath)) {
      return NextResponse.json(
        { success: false, error: 'Analysis result not found' },
        { status: 404 }
      );
    }
    // Read analysis result
    const content = await readFile(analysisPath, 'utf-8');
    const analysisResult = JSON.parse(content);
    return NextResponse.json({ 
      success: true, 
      analysisResult 
    });
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analysis result' },
      { status: 500 }
    );
  }
} 