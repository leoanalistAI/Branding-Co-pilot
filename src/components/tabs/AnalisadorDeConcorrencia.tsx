import React from 'react';
import { AppContext, HistoryItem } from '@/types';
import { useCompetitorAnalyzer } from '@/hooks/useCompetitorAnalyzer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import HistorySidebar from '@/components/ui/HistorySidebar';
import { ArrowDownTrayIcon } from '@/components/icons';

interface AnalisadorDeConcorrenciaProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const AnalisadorDeConcorrencia: React.FC<AnalisadorDeConcorrenciaProps> = ({ appContext, history }) => {
    const {
        competitorHandles, setCompetitorHandles,
        result, isLoading, error,
        handleSubmit, handleHistorySelect, handleDownload,
        isBrandDnaReady
    } = useCompetitorAnalyzer(appContext, history);

    if (!isBrandDnaReady) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold text-neutral-100">Defina sua Marca Primeiro</h2>
                <p className="text-neutral-400 mt-2">A Análise de Mercado compara concorrentes com base no seu DNA de Marca para gerar insights relevantes.</p>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Análise de Mercado</h2>
                    <p className="text-neutral-400 mt-1">Descubra oportunidades e refine sua estratégia analisando o que seus concorrentes estão fazendo.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analisador de Concorrência</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="competitors" className="block text-sm font-medium text-neutral-300 mb-1">Perfis dos Concorrentes</label>
                                    <textarea
                                        id="competitors"
                                        value={competitorHandles}
                                        onChange={e => setCompetitorHandles(e.target.value)}
                                        rows={4}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: @concorrente1, @concorrente2, @concorrente3"
                                        required
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">Insira os @ dos perfis separados por vírgula.</p>
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-6">Analisar Mercado</Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400 text-center">{error}</p>}
                        {result && (
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Insights de Mercado</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Baixar</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Análise Competitiva</h4>
                                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.competitiveAnalysis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Análise de Gaps (Oportunidades)</h4>
                                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.gapAnalysis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Recomendações Estratégicas</h4>
                                        <p className="text-sm text-neutral-300 whitespace-pre-wrap">{result.strategicRecommendations}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Sugestões de Conteúdo Inovador</h4>
                                        <div className="space-y-3">
                                            {result.contentSuggestions.map((item, index) => (
                                                <div key={index} className="p-3 bg-neutral-900 rounded-lg">
                                                    <h5 className="font-semibold text-neutral-100">{item.title}</h5>
                                                    <p className="text-sm text-neutral-300"><strong className="text-neutral-400">Formato:</strong> {item.format}</p>
                                                    <p className="text-sm text-neutral-300 mt-1">{item.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
            />
        </div>
    );
};

export default AnalisadorDeConcorrencia;