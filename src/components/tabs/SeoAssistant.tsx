import React, { useState, useEffect } from 'react';
import { generateSeoKeywordsService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { KeyIcon, QuestionMarkCircleIcon } from '../icons/Icons';

const SeoAssistant: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [topic, setTopic] = useState('');
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('seo');

    useEffect(() => {
        setResult(null);
        setError(null);
        setTopic('');
        setActiveHistoryId(null);
    }, [activeBrandId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSources([]);
        setActiveHistoryId(null);

        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data, sources: apiSources } = await generateSeoKeywordsService(topic, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'SEO Pessoal',
                summary: `Keywords para ${topic.substring(0, 25)}...`,
                inputs: { topic, useGlobalContext },
                result: { keywords: data, sources: apiSources },
            };
            addToHistory('seo', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao gerar palavras-chave. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setTopic(item.inputs.topic);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.keywords);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">SEO Pessoal</h2>
                    <p className="text-neutral-400 mt-1">Analise tópicos para encontrar palavras-chave e otimizar seu conteúdo.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analisador de Tópicos</CardTitle>
                                <CardDescription>Insira um tópico para encontrar palavras-chave e perguntas relacionadas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico</label>
                                        <input
                                            id="topic"
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="Ex: Marketing de conteúdo para freelancers"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextSeo"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextSeo" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Analisar Tópico</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resultados de SEO</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><KeyIcon className="w-5 h-5" /> Palavras-chave de Cauda Longa</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.longTailKeywords.map((kw: string, index: number) => <li key={index}>{kw}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><QuestionMarkCircleIcon className="w-5 h-5" /> Perguntas Comuns</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.commonQuestions.map((q: string, index: number) => <li key={index}>{q}</li>)}
                                        </ul>
                                    </div>
                                    <Sources sources={sources} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('seo', id)}
                onClear={() => appContext.clearHistory('seo')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default SeoAssistant;