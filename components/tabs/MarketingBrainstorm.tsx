
import React, { useState, useEffect } from 'react';
import { brainstormMarketingIdeasService } from '../../services/geminiService';
import { AppContext, BrainstormIdea, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { RocketLaunchIcon, ArrowDownTrayIcon } from '../icons/Icons';
import { downloadAsMarkdown } from '../../utils/fileUtils';

interface MarketingBrainstormProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const MarketingBrainstorm: React.FC<MarketingBrainstormProps> = ({ appContext, history }) => {
    const [topic, setTopic] = useState('');
    const [useGlobalContext, setUseGlobalContext] = useState(true);
    const [ideas, setIdeas] = useState<BrainstormIdea[] | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Clear results when active brand changes
    useEffect(() => {
        setIdeas(null);
        setSources([]);
    }, [appContext.activeBrandId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setIdeas(null);
        setSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandFoundation: null };
            const { data: result, sources: newSources } = await brainstormMarketingIdeasService(topic, contextForApi);
            setIdeas(result);
            setSources(newSources);
            appContext.addToHistory('brainstorm', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Brainstorm de Marca',
                summary: topic,
                inputs: { topic, useGlobalContext },
                result: { data: result, sources: newSources },
            });
        } catch (err) {
            setError('Falha ao gerar ideias. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setTopic(item.inputs.topic);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setIdeas(item.result.data);
        setSources(item.result.sources || []);
    };
    
    const handleSendToContentStudio = (idea: BrainstormIdea) => {
        appContext.setPrefillData('contentStudio', {
            topic: idea.description,
            type: 'Post para Blog' 
        });
    };
    
    const handleDownload = () => {
        if (!ideas) return;

        let content = `# Brainstorm de Marca para "${topic}"\n\n`;
        ideas.forEach((idea, index) => {
            content += `## Ideia ${index + 1}: ${idea.idea}\n`;
            content += `${idea.description}\n\n`;
        });

        downloadAsMarkdown(content, `brainstorm-${topic.replace(/\s+/g, '-').toLowerCase()}`);
    };


    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Brainstorm de Marca</h2>
                    <p className="text-neutral-400 mt-1">Gere ideias criativas para crescer sua marca pessoal.</p>
                </header>

                <Card className="max-w-2xl mx-auto">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                <div className="flex-grow">
                                    <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Tópico para Brainstorm
                                    </label>
                                    <input
                                        id="topic"
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: Como conseguir os primeiros clientes de mentoria"
                                        required
                                    />
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto flex-shrink-0">
                                    Gerar Ideias
                                </Button>
                            </div>
                            <div className="flex items-center mt-4">
                                <input
                                    id="useGlobalContextBrainstorm"
                                    type="checkbox"
                                    checked={useGlobalContext}
                                    onChange={(e) => setUseGlobalContext(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                />
                                <label htmlFor="useGlobalContextBrainstorm" className="ml-2 block text-sm text-neutral-300">
                                    Usar Contexto Global da Marca
                                </label>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 max-w-4xl mx-auto">
                    {isLoading && <div className="flex justify-center items-center h-full mt-8"><Spinner /></div>}
                    {error && <p className="text-red-400 mt-8 text-center">{error}</p>}
                    {ideas && (
                        <div className="space-y-4">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">5 Ideias Criativas para sua Marca</h3>
                                <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                    Baixar Ideias
                                </Button>
                            </div>
                            {ideas.map((idea, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6 flex items-start gap-4">
                                        <div className="flex-shrink-0 bg-blue-500/10 text-blue-400 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-neutral-100">{idea.idea}</h4>
                                            <p className="text-neutral-400 text-sm mt-1">{idea.description}</p>
                                        </div>
                                         <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => handleSendToContentStudio(idea)}
                                            icon={<RocketLaunchIcon className="w-4 h-4" />}
                                            title="Criar conteúdo com esta ideia"
                                        >
                                            <span className="hidden md:inline">Criar Conteúdo</span>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                             {sources.length > 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <Sources sources={sources} />
                                    </CardContent>
                                </Card>
                             )}
                        </div>
                    )}
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('brainstorm', id)}
                onClear={() => appContext.clearHistory('brainstorm')}
            />
        </div>
    );
};

export default MarketingBrainstorm;
