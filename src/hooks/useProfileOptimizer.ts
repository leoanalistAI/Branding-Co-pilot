import { useState, useEffect, useCallback, useRef } from 'react';
import { optimizeProfileService } from '@/services/aiService';
import { AppContext, OptimizedProfile, HistoryItem } from '@/types';
import { fileToBase64, downloadAsMarkdown } from '@/utils/fileUtils';

export const useProfileOptimizer = (appContext: AppContext, history: HistoryItem[]) => {
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    const getPlatformInstruction = useCallback(() => {
        switch (platform) {
            case 'LinkedIn':
                return 'Para uma análise completa, inclua no print sua foto de capa, foto de perfil, título e o início da sua seção "Sobre".';
            case 'Instagram':
                return 'Para uma análise completa, inclua no print sua foto de perfil, nome, @usuario, bio e o link na bio.';
            default:
                return 'Envie um print da tela principal do seu perfil para uma análise completa.';
        }
    }, [platform]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
            const contextForApi = useGlobalContext ? appContext : { ...appContext, brandDna: null };
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
        } catch (err: any) {
            setError(err.message || 'Falha ao otimizar o perfil. Por favor, tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, platform, currentBio, useGlobalContext, appContext]);

    const handleHistorySelect = useCallback((item: HistoryItem) => {
        setCurrentBio(item.inputs.currentBio);
        setPlatform(item.inputs.platform);
        setUseGlobalContext(item.inputs.useGlobalContext ?? true);
        setResult(item.result.data);
        setImageFile(null);
        setImagePreview(null);
    }, []);

    const handleDownload = useCallback(() => {
        if (!result) return;
        
        let content = `# Análise de Perfil para ${platform}\n\n`;
        content += `## Biografia Otimizada\n\n\`\`\`\n${result.bio}\n\`\`\`\n\n`;
        content += `## Sugestões de Melhoria\n\n`;
        content += `### Foto de Perfil\n- ${result.suggestions.profilePicture.join('\n- ')}\n\n`;
        content += `### Banner/Capa\n- ${result.suggestions.banner.join('\n- ')}\n\n`;
        content += `### Título/Headline\n- ${result.suggestions.headline.join('\n- ')}\n\n`;
        content += `### Geral\n- ${result.suggestions.general.join('\n- ')}\n\n`;

        downloadAsMarkdown(content, `otimizacao-perfil-${platform.toLowerCase()}`);
    }, [result, platform]);

    return {
        currentBio, setCurrentBio,
        platform, setPlatform,
        imageFile, imagePreview,
        useGlobalContext, setUseGlobalContext,
        result, isLoading, error,
        fileInputRef,
        handleFileChange,
        getPlatformInstruction,
        handleSubmit,
        handleHistorySelect,
        handleDownload,
    };
};