import { useState, useCallback, useEffect } from 'react';
import { analyzeCompetitorsService } from '@/services/aiService';
import { AppContext, CompetitorAnalysis, HistoryItem } from '@/types';
import { downloadAsMarkdown } from '@/utils/fileUtils';

export const useCompetitorAnalyzer = (appContext: AppContext, history: HistoryItem[]) => {
    const [competitorHandles, setCompetitorHandles] = useState('');
    const [result, setResult] = useState<CompetitorAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setResult(null);
    }, [appContext.activeBrandId]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appContext.brandDna) {
            setError("Por favor, gere um DNA da Marca primeiro.");
            return;
        }
        if (!competitorHandles.trim()) {
            setError("Por favor, insira pelo menos um perfil concorrente.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        const handles = competitorHandles.split(',').map(h => h.trim()).filter(Boolean);

        try {
            const data = await analyzeCompetitorsService(appContext.brandDna, handles);
            setResult(data);
            appContext.addToHistory('competitor', {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                type: 'Análise de Mercado',
                summary: `Análise de ${handles.length} concorrentes`,
                inputs: { competitorHandles },
                result: { data },
            });
        } catch (err: any) {
            setError(err.message || 'Falha ao analisar os concorrentes.');
        } finally {
            setIsLoading(false);
        }
    }, [appContext, competitorHandles]);

    const handleHistorySelect = useCallback((item: HistoryItem) => {
        setCompetitorHandles(item.inputs.competitorHandles);
        setResult(item.result.data);
    }, []);

    const handleDownload = useCallback(() => {
        if (!result) return;
        let content = `# Análise de Mercado\n\n`;
        content += `## Análise Competitiva\n\n${result.competitiveAnalysis}\n\n`;
        content += `## Análise de Gaps\n\n${result.gapAnalysis}\n\n`;
        content += `## Recomendações Estratégicas\n\n${result.strategicRecommendations}\n\n`;
        content += `## Sugestões de Conteúdo Inovador\n\n`;
        result.contentSuggestions.forEach(suggestion => {
            content += `### ${suggestion.title}\n- **Formato:** ${suggestion.format}\n- **Descrição:** ${suggestion.description}\n\n`;
        });

        downloadAsMarkdown(content, `analise-mercado`);
    }, [result]);

    return {
        competitorHandles, setCompetitorHandles,
        result, isLoading, error,
        handleSubmit,
        handleHistorySelect,
        handleDownload,
        isBrandDnaReady: !!appContext.brandDna,
    };
};