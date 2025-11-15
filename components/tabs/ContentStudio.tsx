
import React, { useState, useEffect } from 'react';
import { generateCopyService, createScriptService, generateCarouselService } from '../../services/geminiService';
import { AppContext, CopywritingResult, ScriptResult, CarouselResult, Source, HistoryItem } from '../../types';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Spinner from '../ui/Spinner';
import HistorySidebar from '../ui/HistorySidebar';
import Sources from '../ui/Sources';
import { downloadAsMarkdown } from '../../utils/fileUtils';
import { ArrowDownTrayIcon } from '../icons/Icons';

interface ContentStudioProps {
    appContext: AppContext;
    history: HistoryItem[];
}

type ContentType = 'Roteiro de Vídeo' | 'Post' | 'Copy' | 'Carrossel';
type ResultType = CopywritingResult | ScriptResult | CarouselResult;

const RadioPill = ({ label, value, checked, onChange }: { label: string, value: string, checked: boolean, onChange: (value: string) => void }) => (
    <label className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-600 text-white font-semibold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
    }`}>
        <input type="radio" name={label} value={value} checked={checked} onChange={(e) => onChange(e.target.value)} className="sr-only" />
        {label}
    </label>
);

const ContentStudio: React.FC<ContentStudioProps> = ({ appContext, history }) => {
    // Main type
    const [contentType, setContentType] = useState<ContentType>('Post');

    // Sub-types
    const [videoType, setVideoType] = useState('Vídeo Curto (Reels/Shorts)');
    const [postType, setPostType] = useState('Blog');
    const [copyType, setCopySubtype] = useState('Post de Divulgação');
    const [carouselPlatform, setCarouselPlatform] = useState('Instagram');
    
    // Common fields
    const [topic, setTopic] = useState('');
    const [toneOfVoice, setToneOfVoice] = useState('Persuasivo');
    
    // Script fields
    const [title, setTitle] = useState('');
    const [hook, setHook] = useState('');
    
    // Carousel fields
    const [numSlides, setNumSlides] = useState(5);

    // General state
    const [result, setResult] = useState<ResultType | null>(null);
    const [sources, setSources] = useState<Source[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);

    useEffect(() => {
        if (appContext.prefillData && appContext.prefillData.tab === 'contentStudio') {
            const { topic } = appContext.prefillData.data;
            setContentType('Post');
            setPostType('Blog');
            if (topic) setTopic(topic);
            appContext.clearPrefillData();
        }
    }, [appContext.prefillData]);
    
    // Clear results when active brand changes
    useEffect(() => {
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
            let response;
            let historyInputs: any = { useGlobalContext };
            let summary = '';
            
            switch (contentType) {
                case 'Roteiro de Vídeo':
                    response = await createScriptService(videoType, topic, title, hook, contextForApi);
                    summary = `${videoType}: ${topic.substring(0, 20)}...`;
                    historyInputs = { ...historyInputs, contentType, videoType, topic, title, hook };
                    break;
                case 'Post':
                    response = await generateCopyService(`Post para ${postType}`, topic, toneOfVoice, contextForApi);
                    summary = `Post para ${postType}: ${topic.substring(0, 20)}...`;
                    historyInputs = { ...historyInputs, contentType, postType, topic, toneOfVoice };
                    break;
                case 'Copy':
                    response = await generateCopyService(copyType, topic, toneOfVoice, contextForApi);
                    summary = `${copyType}: ${topic.substring(0, 20)}...`;
                    historyInputs = { ...historyInputs, contentType, copyType, topic, toneOfVoice };
                    break;
                case 'Carrossel':
                    response = await generateCarouselService(topic, carouselPlatform, numSlides, contextForApi);
                    summary = `Carrossel p/ ${carouselPlatform}: ${topic.substring(0, 20)}...`;
                    historyInputs = { ...historyInputs, contentType, carouselPlatform, topic, numSlides };
                    break;
            }
            
            setResult(response.data);
            setSources(response.sources);
            
            appContext.addToHistory('contentStudio', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Estúdio de Conteúdo',
                summary: summary,
                inputs: historyInputs,
                result: { data: response.data, sources: response.sources }
            });

        } catch (err) {
            setError('Falha ao gerar conteúdo. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        const { inputs, result } = item;
        setContentType(inputs.contentType);
        setUseGlobalContext(inputs.useGlobalContext ?? true);
        setResult(result.data);
        setSources(result.sources || []);

        setTopic(inputs.topic || '');
        setToneOfVoice(inputs.toneOfVoice || 'Persuasivo');
        setVideoType(inputs.videoType || 'Vídeo Curto (Reels/Shorts)');
        setTitle(inputs.title || '');
        setHook(inputs.hook || '');
        setPostType(inputs.postType || 'Blog');
        setCopySubtype(inputs.copyType || 'Anúncio');
        setCarouselPlatform(inputs.carouselPlatform || 'Instagram');
        setNumSlides(inputs.numSlides || 5);
    };
    
    const handleDownload = () => {
        if (!result) return;
        
        let content = '';
        let filename = 'conteudo-gerado';

        if ('slides' in result) { // It's a CarouselResult
            const carousel = result as CarouselResult;
            filename = `carrossel-${carousel.mainTitle.replace(/\s+/g, '-').toLowerCase()}`;
            content += `# Carrossel: ${carousel.mainTitle}\n\n`;
            carousel.slides.forEach(slide => {
                content += `## Slide ${slide.slideNumber}: ${slide.title}\n\n`;
                content += `${slide.content}\n\n`;
                content += `**Sugestão de Imagem:** ${slide.imagePrompt}\n\n---\n\n`;
            });
            content += `## CTA (Último Slide)\n${carousel.cta}\n`;
        } else if ('script' in result) { // It's a ScriptResult
            const script = result as ScriptResult;
            filename = `roteiro-${script.title.replace(/\s+/g, '-').toLowerCase()}`;
            content += `# Roteiro: ${script.title}\n\n`;
            content += `## Hook\n> ${script.hook}\n\n`;
            content += `## Cenas\n\n`;
            script.script.forEach(scene => {
                content += `### ${scene.scene}\n`;
                content += `- **Visual:** ${scene.visual}\n`;
                content += `- **Diálogo:** ${scene.dialogue}\n\n`;
            });
            content += `## CTA\n**${script.cta}**\n`;
        } else if ('headline' in result) { // It's a CopywritingResult
            const copy = result as CopywritingResult;
            const historyItem = history.find(h => {
                const res = h.result as { data: ResultType };
                if (res.data && 'headline' in res.data) {
                    return res.data.headline === copy.headline;
                }
                return false;
            });
            const type = historyItem?.inputs?.postType || historyItem?.inputs?.copyType || 'Copy';

            filename = `copy-${type.replace(/\s+/g, '-').toLowerCase()}`;
            content += `# Copy para ${type}\n\n`;
            content += `## Headline\n${copy.headline}\n\n`;
            content += `## Corpo\n${copy.body}\n\n`;
            content += `## CTA\n${copy.cta}\n`;
        }

        downloadAsMarkdown(content, filename);
    };

    const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";
    
    const renderSubtypeAndInputs = () => {
        switch (contentType) {
            case 'Roteiro de Vídeo':
                 return (
                    <>
                         <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Formato do Vídeo</label>
                            <div className="flex flex-wrap gap-2">
                                <RadioPill label="Curto (Reels/Shorts)" value="Vídeo Curto (Reels/Shorts)" checked={videoType === 'Vídeo Curto (Reels/Shorts)'} onChange={setVideoType} />
                                <RadioPill label="Longo (YouTube)" value="Vídeo Longo (YouTube)" checked={videoType === 'Vídeo Longo (YouTube)'} onChange={setVideoType} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico / Descrição <span className="text-red-400">*</span></label>
                            <textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} rows={4} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-neutral-300 mb-1">Título (Opcional)</label>
                            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label htmlFor="hook" className="block text-sm font-medium text-neutral-300 mb-1">Hook / Gancho (Opcional)</label>
                            <textarea id="hook" value={hook} onChange={(e) => setHook(e.target.value)} rows={2} className={inputClasses} />
                        </div>
                    </>
                );
            case 'Post':
                return (
                     <>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Canal</label>
                            <div className="flex flex-wrap gap-2">
                                <RadioPill label="Blog" value="Blog" checked={postType === 'Blog'} onChange={setPostType} />
                                <RadioPill label="Instagram" value="Instagram" checked={postType === 'Instagram'} onChange={setPostType} />
                                <RadioPill label="LinkedIn" value="LinkedIn" checked={postType === 'LinkedIn'} onChange={setPostType} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico ou Objetivo</label>
                            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="toneOfVoice" className="block text-sm font-medium text-neutral-300 mb-1">Tom de Voz</label>
                            <select id="toneOfVoice" value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} className={inputClasses}>
                                <option>Persuasivo</option><option>Informativo</option><option>Divertido</option><option>Profissional</option><option>Empático</option><option>Amigável</option>
                            </select>
                        </div>
                    </>
                );
            case 'Copy':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo de Copy</label>
                            <div className="flex flex-wrap gap-2">
                                <RadioPill label="Post de Divulgação" value="Post de Divulgação" checked={copyType === 'Post de Divulgação'} onChange={setCopySubtype} />
                                <RadioPill label="Newsletter" value="Newsletter" checked={copyType === 'Newsletter'} onChange={setCopySubtype} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico ou Mensagem Principal</label>
                            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="toneOfVoice" className="block text-sm font-medium text-neutral-300 mb-1">Tom de Voz</label>
                            <select id="toneOfVoice" value={toneOfVoice} onChange={(e) => setToneOfVoice(e.target.value)} className={inputClasses}>
                                <option>Persuasivo</option><option>Informativo</option><option>Divertido</option><option>Profissional</option><option>Empático</option><option>Amigável</option>
                            </select>
                        </div>
                    </>
                );
            case 'Carrossel':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Plataforma</label>
                            <div className="flex flex-wrap gap-2">
                                <RadioPill label="Instagram" value="Instagram" checked={carouselPlatform === 'Instagram'} onChange={setCarouselPlatform} />
                                <RadioPill label="LinkedIn" value="LinkedIn" checked={carouselPlatform === 'LinkedIn'} onChange={setCarouselPlatform} />
                                <RadioPill label="TikTok" value="TikTok" checked={carouselPlatform === 'TikTok'} onChange={setCarouselPlatform} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-neutral-300 mb-1">Tópico do Carrossel <span className="text-red-400">*</span></label>
                            <input id="topic" type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className={inputClasses} required placeholder="Ex: 5 mitos sobre produtividade" />
                        </div>
                         <div>
                            <label htmlFor="numSlides" className="block text-sm font-medium text-neutral-300 mb-1">Número de Slides</label>
                            <input id="numSlides" type="number" value={numSlides} onChange={(e) => setNumSlides(parseInt(e.target.value))} min="3" max="10" className={inputClasses} />
                        </div>
                    </>
                );
        }
    }

    const renderResult = () => {
        if (!result) return null;

        if ('slides' in result) {
            const carousel = result as CarouselResult;
            return (
                <>
                    <h3 className="text-xl font-bold text-white mb-4 px-1">{carousel.mainTitle}</h3>
                    <div className="flex overflow-x-auto space-x-4 pb-4">
                        {carousel.slides.map((slide, index) => (
                            <div key={index} className="flex-shrink-0 w-72 bg-neutral-900 rounded-lg p-4 border border-neutral-800 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-neutral-100">{slide.title}</h4>
                                    <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{slide.slideNumber}/{carousel.slides.length}</span>
                                </div>
                                <p className="text-sm text-neutral-300 flex-grow">{slide.content}</p>
                                <div className="mt-auto pt-2 border-t border-neutral-700/50">
                                    <p className="text-xs text-neutral-400 italic">
                                        <span className="font-semibold text-neutral-300">Prompt de Imagem:</span> {slide.imagePrompt}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 bg-neutral-900 p-3 rounded-md border border-neutral-800">
                        <h4 className="font-semibold text-blue-400 mb-1">CTA (Último Slide)</h4>
                        <p className="text-neutral-200 font-semibold">{carousel.cta}</p>
                    </div>
                </>
            );
        } else if ('script' in result) {
             const script = result as ScriptResult;
             return (
                <>
                    <h3 className="text-xl font-bold text-white mb-2">{script.title}</h3>
                    <div className="space-y-4 text-sm">
                        <div className="bg-neutral-900 p-3 rounded-md"><h4 className="font-semibold text-blue-400 mb-1">Hook</h4><p className="text-neutral-200 italic">"{script.hook}"</p></div>
                        <div className="space-y-3"><h4 className="font-semibold text-blue-400 mt-4">Roteiro</h4>{script.script.map((scene, i) => (
                            <div key={i} className="border-l-2 border-neutral-700 pl-3 py-1">
                                <p className="font-bold text-neutral-200">{scene.scene}</p>
                                <p className="text-xs text-neutral-400 mt-1"><strong className="text-neutral-300">Visual:</strong> {scene.visual}</p>
                                <p className="text-neutral-200 mt-1"><strong>🎙️ Diálogo:</strong> {scene.dialogue}</p>
                            </div>))}
                        </div>
                        <div className="bg-neutral-900 p-3 rounded-md mt-4"><h4 className="font-semibold text-blue-400 mb-1">CTA</h4><p className="text-neutral-200 font-semibold">{script.cta}</p></div>
                    </div>
                </>
             );
        } else if ('headline' in result) {
            const copy = result as CopywritingResult;
            return (
                <>
                    <div className="space-y-4 text-sm bg-neutral-900 p-4 rounded-md flex-grow">
                        <div><h4 className="font-semibold text-blue-400 mb-1 text-base">Headline</h4><p className="text-neutral-200 font-bold text-lg">{copy.headline}</p></div>
                        <div className="border-t border-neutral-700 pt-4"><h4 className="font-semibold text-blue-400 mb-1 text-base">Corpo</h4><p className="text-neutral-300 whitespace-pre-wrap">{copy.body}</p></div>
                        <div className="border-t border-neutral-700 pt-4"><h4 className="font-semibold text-blue-400 mb-1 text-base">CTA</h4><p className="text-neutral-200 font-semibold">{copy.cta}</p></div>
                    </div>
                </>
            );
        }
        return null;
    }

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Estúdio de Conteúdo</h2>
                    <p className="text-neutral-400 mt-1">Crie diversos formatos de conteúdo para fortalecer sua marca pessoal.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="contentType" className="block text-sm font-medium text-neutral-300 mb-1">Qual conteúdo você quer criar?</label>
                                    <select id="contentType" value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)} className={inputClasses}>
                                        <option>Post</option>
                                        <option>Copy</option>
                                        <option>Roteiro de Vídeo</option>
                                        <option>Carrossel</option>
                                    </select>
                                </div>
                                {renderSubtypeAndInputs()}
                                <div className="flex items-center pt-2">
                                    <input id="useGlobalContextContent" type="checkbox" checked={useGlobalContext} onChange={(e) => setUseGlobalContext(e.target.checked)} className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black" />
                                    <label htmlFor="useGlobalContextContent" className="ml-2 block text-sm text-neutral-300">Usar Contexto Global da Marca</label>
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-4">
                                    Gerar Conteúdo
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                    <div className="h-full">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400">{error}</p>}
                        {result && (
                            <Card className="h-full flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Conteúdo Gerado</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 flex-grow overflow-hidden">
                                    {renderResult()}
                                </CardContent>
                                <CardContent>
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
                onDelete={(id) => appContext.removeFromHistory('contentStudio', id)}
                onClear={() => appContext.clearHistory('contentStudio')}
            />
        </div>
    );
};

export default ContentStudio;