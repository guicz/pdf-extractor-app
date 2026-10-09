/**
 * Environment variables and configuration
 * These settings control API connectivity and environment-specific features
 */

// PDF Extractor API Configuration
export const PDF_EXTRACTOR_CONFIG = {
  // Use the same port as in ecosystem.config.js
  API_URL: process.env.PDF_EXTRACTOR_API_URL || 'http://localhost:56002',
  PROXY_API_URL: '/api/proxy',
  // Configurable options
  EXTRACTION_TIMEOUT: 60000, // 60 seconds
  MAX_FILE_SIZE: 32 * 1024 * 1024, // 32MB
  MAX_PAGES: 100, // 100 páginas por requisição
  SUPPORTED_FILE_TYPES: ['application/pdf'],
};

// LLM Models Configuration
export const LLM_MODELS = {
  CLAUDE_SONNET: 'claude-3-7-sonnet-20250219',
  OPENAI_O3_MINI: 'o3-mini'
};

// Application defaults
export const APP_DEFAULTS = {
  DEFAULT_LLM_MODEL: 'claude-3-7-sonnet-20250219'
};

// Modelos LLM disponíveis para análise
export const APP_CONFIG = {
  // Base URL for the application
  APP_URL: 'http://localhost:55000',
  
  // Session cookie name
  SESSION_COOKIE_NAME: 'sessionId',
  
  // Session duration (in days)
  SESSION_DURATION: 7,
  
  // Max file upload size
  MAX_UPLOAD_SIZE_MB: 32,
  
  // Supported file types
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/msword', // doc
  ],
  
  // Modelos LLM disponíveis para análise
  AVAILABLE_MODELS: [
    { id: 'claude-3-7-sonnet-20250219', name: 'Claude Sonnet 3.7', description: 'Mais indicado para análise detalhada de documentos complexos. Desenvolvido pela Anthropic.' },
    { id: 'o3-mini', name: 'OpenAI o3-mini', description: 'Mais rápido, ideal para análises simples e documentos curtos. Desenvolvido pela OpenAI.' },
  ],
};