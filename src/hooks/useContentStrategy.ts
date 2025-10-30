import { useState, useCallback, useEffect } from 'react';
import { generateContentStrategyService } from '@/services/aiService';
import { AppContext, ContentStrategy, HistoryItem } from '@/types';
import { downloadAsMarkdown } from '@/utils/fileUtils';

export const useContentStrategy = (appContext: AppContext, history: HistoryItem[]) => {
    const [goal, setGoal] = useState('Aumentar o engajamento');
    const [format, setFormat] = useState('Carrossel');
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState<ContentStrategy | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setResult(null); // Clear results when brand context changes
    }, [appContext.activeBrandId]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appContext.brandDna) {
            setError("Por favor, gere um DNA da Marca primeiro.");
            return;
        }
        if (!topic) {
            setError("Por favor, insira um tópico ou ideia.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await generateContentStrategyService(appContext.brandDna, goal, format, topic);
            setResult(data);
            appContext.addToHistory('strategy', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Estratégia de Conteúdo',
                summary: data.title,
                inputs: { goal, format, topic },
                result: { data },
            });
        } catch (err: any) {
            setError(err.message || 'Falha ao gerar a estratégia.');
        } finally {
            setIsLoading(false);
        }
    }, [appContext, goal, format, topic]);

    const handleHistorySelect = useCallback((item: HistoryItem) => {
        setGoal(item.inputs.goal);
        setFormat(item.inputs.format);
        setTopic(item.inputs.topic);
        setResult(item.result.data);
    }, []);

    const handleDownload = useCallback(() => {
        if (!result) return;
        let content = `# ${result.title}\n\n`;
        content += `**Formato:** ${result.format}\n`;
        content += `**Objetivo:** ${result.goal}\n\n`;
        content += `## Roteiro/Estrutura\n\n`;
        result.script.forEach(item => {
            content += `### ${item.part}\n${item.content}\n\n`;
            if (item.visualSuggestion) {
                content += `*Sugestão Visual:* ${item.visualSuggestion}\n\n`;
            }
        });
        content += `## Sugestões de CTA (Call to Action)\n- ${result.ctaSuggestions.join('\n- ')}\n\n`;
        content += `## Hashtags Recomendadas\n${result.hashtags.join(' ')}\n`;

        downloadAsMarkdown(content, `estrategia-${result.title.replace(/\s+/g, '-').toLowerCase()}`);
    }, [result]);

    return {
        goal, setGoal,
        format, setFormat,
        topic, setTopic,
        result, isLoading, error,
        handleSubmit,
        handleHistorySelect,
        handleDownload,
        isBrandDnaReady: !!appContext.brandDna,
    };
};