import { useState, useEffect, useRef, FC, ChangeEvent, FormEvent } from 'react';
import { optimizeProfileService } from '@/src/services/aiService';
import { AppContext, OptimizedProfile, HistoryItem } from '@/types';
import { fileToBase64, downloadAsMarkdown } from '@/utils/fileUtils';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import HistorySidebar from '@/components/ui/HistorySidebar';
import { PhotoIcon, ArrowDownTrayIcon } from '@/components/icons/Icons';

interface ProfileOptimizerProps {
    appContext: AppContext;
    history: HistoryItem[];
}

const ProfileOptimizer: FC<ProfileOptimizerProps> = ({ appContext, history }) => {
    const [currentBio, setCurrentBio] = useState('');
    const [platform, setPlatform] = useState('Instagram');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [useGlobalContext, setUseGlobalContext] = useState(true);
    const [result, setResult] = useState<OptimizedProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        setResult(null);
        setImageFile(null);
        setImagePreview(null);
    }, [appContext.activeBrandId]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const getPlatformInstruction = () => {
        switch (platform) {
            case 'LinkedIn':
                return 'Para uma análise completa, inclua no print sua foto de capa, foto de perfil, título e o início da sua seção "Sobre".';
            case 'Instagram':
                return 'Para uma análise completa, inclua no print sua foto de perfil, nome, @usuario, bio e o link na bio.';
            default:
                return 'Envie um print da tela principal do seu perfil para uma análise completa.';
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!imageFile) {
            setError('Por favor, envie um print do seu perfil.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const imageBase64 = await fileToBase64(imageFile);
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandFoundation: null };
            const data = await optimizeProfileService(platform, imageBase64, imageFile.type, currentBio, contextForApi);
            setResult(data);
            
            appContext.addToHistory('profile', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Otimização de Perfil',
                summary: `Análise para ${platform}`,
                inputs: { currentBio, platform, useGlobalContext, fileName: imageFile.name },
                result: { data },
            });
        } catch (err) {
            setError('Falha ao otimizar o perfil. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleHistorySelect = (item: any) => {
        setCurrentBio(item.inputs.currentBio);
        setPlatform(item.inputs.platform);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result.data);
        setImageFile(null);
        setImagePreview(null);
    };
    
    const handleDownload = () => {
        if (!result) return;
        
        let content = `# Análise de Perfil para ${platform}\n\n`;
        content += `## Biografia Otimizada\n\n\`\`\`\n${result.bio}\n\`\`\`\n\n`;
        content += `## Sugestões de Melhoria\n\n`;
        content += `### Foto de Perfil\n- ${result.suggestions.profilePicture.join('\n- ')}\n\n`;
        content += `### Banner/Capa\n- ${result.suggestions.banner.join('\n- ')}\n\n`;
        content += `### Título/Headline\n- ${result.suggestions.headline.join('\n- ')}\n\n`;
        content += `### Geral\n- ${result.suggestions.general.join('\n- ')}\n\n`;

        downloadAsMarkdown(content, `otimizacao-perfil-${platform.toLowerCase()}`);
    };

    const inputClasses = "w-full bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-2 transition-colors";

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 lg:p-8 h-full overflow-y-auto">
                <header className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Otimizador de Perfil 360°</h2>
                    <p className="text-neutral-400 mt-1">Receba uma análise completa do seu perfil, incluindo imagem e texto, para criar uma marca pessoal de impacto.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="platform" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Plataforma
                                    </label>
                                    <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClasses}>
                                        <option>Instagram</option>
                                        <option>LinkedIn</option>
                                        <option>Twitter (X)</option>
                                        <option>TikTok</option>
                                        <option>Facebook</option>
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                                        Print do seu Perfil
                                    </label>
                                    <div 
                                        className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-neutral-700 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview do perfil" className="max-h-32 rounded-md object-contain" />
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <PhotoIcon className="mx-auto h-12 w-12 text-neutral-400" />
                                                <p className="text-sm text-neutral-400">Clique para selecionar uma imagem</p>
                                            </div>
                                        )}
                                    </div>
                                    <input ref={fileInputRef} id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    <p className="text-xs text-neutral-500 mt-2">{getPlatformInstruction()}</p>
                                </div>
                                <div>
                                    <label htmlFor="currentBio" className="block text-sm font-medium text-neutral-300 mb-1">
                                        Sua Biografia Atual (Opcional)
                                    </label>
                                    <textarea id="currentBio" value={currentBio} onChange={(e) => setCurrentBio(e.target.value)} rows={3} className={inputClasses} placeholder="Cole sua bio aqui para dar mais contexto à IA." />
                                </div>
                               
                                <div className="flex items-center pt-2">
                                    <input id="useGlobalContextProfile" type="checkbox" checked={useGlobalContext} onChange={(e) => setUseGlobalContext(e.target.checked)} className="h-4 w-4 rounded border-neutral-600 bg-neutral-900 text-blue-600 focus:ring-blue-600 focus:ring-offset-black" />
                                    <label htmlFor="useGlobalContextProfile" className="ml-2 block text-sm text-neutral-300">Usar Contexto Global da Marca</label>
                                </div>
                                <Button type="submit" isLoading={isLoading} className="w-full !mt-4">
                                    Otimizar Perfil
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
                                        <CardTitle>Análise para {platform}</CardTitle>
                                        <Button size="sm" variant="secondary" onClick={handleDownload} icon={<ArrowDownTrayIcon className="w-4 h-4" />}>
                                            Baixar
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4 overflow-y-auto">
                                    <div>
                                        <h4 className="font-semibold text-blue-400 mb-2">Biografia Otimizada</h4>
                                        <div className="bg-neutral-900 p-4 rounded-md">
                                            <p className="text-neutral-200 whitespace-pre-wrap">{result.bio}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-blue-400 mb-2">Sugestões de Melhoria</h4>
                                        {result.suggestions.profilePicture.length > 0 && <div><h5 className="font-bold text-neutral-200 text-sm">Foto de Perfil</h5><ul className="list-disc list-inside text-neutral-300 text-sm space-y-1 mt-1">{result.suggestions.profilePicture.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                                        {result.suggestions.banner.length > 0 && <div><h5 className="font-bold text-neutral-200 text-sm">Banner/Capa</h5><ul className="list-disc list-inside text-neutral-300 text-sm space-y-1 mt-1">{result.suggestions.banner.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                                        {result.suggestions.headline.length > 0 && <div><h5 className="font-bold text-neutral-200 text-sm">Título/Headline</h5><ul className="list-disc list-inside text-neutral-300 text-sm space-y-1 mt-1">{result.suggestions.headline.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
                                        {result.suggestions.general.length > 0 && <div><h5 className="font-bold text-neutral-200 text-sm">Geral</h5><ul className="list-disc list-inside text-neutral-300 text-sm space-y-1 mt-1">{result.suggestions.general.map((s, i) => <li key={i}>{s}</li>)}</ul></div>}
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
                onDelete={(id) => appContext.removeFromHistory('profile', id)}
                onClear={() => appContext.clearHistory('profile')}
            />
        </div>
    );
};

export default ProfileOptimizer;