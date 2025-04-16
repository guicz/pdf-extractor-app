import { useState, useEffect, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';
import { marked } from 'marked';

interface MarkdownEditorProps {
  content: string;
  onSave?: (content: string) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  title?: string;
}

export function MarkdownEditor({
  content,
  onSave,
  readOnly = false,
  className = '',
  title = 'Resultados da Análise'
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(content);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>(readOnly ? 'preview' : 'edit');
  const [isEdited, setIsEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMarkdown(content);
    setIsEdited(false);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setIsEdited(e.target.value !== content);
  };

  const handleSave = async () => {
    if (!onSave || !isEdited) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onSave(markdown);
      setIsEdited(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Falha ao salvar alterações';
      setError(errorMessage);
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMarkdown = () => {
    try {
      return { __html: marked(markdown) };
    } catch (err) {
      console.error('Markdown rendering error:', err);
      return { __html: '<p class="text-error">Erro ao renderizar o markdown</p>' };
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSave && isEdited && !isSaving) {
        handleSave();
      }
    }
  };

  return (
    <Card 
      title={
        <div className="flex items-center justify-between w-full">
          <h3>{title}</h3>
          {!readOnly && activeTab === 'edit' && isEdited && (
            <Button 
              variant="primary" 
              size="xs"
              isLoading={isSaving}
              onClick={handleSave}
            >
              Salvar Alterações
            </Button>
          )}
        </div>
      }
      className={`${className} h-full flex flex-col`}
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="tabs tabs-bordered">
        {!readOnly && (
          <button
            className={`tab ${activeTab === 'edit' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Editar
          </button>
        )}
        <button
          className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Visualizar
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto mt-2">
        {activeTab === 'edit' ? (
          <textarea
            ref={textareaRef}
            className="textarea w-full h-full min-h-[300px] font-mono text-sm"
            value={markdown}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={readOnly || isSaving}
            placeholder="Digite o conteúdo em markdown aqui..."
          />
        ) : (
          <div 
            className="prose max-w-none p-4 bg-base-200 rounded-lg h-full overflow-auto"
            dangerouslySetInnerHTML={renderMarkdown()}
          />
        )}
      </div>

      {/* Footer with helpful information */}
      <div className="mt-4 text-xs text-base-content/70 flex justify-between items-center">
        <span>
          {!readOnly && 
            (isEdited 
              ? "Você tem alterações não salvas" 
              : "Nenhuma alteração para salvar")}
        </span>
        {!readOnly && (
          <span>Pressione Ctrl+S ou Cmd+S para salvar</span>
        )}
      </div>
    </Card>
  );
} 