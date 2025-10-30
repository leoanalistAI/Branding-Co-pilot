import { useState, useCallback } from 'react';
import { generateContentService } from '@/services/aiService';
import { AppContext, BrandDna, GeneratedContent, Source } from '@/types';

export const useContentFactory = (appContext: AppContext) => {
    const [platform, setPlatform] = useState<'instagram' | 'linkedin'>('instagram');
    const [contentType, setContentType] = useState<'post' | 'story' | 'reels'>('post');
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<GeneratedContent[] | null>(null);
    const [sources, setSources] = useState<Source[]>([]);

    const brandDna = appContext.brandDna;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!brandDna) {
            setError("Por favor, gere um DNA da Marca primeiro.");
            return;
        }
        if (!topic) {
            setError("Por favor, insira um tópico para o conteúdo.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setSources([]);

        try {
            const { data, sources } = await generateContentService(brandDna, platform, contentType, topic);
            setGeneratedContent(data);
            setSources(sources);
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar o conteúdo.');
        } finally {
            setIsLoading(false);
        }
    }, [brandDna, platform, contentType, topic]);

    return {
        platform,
        setPlatform,
        contentType,
        setContentType,
        topic,
        setTopic,
        isLoading,
        error,
        generatedContent,
        sources,
        handleSubmit,
        isBrandDnaReady: !!brandDna,
    };
};