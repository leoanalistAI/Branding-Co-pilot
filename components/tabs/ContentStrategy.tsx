import React, { useState, useEffect } from 'react';
import { createEditorialCalendarService, generateSeoAnalysisService } from '../../services/geminiService';
import { AppContext, EditorialCalendarPost, SeoAnalysisResult, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon, PlusIcon } from '../icons/Icons';
import HistorySidebar from '../ui/HistorySidebar';

interface ContentStrategyProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const ViewSwitcher = ({ activeView, setActiveView }: { activeView: string, setActiveView: (view: 'calendar' | 'seo') => void }) => (
    <div className="mb-8 flex justify-center gap-2 rounded-lg bg-neutral-900 p-1 max-w-sm mx-auto">
        <button
            onClick={() => setActiveView('calendar')}
            className={`w-full rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${activeView === 'calendar' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
        >
            Calendário
        </button>
        <button
            onClick={() => setActiveView('seo')}
            className={`w-full rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${activeView === 'seo' ? 'bg-blue-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'}`}
        >
            Pesquisa de Tópicos
        </button>
    </div>
);

const ContentStrategy: React.FC<ContentStrategyProps> = ({ appContext, history }) => {
    const [activeView, setActiveView] = useState<'calendar' | 'seo'>('calendar');
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    // Calendar State
    const [calendarTheme, setCalendarTheme] = useState('');
    const [platforms, setPlatforms] = useState<string[]>(['Instagram', 'Blog']);
    const [numPosts, setNumPosts] = useState(5);
    const [posts, setPosts] = useState<EditorialCalendarPost[] | null>(null);
    const [calendarSources, setCalendarSources] = useState<Source[]>([]);
    const [isCalendarLoading, setIsCalendarLoading] = useState(false);
    const [calendarError, setCalendarError] = useState<string | null>(null);

    // SEO State
    const [seoTopic, setSeoTopic] = useState('');
    const [seoResult, setSeoResult] = useState<SeoAnalysisResult | null>(null);
    const [seoSources, setSeoSources] = useState<Source[]>([]);
    const [isSeoLoading, setIsSeoLoading] = useState(false);
    const [seoError, setSeoError] = useState<string | null>(null);
    
    // Shared State
    const [calendarIdeas, setCalendarIdeas] = useState<string[]>([]);

    useEffect(() => {
        setPosts(null);
        setCalendarSources([]);
        setSeoResult(null);
        setSeoSources([]);
        setCalendarIdeas([]);
    }, [appContext.activeBrandId]);

    const handlePlatformChange = (platform: string) => {
        setPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleCalendarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (platforms.length === 0) {
            setCalendarError("Selecione pelo menos uma plataforma.");
            return;
        }
        setIsCalendarLoading(true);
        setCalendarError(null);
        setPosts(null);
        setCalendarSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data: result, sources: newSources } = await createEditorialCalendarService(calendarTheme, platforms, numPosts, contextForApi);
            setPosts(result);
            setCalendarSources(newSources);

             appContext.addToHistory('strategy', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Calendário Editorial',
                summary: `${numPosts} posts sobre ${calendarTheme}`,
                inputs: { calendarTheme, platforms, numPosts, useGlobalContext },
                result: { data: result, sources: newSources },
            });
        } catch (err) {
            setCalendarError('Falha ao criar o calendário. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsCalendarLoading(false);
        }
    };

    const handleSeoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSeoLoading(true);
        setSeoError(null);
        setSeoResult(null);
        setSeoSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandFoundation: null };
            const { data, sources: newSources } = await generateSeoAnalysisService(seoTopic, contextForApi);
            setSeoResult(data);
            setSeoSources(newSources);
            appContext.addToHistory('strategy', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise SEO',
                summary: `SEO para: ${seoTopic}`,
                inputs: { seoTopic, useGlobalContext },
                result: { data, sources: newSources },
            });
        } catch (err) {
            setSeoError('Falha ao analisar o tópico. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsSeoLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        if (item.type === 'Calendário Editorial') {
            setCalendarTheme(item.inputs.calendarTheme);
            setPlatforms(item.inputs.platforms);
            setNumPosts(item.inputs.numPosts);
            setPosts(item.result.data);
            setCalendarSources(item.result.sources || []);
            setSeoResult(null); // Clear other view's result
            setActiveView('calendar');
        } else if (item.type === 'Análise SEO') {
            setSeoTopic(item.inputs.seoTopic);
            setSeoResult(item.result.data);
            setSeoSources(item.result.sources || []);
            setPosts(null); // Clear other view's result
            setActiveView('seo');
        }
    };
    
    const handleCalendarDownload = () => {
        if (!posts) return;
        let content = `# Calendário Editorial para "${calendarTheme}"\n\n`;
        content += `| Data | Plataforma | Tópico | Ideia de Conteúdo |\n`;
        content += `|---|---|---|---|\n`;
        posts.forEach(post => {
            content += `| ${post.date} | ${post.platform} | ${post.topic.replace(/\|/g, '\\|')} | ${post.contentIdea.replace(/\|/g, '\\|')} |\n`;
        });
        downloadAsMarkdown(content, `calendario-${calendarTheme.replace(/\s+/g, '-').toLowerCase()}`);
    };

    const handleSeoDownload = () => {
        if (!seoResult) return;
        let content = `# Análise de SEO para "${seoTopic}"\n\n`;
        content += `## Palavras-chave Primárias\n- ${seoResult.primaryKeywords.join('\n- ')}\n\n`;
        content += `## Palavras-chave Secundárias\n- ${seoResult.secondaryKeywords.join('\n- ')}\n\n`;
        content += `## Perguntas Comuns (People Also Ask)\n- ${seoResult.commonQuestions.join('\n- ')}\n\n`;
        content += `---\n\n## Estrutura de Post Sugerida\n\n`;
        content += `### Título\n${seoResult.suggestedStructure.title}\n\n`;
        content += `### Introdução\n${seoResult.suggestedStructure.introduction}\n\n`;
        content += `### Seções\n- ${seoResult.suggestedStructure.sections.join('\n- ')}\n\n`;
        content += `### Conclusão\n${seoResult.suggestedStructure.conclusion}\n`;
        downloadAsMarkdown(content, `analise-seo-${seoTopic.replace(/\s+/g, '-').toLowerCase()}`);
    };

    const addIdeaToCalendar = (idea: string) => {
        if (!calendarIdeas.includes(idea)) {
            setCalendarIdeas(prev => [...prev, idea]);
        }
    };

    const useCalendarIdea = (idea: string) => {
        setCalendarTheme(idea);
        setCalendarIdeas(prev => prev.filter(i => i !== idea));
        setActiveView('calendar');
    };

    const platformOptions = ['Instagram', 'Blog', 'LinkedIn', 'TikTok', 'YouTube', 'Email'];

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Estratégia de Conteúdo</h2>
                    <p className="text-neutral-400 mt-1">Pesquise tópicos relevantes e planeje seu calendário editorial.</p>
                </header>

                <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />

                {activeView === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <Card>
                                <CardContent className="pt-6">
                                    <form onSubmit={handleCalendarSubmit} className="space-y-4">
                                        <div>
                                            <label htmlFor="theme" className="block text-sm font-medium text-neutral-300 mb-1">Tema Principal</label>
                                            <input id="theme" type="text" value={calendarTheme} onChange={(e) => setCalendarTheme(e.target.value)} className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors" placeholder="Ex: Produtividade para times remotos" required />
                                        </div>
                                        <div>
                                            <label htmlFor="numPosts" className="block text-sm font-medium text-neutral-300 mb-1">Número de Posts</label>
                                            <input id="numPosts" type="number" value={numPosts} min="1" max="20" onChange={(e) => setNumPosts(parseInt(e.target.value))} className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-300 mb-2">Plataformas</label>
                                            <div className="flex flex-wrap gap-2">
                                                {platformOptions.map(p => (
                                                    <button type="button" key={p} onClick={() => handlePlatformChange(p)} className={`px-3 py-1 text-sm rounded-full transition-colors ${platforms.includes(p) ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'}`}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center pt-2">
                                            <input id="useGlobalContext" type="checkbox" checked={useGlobalContext} onChange={(e) => setUseGlobalContext(e.target.checked)} className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black" />
                                            <label htmlFor="useGlobalContext" className="ml-2 block text-sm text-neutral-300">Usar Contexto Global da Marca</label>
                                        </div>
                                        <Button type="submit" isLoading={isCalendarLoading} className="!mt-4 w-full">Criar Calendário</Button>
                                    </form>
                                </CardContent>
                            </Card>
                            {calendarIdeas.length > 0 && (
                                <Card className="mt-4">
                                    <CardContent className="pt-6">
                                        <h4 className="font-semibold text-neutral-300 mb-2">Ideias de Tópicos</h4>
                                        <ul className="space-y-2">
                                            {calendarIdeas.map((idea, i) => (
                                                <li key={i} className="flex justify-between items-center text-sm text-neutral-400">
                                                    <span className="flex-1 truncate pr-2">{idea}</span>
                                                    <button onClick={() => useCalendarIdea(idea)} className="text-blue-400 hover:text-blue-300 font-semibold">Usar</button>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                        <div className="lg:col-span-2">
                            {isCalendarLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                            {calendarError && !isCalendarLoading && <p className="text-red-400 text-center">{calendarError}</p>}
                            {posts && (
                                <>
                                    <div className="flex justify-end mb-4">
                                        <Button size="sm" variant="secondary" onClick={handleCalendarDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Baixar Calendário</Button>
                                    </div>
                                    <div className="overflow-x-auto rounded-lg border border-neutral-800">
                                        <table className="min-w-full bg-neutral-950">
                                            <thead className="bg-neutral-900">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Data</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Plataforma</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Tópico</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Ideia de Conteúdo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-800">
                                                {posts.map((post, index) => (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-200">{post.date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/10 text-blue-400">{post.platform}</span></td>
                                                        <td className="px-6 py-4 text-sm text-neutral-300">{post.topic}</td>
                                                        <td className="px-6 py-4 text-sm text-neutral-400">{post.contentIdea}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {calendarSources.length > 0 && <Card className="mt-4"><CardContent className="pt-6"><Sources sources={calendarSources} /></CardContent></Card>}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {activeView === 'seo' && (
                    <div className="max-w-4xl mx-auto">
                        <Card className="max-w-2xl mx-auto">
                            <CardContent className="pt-6">
                                <form onSubmit={handleSeoSubmit}>
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                        <div className="flex-grow">
                                            <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico ou Palavra-chave</label>
                                            <input id="topic" type="text" value={seoTopic} onChange={(e) => setSeoTopic(e.target.value)} className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors" placeholder="Ex: Como criar uma marca pessoal no LinkedIn" required />
                                        </div>
                                        <Button type="submit" isLoading={isSeoLoading} className="w-full sm:w-auto flex-shrink-0">Analisar Tópico</Button>
                                    </div>
                                    <div className="flex items-center mt-4">
                                        <input id="useGlobalContext" type="checkbox" checked={useGlobalContext} onChange={(e) => setUseGlobalContext(e.target.checked)} className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black" />
                                        <label htmlFor="useGlobalContext" className="ml-2 block text-sm text-neutral-300">Usar Contexto Global da Marca</label>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                        <div className="mt-8">
                            {isSeoLoading && <div className="flex justify-center items-center h-full mt-8"><Spinner /></div>}
                            {seoError && <p className="text-red-400 mt-8 text-center">{seoError}</p>}
                            {seoResult && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-bold text-white">Resultados da Análise de SEO</h3>
                                        <Button size="sm" variant="secondary" onClick={handleSeoDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>Baixar Análise</Button>
                                    </div>
                                    {[
                                        { title: 'Palavras-chave Primárias', items: seoResult.primaryKeywords },
                                        { title: 'Palavras-chave Secundárias', items: seoResult.secondaryKeywords },
                                        { title: 'Perguntas Comuns (People Also Ask)', items: seoResult.commonQuestions }
                                    ].map(({ title, items }) => (
                                        <Card key={title}>
                                            <CardContent className="pt-6">
                                                <h4 className="font-semibold text-blue-400 mb-2">{title}</h4>
                                                <ul className="space-y-2">
                                                    {items.map((item, i) => (
                                                        <li key={i} className="flex justify-between items-center text-sm text-neutral-300">
                                                            <span>{item}</span>
                                                            <button onClick={() => addIdeaToCalendar(item)} className="p-1 rounded-full hover:bg-neutral-700" title="Adicionar às ideias do calendário"><PlusIcon className="w-4 h-4 text-neutral-400" /></button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    <Card>
                                        <CardContent className="pt-6">
                                            <h4 className="font-semibold text-blue-400 mb-2">Estrutura de Post Sugerida</h4>
                                            <div className="space-y-3 text-sm">
                                                <p><strong>Título:</strong> {seoResult.suggestedStructure.title}</p>
                                                <p><strong>Introdução:</strong> {seoResult.suggestedStructure.introduction}</p>
                                                <div><strong>Seções:</strong><ul className="list-decimal list-inside text-neutral-300 space-y-1 mt-1">{seoResult.suggestedStructure.sections.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                                                <p><strong>Conclusão:</strong> {seoResult.suggestedStructure.conclusion}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Sources sources={seoSources} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
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

export default ContentStrategy;