import React, { useState, useEffect, FC, FormEvent } from 'react';
import { analyzeCompetitorService, findPeersService } from '@/services/aiService';
import { AppContext, CompetitorAnalysis, Source, HistoryItem, FoundCompetitor } from '@/types';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import Sources from '@/components/ui/Sources';
import { downloadAsMarkdown } from '@/utils/fileUtils';
import { ArrowDownTrayIcon } from '@/components/icons/Icons';
import HistorySidebar from '@/components/ui/HistorySidebar';


interface CompetitorAnalyzerProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const CompetitorAnalyzer: FC<CompetitorAnalyzerProps> = ({ appContext, history }) => {
    const [competitorUrl, setCompetitorUrl] = useState('');
    const [useGlobalContext, setUseGlobalContext] = useState(true);
    
    const [result, setResult] = useState<CompetitorAnalysis | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [foundPeers, setFoundPeers] = useState<FoundCompetitor[] | null>(null);
    const [isFinding, setIsFinding] = useState(false);
    const [findError, setFindError] = useState<string | null>(null);


    // Clear results when active brand changes
    useEffect(() => {
        setResult(null);
        setSources([]);
        setFoundPeers(null);
    }, [appContext.activeBrandId]);

    const runAnalysis = async (urlToAnalyze: string) => {
        if (!urlToAnalyze) {
            setError("Por favor, insira uma URL para analisar.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        setSources([]);
        setFoundPeers(null); // Hide suggestions when a new analysis starts
    
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data: analysisResult, sources: newSources } = await analyzeCompetitorService(urlToAnalyze, contextForApi);
            setResult(analysisResult);
            setSources(newSources);
            appContext.addToHistory('competitor', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise de Influência',
                summary: analysisResult.competitorName,
                inputs: { competitorUrl: urlToAnalyze, useGlobalContext },
                result: { data: analysisResult, sources: newSources },
            });
        } catch (err) {
            setError('Falha ao analisar o perfil. Verifique a URL e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        runAnalysis(competitorUrl);
    };
    
    const handleFindPeers = async () => {
        if (!appContext.brandDna) {
            setFindError("Defina um DNA de Marca primeiro.");
            return;
        }
        setIsFinding(true);
        setFindError(null);
        setFoundPeers(null);
        setResult(null);
        try {
            const { data } = await findPeersService(appContext.brandDna);
            setFoundPeers(data);
        } catch (err) {
            setFindError("Não foi possível encontrar perfis. Tente novamente.");
            console.error(err);
        } finally {
            setIsFinding(false);
        }
    };

    const handleAnalyzeFoundCompetitor = (url: string) => {
        setCompetitorUrl(url); 
        runAnalysis(url);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleHistorySelect = (item: any) => {
        setCompetitorUrl(item.inputs.competitorUrl);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result.data);
        setSources(item.result.sources || []);
        setFoundPeers(null); // clear peer suggestions when loading from history
    };

    const handleDownload = () => {
        if (!result) return;
        let content = `# Análise de Influência: ${result.competitorName}\n\n`;
        content += `## Pontos Fortes\n- ${result.strengths.join('\n- ')}\n\n`;
        content += `## Pontos Fracos\n- ${result.weaknesses.join('\n- ')}\n\n`;
        content += `## Oportunidades\n- ${result.opportunities.join('\n- ')}\n\n`;

        downloadAsMarkdown(content, `analise-${result.competitorName.replace(/\s+/g, '-').toLowerCase()}`);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Análise de Influência</h2>
                    <p className="text-neutral-400 mt-1">Obtenha insights sobre influenciadores e peers do seu nicho.</p>
                </header>
                <Card className="max-w-2xl mx-auto mb-8">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                <div className="flex-grow">
                                    <label htmlFor="competitorUrl" className="block text-sm font-medium text-neutral-300 mb-1">
                                        URL do Perfil (LinkedIn, Instagram, Site)
                                    </label>
                                    <input
                                        id="competitorUrl"
                                        type="url"
                                        value={competitorUrl}
                                        onChange={(e) => setCompetitorUrl(e.target.value)}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="https://www.linkedin.com/in/..."
                                        required
                                    />
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                                    Analisar
                                </Button>
                            </div>
                            <div className="flex items-center mt-4">
                                <input
                                    id="useGlobalContextCompetitor"
                                    type="checkbox"
                                    checked={useGlobalContext}
                                    onChange={(e) => setUseGlobalContext(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                />
                                <label htmlFor="useGlobalContextCompetitor" className="ml-2 block text-sm text-neutral-300">
                                    Usar Contexto Global da Marca para Comparação
                                </label>
                            </div>
                        </form>
                        <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleFindPeers}
                                isLoading={isFinding}
                                disabled={!appContext.brandDna}
                            >
                                Não sabe quem analisar? Encontre Peers/Influenciadores
                            </Button>
                            {!appContext.brandDna && (
                                <p className="text-xs text-neutral-500 mt-2">Você precisa de um DNA de Marca ativo para usar esta função.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="max-w-4xl mx-auto">
                    {isFinding && <div className="flex justify-center my-8"><Spinner /></div>}
                    {findError && <p className="text-red-400 mt-8 text-center">{findError}</p>}
                    {foundPeers && (
                         <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">Peers e Influenciadores Sugeridos</h3>
                            <Card>
                                <CardContent className="pt-6">
                                    <ul className="space-y-4 divide-y divide-neutral-800">
                                        {foundPeers.map((comp, i) => (
                                            <li key={i} className="flex flex-col sm:flex-row justify-between sm:items-center pt-4 first:pt-0">
                                                <div>
                                                    <p className="font-semibold text-neutral-100">{comp.name}</p>
                                                    <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate">{comp.url}</a>
                                                </div>
                                                <Button size="sm" onClick={() => handleAnalyzeFoundCompetitor(comp.url)} className="mt-2 sm:mt-0">
                                                    Analisar
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    )}


                    {isLoading && <div className="flex justify-center items-center h-full mt-8"><Spinner /></div>}
                    {error && <p className="text-red-400 mt-8 text-center">{error}</p>}
                    {result && (
                        <Card>
                            <CardHeader>
                                 <div className="flex justify-between items-center">
                                    <CardTitle>Análise de: {result.competitorName}</CardTitle>
                                    <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                        Baixar Análise
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-green-400 text-lg">Pontos Fortes</h4>
                                        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                            {result.strengths.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-red-400 text-lg">Pontos Fracos</h4>
                                        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                            {result.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-amber-400 text-lg">Oportunidades</h4>
                                        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
                                            {result.opportunities.map((item, i) => <li key={i}>{item}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                            <CardContent>
                                <Sources sources={sources} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('competitor', id)}
                onClear={() => appContext.clearHistory('competitor')}
            />
        </div>
    );
};

export default CompetitorAnalyzer;