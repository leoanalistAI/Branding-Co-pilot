import React, { useState, useEffect } from 'react';
import { generateCompetitorAnalysisService } from '../../services/geminiService';
import { useAppContext } from '../../context/AppContext';
import { HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { CheckCircleIcon, XCircleIcon, SparklesIcon } from '../icons/Icons';

const CompetitorAnalyzer: React.FC = () => {
    const appContext = useAppContext();
    const { addToHistory, getHistoryForTab, activeBrandId } = appContext;

    const [competitorUrl, setCompetitorUrl] = useState('');
    const [result, setResult] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    const history = getHistoryForTab('competitor');

    useEffect(() => {
        setResult(null);
        setError(null);
        setCompetitorUrl('');
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
            const { data, sources: apiSources } = await generateCompetitorAnalysisService(competitorUrl, contextForApi);
            setResult(data);
            setSources(apiSources);

            const newItem: HistoryItem = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise de Influência',
                summary: `Análise de ${competitorUrl.substring(0, 30)}...`,
                inputs: { competitorUrl, useGlobalContext },
                result: { analysis: data, sources: apiSources },
            };
            addToHistory('competitor', newItem);
            setActiveHistoryId(newItem.id);
        } catch (err) {
            setError('Falha ao analisar o concorrente. Verifique a URL e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: HistoryItem) => {
        setCompetitorUrl(item.inputs.competitorUrl);
        setUseGlobalContext(item.inputs.useGlobalContext);
        setResult(item.result.analysis);
        setSources(item.result.sources || []);
        setActiveHistoryId(item.id);
        setError(null);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Análise de Influência</h2>
                    <p className="text-neutral-400 mt-1">Obtenha insights sobre influenciadores e concorrentes para diferenciar sua marca.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Analisar Concorrente</CardTitle>
                                <CardDescription>Insira a URL do perfil ou canal que deseja analisar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="competitorUrl" className="block text-sm font-medium text-neutral-300 mb-1">URL do Concorrente</label>
                                        <input
                                            id="competitorUrl"
                                            type="url"
                                            value={competitorUrl}
                                            onChange={(e) => setCompetitorUrl(e.target.value)}
                                            className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                            placeholder="https://www.instagram.com/concorrente"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="useGlobalContextCompetitor"
                                            type="checkbox"
                                            checked={useGlobalContext}
                                            onChange={(e) => setUseGlobalContext(e.target.checked)}
                                            className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                        />
                                        <label htmlFor="useGlobalContextCompetitor" className="ml-2 block text-sm text-neutral-300">
                                            Usar Contexto Global da Marca
                                        </label>
                                    </div>
                                    <Button type="submit" isLoading={isLoading} className="w-full">Analisar</Button>
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
                                    <CardTitle>Resultados da Análise</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-lg text-green-400 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5" /> Pontos Fortes</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.strengths.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-red-400 flex items-center gap-2"><XCircleIcon className="w-5 h-5" /> Pontos Fracos</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.weaknesses.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg text-blue-400 flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Oportunidades de Diferenciação</h4>
                                        <ul className="list-disc list-inside mt-2 text-neutral-300 space-y-1">
                                            {result.opportunities.map((item: string, index: number) => <li key={index}>{item}</li>)}
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
                onDelete={(id) => appContext.removeFromHistory('competitor', id)}
                onClear={() => appContext.clearHistory('competitor')}
                activeItemId={activeHistoryId}
            />
        </div>
    );
};

export default CompetitorAnalyzer;