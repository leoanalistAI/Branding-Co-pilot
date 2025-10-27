import * as React from 'react';
import { generateSeoAnalysisService } from '../../services/geminiService';
import { AppContext, SeoAnalysisResult, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon } from '../icons/Icons';

interface SeoAssistantProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const SeoAssistant: React.FC<SeoAssistantProps> = ({ appContext, history }) => {
    const [topic, setTopic] = React.useState('');
    const [useGlobalContext, setUseGlobalContext] = React.useState(true);
    const [result, setResult] = React.useState<SeoAnalysisResult | null>(null);
    const [sources, setSources] = React.useState<Source[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Clear results when active brand changes
    React.useEffect(() => {
        setResult(null);
        setSources([]);
    }, [appContext.activeBrandId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandFoundation: null };
            const { data, sources: newSources } = await generateSeoAnalysisService(topic, contextForApi);
            setResult(data);
            setSources(newSources);
            appContext.addToHistory('seo', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise SEO',
                summary: topic,
                inputs: { topic, useGlobalContext },
                result: { data, sources: newSources },
            });
        } catch (err) {
            setError('Falha ao analisar o tópico. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setTopic(item.inputs.topic);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result.data);
        setSources(item.result.sources || []);
    };
    
    const handleDownload = () => {
        if (!result) return;
        
        let content = `# Análise de SEO para "${topic}"\n\n`;
        content += `## Palavras-chave Primárias\n- ${result.primaryKeywords.join('\n- ')}\n\n`;
        content += `## Palavras-chave Secundárias\n- ${result.secondaryKeywords.join('\n- ')}\n\n`;
        content += `## Perguntas Comuns (People Also Ask)\n- ${result.commonQuestions.join('\n- ')}\n\n`;
        content += `---\n\n`;
        content += `## Estrutura de Post Sugerida\n\n`;
        content += `### Título\n${result.suggestedStructure.title}\n\n`;
        content += `### Introdução\n${result.suggestedStructure.introduction}\n\n`;
        content += `### Seções\n- ${result.suggestedStructure.sections.join('\n- ')}\n\n`;
        content += `### Conclusão\n${result.suggestedStructure.conclusion}\n`;
        
        downloadAsMarkdown(content, `analise-seo-${topic.replace(/\s+/g, '-').toLowerCase()}`);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Assistente de SEO Pessoal</h2>
                    <p className="text-neutral-400 mt-1">Otimize seu conteúdo para ser encontrado por sua expertise.</p>
                </header>

                <Card className="max-w-2xl mx-auto">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                <div className="flex-grow">
                                    <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico ou Palavra-chave</label>
                                    <input
                                        id="topic"
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: Como criar uma marca pessoal no LinkedIn"
                                        required
                                    />
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto flex-shrink-0">Analisar Tópico</Button>
                            </div>
                            <div className="flex items-center mt-4">
                                <input
                                    id="useGlobalContextSeo"
                                    type="checkbox"
                                    checked={useGlobalContext}
                                    onChange={(e) => setUseGlobalContext(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                />
                                <label htmlFor="useGlobalContextSeo" className="ml-2 block text-sm text-neutral-300">Usar Contexto Global da Marca</label>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 max-w-4xl mx-auto">
                    {isLoading && <div className="flex justify-center items-center h-full mt-8"><Spinner /></div>}
                    {error && <p className="text-red-400 mt-8 text-center">{error}</p>}
                    {result && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Resultados da Análise</h3>
                                <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                    Baixar Análise
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold text-blue-400 mb-2">Palavras-chave Primárias</h4>
                                        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                            {result.primaryKeywords.map((kw, i) => <li key={i}>{kw}</li>)}
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold text-blue-400 mb-2">Palavras-chave Secundárias</h4>
                                        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                            {result.secondaryKeywords.map((kw, i) => <li key={i}>{kw}</li>)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                             <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-blue-400 mb-2">Perguntas Comuns (People Also Ask)</h4>
                                    <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                        {result.commonQuestions.map((q, i) => <li key={i}>{q}</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <h4 className="font-semibold text-blue-400 mb-2">Estrutura de Post Sugerida</h4>
                                    <div className="space-y-3 text-sm">
                                        <p><strong>Título:</strong> {result.suggestedStructure.title}</p>
                                        <p><strong>Introdução:</strong> {result.suggestedStructure.introduction}</p>
                                        <div>
                                            <strong>Seções:</strong>
                                            <ul className="list-decimal list-inside text-neutral-300 space-y-1 mt-1">
                                                {result.suggestedStructure.sections.map((s, i) => <li key={i}>{s}</li>)}
                                            </ul>
                                        </div>
                                        <p><strong>Conclusão:</strong> {result.suggestedStructure.conclusion}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Sources sources={sources} />
                        </div>
                    )}
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('seo', id)}
                onClear={() => appContext.clearHistory('seo')}
            />
        </div>
    );
};

export default SeoAssistant;