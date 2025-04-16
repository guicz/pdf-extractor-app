import { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { Prompt } from '@/lib/types';
import { listPrompts } from '@/lib/api/promptApi';

interface PromptSelectorProps {
  onSelect: (prompt: Prompt) => void;
  selectedPromptId?: string;
  className?: string;
}

export function PromptSelector({
  onSelect,
  selectedPromptId,
  className = '',
}: PromptSelectorProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const promptsList = await listPrompts();
      setPrompts(promptsList);
    } catch (err) {
      console.error('Failed to load prompts:', err);
      setError('Falha ao carregar prompts. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Selecione um Prompt" className={className}>
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
          <Button variant="ghost" size="xs" onClick={loadPrompts}>
            Tentar Novamente
          </Button>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : prompts.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-base-content/70 mb-2">Nenhum prompt disponível</p>
          <p className="text-sm">Crie um novo prompt para começar</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.href = '/prompts/new'}
          >
            Criar Prompt
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                className={`p-3 text-left rounded-lg border hover:bg-base-200 transition-colors ${
                  selectedPromptId === prompt.id
                    ? 'bg-base-200 border-primary'
                    : 'border-base-300'
                }`}
                onClick={() => onSelect(prompt)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{prompt.name}</h3>
                  <span className="badge badge-sm">
                    {prompt.isPreset ? 'Padrão' : 'Personalizada'}
                  </span>
                </div>
                <p className="text-sm text-base-content/70 mt-1 line-clamp-2">
                  {prompt.content.substring(0, 100)}
                  {prompt.content.length > 100 ? '...' : ''}
                </p>
              </button>
            ))}
          </div>
          
          <div className="pt-2 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/prompts'}
            >
              Gerenciar Prompts
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
} 