import * as React from 'react';
import { createEditorialCalendarService } from '../../services/geminiService';
import { AppContext, EditorialCalendarPost, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import Spinner from '../ui/Spinner';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon } from '../icons/Icons';
import HistorySidebar from '../ui/HistorySidebar';

interface EditorialCalendarProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const EditorialCalendar: React.FC<EditorialCalendarProps> = ({ appContext, history }) => {
    const [theme, setTheme] = React.useState('');
    const [platforms, setPlatforms] = React.useState<string[]>(['Instagram', 'Blog']);
    const [numPosts, setNumPosts] = React.useState(5);
    const [useGlobalContext, setUseGlobalContext] = React.useState(true);
    const [posts, setPosts] = React.useState<EditorialCalendarPost[] | null>(null);
    const [sources, setSources] = React.useState<Source[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Clear results when active brand changes
    React.useEffect(() => {
        setPosts(null);
        setSources([]);
    }, [appContext.activeBrandId]);

    const handlePlatformChange = (platform: string) => {
        setPlatforms(prev =>
            prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (platforms.length === 0) {
            setError("Selecione pelo menos uma plataforma.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPosts(null);
        setSources([]);
        try {
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const { data: result, sources: newSources } = await createEditorialCalendarService(theme, platforms, numPosts, contextForApi);
            setPosts(result);
            setSources(newSources);

             appContext.addToHistory('calendar', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Calendário Editorial',
                summary: `${numPosts} posts sobre ${theme}`,
                inputs: { theme, platforms, numPosts, useGlobalContext },
                result: { data: result, sources: newSources },
            });
        } catch (err) {
            setError('Falha ao criar o calendário. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setTheme(item.inputs.theme);
        setPlatforms(item.inputs.platforms);
        setNumPosts(item.inputs.numPosts);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setPosts(item.result.data);
        setSources(item.result.sources || []);
    };
    
    const handleDownload = () => {
        if (!posts) return;

        let content = `# Calendário Editorial para "${theme}"\n\n`;
        content += `| Data | Plataforma | Tópico | Ideia de Conteúdo |\n`;
        content += `|---|---|---|---|\n`;
        posts.forEach(post => {
            const cleanTopic = post.topic.replace(/\|/g, '\\|');
            const cleanContent = post.contentIdea.replace(/\|/g, '\\|');
            content += `| ${post.date} | ${post.platform} | ${cleanTopic} | ${cleanContent} |\n`;
        });

        downloadAsMarkdown(content, `calendario-${theme.replace(/\s+/g, '-').toLowerCase()}`);
    };

    const platformOptions = ['Instagram', 'Blog', 'LinkedIn', 'TikTok', 'YouTube', 'Email'];

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Calendário Editorial</h2>
                    <p className="text-neutral-400 mt-1">Planeje seu conteúdo com base em um tema central.</p>
                </header>
                <Card className="mb-8">
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="theme" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Tema Principal do Conteúdo
                                    </label>
                                    <input
                                        id="theme"
                                        type="text"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: Produtividade para times remotos"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="numPosts" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Número de Posts
                                    </label>
                                    <input
                                        id="numPosts"
                                        type="number"
                                        value={numPosts}
                                        min="1"
                                        max="20"
                                        onChange={(e) => setNumPosts(parseInt(e.target.value))}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">
                                    Plataformas
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {platformOptions.map(p => (
                                        <button
                                            type="button"
                                            key={p}
                                            onClick={() => handlePlatformChange(p)}
                                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                platforms.includes(p) ? 'bg-blue-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <input
                                    id="useGlobalContextCalendar"
                                    type="checkbox"
                                    checked={useGlobalContext}
                                    onChange={(e) => setUseGlobalContext(e.target.checked)}
                                    className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                />
                                <label htmlFor="useGlobalContextCalendar" className="ml-2 block text-sm text-neutral-300">
                                    Usar Contexto Global da Marca
                                </label>
                            </div>
                            <Button type="submit" isLoading={isLoading} className="!mt-4">
                                Criar Calendário
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div>
                    {isLoading && <div className="flex justify-center items-center h-full mt-8"><Spinner /></div>}
                    {error && !isLoading && <p className="text-red-400 mt-8 text-center">{error}</p>}
                    {posts && (
                        <>
                         <div className="flex justify-end mb-4">
                             <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                Baixar Calendário
                            </Button>
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
                        {sources.length > 0 && (
                            <Card className="mt-4">
                                 <CardContent className="pt-6">
                                    <Sources sources={sources} />
                                </CardContent>
                            </Card>
                        )}
                        </>
                    )}
                </div>
            </div>
            <HistorySidebar
                history={history}
                onSelect={handleHistorySelect}
                onDelete={(id) => appContext.removeFromHistory('calendar', id)}
                onClear={() => appContext.clearHistory('calendar')}
            />
        </div>
    );
};

export default EditorialCalendar;