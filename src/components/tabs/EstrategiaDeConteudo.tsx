import React from 'react';
import { AppContext, HistoryItem } from '@/types';
import { useContentStrategy } from '@/hooks/useContentStrategy';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import HistorySidebar from '@/components/ui/HistorySidebar';
import { ArrowDownTrayIcon } from '@/components/icons';

interface EstrategiaDeConteudoProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const EstrategiaDeConteudo: React.FC<EstrategiaDeConteudoProps> = ({ appContext, history }) => {
    const {
        goal, setGoal,
        format, setFormat,
        topic, setTopic,
        result, isLoading, error,
        handleSubmit, handleHistorySelect, handleDownload,
        isBrandDnaReady
    } = useContentStrategy(appContext, history);

    if (!isBrandDnaReady) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold text-neutral-100">Defina sua Marca Primeiro</h2>
                <p className="text-neutral-400 mt-2">A Estratégia de Conteúdo precisa do seu DNA de Marca para criar um plano alinhado com seus objetivos.</p>
            </div>
        );
    }

    const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Estratégia de Conteúdo</h2>
                    <p className="text-neutral-400 mt-1">Transforme uma ideia em um plano de conteúdo completo, do roteiro às hashtags.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gerador de Estratégia</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="goal" className="block text-sm font-medium text-neutral-300 mb-1">Objetivo Principal</label>
                                    <select id="goal" value={goal} onChange={e => setGoal(e.target.value)} className={inputClasses}>
                                        <option>Aumentar o engajamento</option>
                                        <option>Gerar leads</option>
                                        <option>Construir autoridade</option>
                                        <option>Educar a audiência</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="format" className="block text-sm font-medium text-neutral-300 mb-1">Formato do Conteúdo</label>
                                    <select id="format" value={format} onChange={e => setFormat(e.target.value)} className={inputClasses}>
                                        <option>Carrossel</option>
                                        <option>Reels</option>
                                        <option>Artigo de Blog</option>
                                        <option>Newsletter</option>
                                        <option>Vídeo no YouTube</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico ou Ideia Central</label>
                                    <textarea id="topic" value={topic} onChange={e => setTopic(e.target.value)} rows={4} className={inputClasses} placeholder="Ex: A importância de ter uma bio otimizada no Instagram" required />
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-6">Gerar Estratégia</Button>
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
                                        <CardTitle>{result.title}</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Baixar</Button>
                                    </div>
                                    <CardDescription><strong>Formato:</strong> {result.format} | <strong>Objetivo:</strong> {result.goal}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Roteiro/Estrutura</h4>
                                        <div className="space-y-3">
                                            {result.script.map((item, index) => (
                                                <div key={index} className="p-3 bg-neutral-900 rounded-lg">
                                                    <h5 className="font-semibold text-neutral-100">{item.part}</h5>
                                                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{item.content}</p>
                                                    {item.visualSuggestion && <p className="text-xs text-blue-400/80 mt-2 italic">Sugestão Visual: {item.visualSuggestion}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Sugestões de CTA</h4>
                                        <ul className="list-disc list-inside text-sm text-neutral-300">
                                            {result.ctaSuggestions.map((cta, i) => <li key={i}>{cta}</li>)}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Hashtags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.hashtags.map((tag, i) => <span key={i} className="bg-neutral-800 text-neutral-300 text-xs px-2 py-1 rounded-full">{tag}</span>)}
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
                onDelete={(id) => appContext.removeFromHistory('strategy', id)}
                onClear={() => appContext.clearHistory('strategy')}
            />
        </div>
    );
};

export default EstrategiaDeConteudo;