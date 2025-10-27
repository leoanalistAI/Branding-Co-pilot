import React, { useState, useEffect, useRef, FC, ChangeEvent, FormEvent } from 'react';
import { AppContext, VideoAnalysisResult, HistoryItem } from '../../types';
import { analyzeVideoService } from '../../services/geminiService';
import { fileToBase64, downloadAsMarkdown } from '../../utils/fileUtils';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Spinner from '../ui/Spinner';
import { VideoCameraIcon, ArrowDownTrayIcon } from '../icons/Icons';
import HistorySidebar from '../ui/HistorySidebar';

interface VideoAnalyzerProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const VideoAnalyzer: FC<VideoAnalyzerProps> = ({ appContext, history }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [userPrompt, setUserPrompt] = useState('');
    const [useGlobalContext, setUseGlobalContext] = useState(true);
    const [result, setResult] = useState<VideoAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clear results when active brand changes
    useEffect(() => {
        setResult(null);
    }, [appContext.activeBrandId]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!videoFile) {
            setError('Por favor, selecione um arquivo de vídeo.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const videoBase64 = await fileToBase64(videoFile);
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
            const analysisResult = await analyzeVideoService(videoBase64, videoFile.type, userPrompt, contextForApi);
            setResult(analysisResult);
            appContext.addToHistory('video', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise de Vídeo',
                summary: userPrompt.substring(0, 40) + '...' || 'Análise de vídeo',
                inputs: { userPrompt, useGlobalContext, videoName: videoFile.name },
                result: analysisResult,
            });
        } catch (err) {
            setError('Falha ao analisar o vídeo. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHistorySelect = (item: any) => {
        setUserPrompt(item.inputs.userPrompt);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result);
        setVideoFile(null); // Can't restore the file from history
    };
    
    const handleDownload = () => {
        if (!result) return;

        let content = `# Análise de Vídeo\n\n`;
        content += `## Insights de Marketing\n- ${result.insights.join('\n- ')}\n\n`;
        content += `---\n\n`;
        content += `## Conteúdo Copiável\n\n`;
        content += `### Título\n${result.copyableContent.title}\n\n`;
        content += `### Gancho Viral\n> ${result.copyableContent.hook}\n\n`;
        content += `### Descrição/Legenda\n${result.copyableContent.description}\n\n`;

        downloadAsMarkdown(content, `analise-video-${videoFile?.name || 'resultado'}`);
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Analisador de Vídeo</h2>
                    <p className="text-neutral-400 mt-1">Extraia insights de marketing e crie conteúdo a partir de vídeos.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Arquivo de Vídeo
                                    </label>
                                    <div 
                                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-md cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="space-y-1 text-center">
                                            <VideoCameraIcon className="mx-auto h-12 w-12 text-neutral-400" />
                                            <div className="flex text-sm text-neutral-400">
                                                <p className="pl-1 truncate">{videoFile ? videoFile.name : 'Clique para selecionar um vídeo'}</p>
                                            </div>
                                            <p className="text-xs text-neutral-500">MP4, MOV, WEBM até 50MB</p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="userPrompt" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Instrução de Análise
                                    </label>
                                    <textarea
                                        id="userPrompt"
                                        value={userPrompt}
                                        onChange={(e) => setUserPrompt(e.target.value)}
                                        rows={4}
                                        className="w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors"
                                        placeholder="Ex: Identifique os principais ganchos deste vídeo para usar no TikTok. Crie uma legenda com base no tema principal."
                                        required
                                    />
                                </div>
                                <div className="flex items-center pt-2">
                                    <input
                                        id="useGlobalContextVideo"
                                        type="checkbox"
                                        checked={useGlobalContext}
                                        onChange={(e) => setUseGlobalContext(e.target.checked)}
                                        className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black"
                                    />
                                    <label htmlFor="useGlobalContextVideo" className="ml-2 block text-sm text-neutral-300">
                                        Usar Contexto Global da Marca
                                    </label>
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-4">
                                    Analisar Vídeo
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="h-full">
                        {isLoading && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                        {error && <p className="text-red-400">{error}</p>}
                        {result && (
                            <Card className="h-full overflow-y-auto">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Análise Concluída</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar Análise
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-blue-400 mb-2">Insights de Marketing</h4>
                                            <ul className="list-disc list-inside text-neutral-300 text-sm space-y-2">
                                                {result.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-neutral-900 p-4 rounded-md space-y-3">
                                            <h4 className="font-semibold text-blue-400">Conteúdo Copiável</h4>
                                            <div>
                                                <label className="text-xs font-bold text-neutral-400">TÍTULO</label>
                                                <p className="text-neutral-100">{result.copyableContent.title}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-neutral-400">DESCRIÇÃO</label>
                                                <p className="text-neutral-300 text-sm">{result.copyableContent.description}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-neutral-400">GANCHO VIRAL</label>
                                                <p className="text-neutral-200 font-medium">{result.copyableContent.hook}</p>
                                            </div>
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
                onDelete={(id) => appContext.removeFromHistory('video', id)}
                onClear={() => appContext.clearHistory('video')}
            />
        </div>
    );
};

export default VideoAnalyzer;