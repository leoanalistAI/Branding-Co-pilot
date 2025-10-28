import { useState, useEffect, FC } from 'react';
import { AppContext, FunnelStage, FunnelStageSuggestions, Source } from '@/types';
import FunnelToolbar from './FunnelToolbar';
import FunnelNode from './FunnelNode';
import SuggestionsModal from './SuggestionsModal';
import { FunnelIcon } from '@/components/icons/Icons';

interface FunnelBuilderProps {
    appContext: AppContext;
}

const FunnelBuilder: FC<FunnelBuilderProps> = ({ appContext }) => {
    const [stages, setStages] = useState<FunnelStage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<FunnelStage | null>(null);

    // Clear results when active brand changes
    useEffect(() => {
        setStages([]);
    }, [appContext.activeBrandId]);
    
    const saveFunnelToHistory = (currentStages: FunnelStage[]) => {
        if (!appContext.activeBrandId || currentStages.length === 0) return;
        
        appContext.addToHistory('funnel', {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            type: 'Jornada da Audiência',
            summary: `${currentStages.length} etapas`,
            result: { stages: currentStages },
        });
    }

    const addStage = (stage: Omit<FunnelStage, 'id'>) => {
        const newStages = [...stages, { ...stage, id: `stage-${Date.now()}` }];
        setStages(newStages);
        saveFunnelToHistory(newStages);
    };

    const updateStage = (id: string, newTitle: string, newDescription: string) => {
        const newStages = stages.map(s => s.id === id ? { ...s, title: newTitle, description: newDescription } : s);
        setStages(newStages);
        saveFunnelToHistory(newStages);
    };

    const removeStage = (id: string) => {
        const newStages = stages.filter(s => s.id !== id);
        setStages(newStages);
        saveFunnelToHistory(newStages);
    };

    const moveStage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === stages.length - 1) return;

        const newStages = [...stages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
        setStages(newStages);
        saveFunnelToHistory(newStages);
    };

    const handleGetSuggestions = (stage: FunnelStage) => {
        setSelectedStage(stage);
        setIsModalOpen(true);
    };

    const handleUpdateStageSuggestions = (stageId: string, suggestions: FunnelStageSuggestions, sources: Source[]) => {
        const newStages = stages.map(s => 
            s.id === stageId ? { ...s, suggestions, sources } : s
        );
        setStages(newStages);
        saveFunnelToHistory(newStages);
        // Also update the selected stage if it's the one being modified
        if (selectedStage?.id === stageId) {
            setSelectedStage(prev => prev ? { ...prev, suggestions, sources } : null);
        }
    };

    return (
        <div className="p-6 lg:p-8 h-full">
            <header className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-100">Construtor de Jornada da Audiência</h2>
                <p className="text-neutral-400 mt-1">Mapeie a jornada do seu seguidor, de desconhecido a fã da sua marca.</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <FunnelToolbar onAddStage={addStage} />
                </div>
                <div className="lg:col-span-2">
                    <div className="space-y-4">
                        {stages.map((stage, index) => (
                            <FunnelNode
                                key={stage.id}
                                stage={stage}
                                index={index}
                                totalStages={stages.length}
                                onUpdate={updateStage}
                                onRemove={removeStage}
                                onMove={moveStage}
                                onGetSuggestions={handleGetSuggestions}
                            />
                        ))}
                        {stages.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-neutral-700 rounded-lg">
                                <FunnelIcon className="mx-auto h-12 w-12 text-neutral-500" />
                                <h3 className="mt-2 text-sm font-medium text-neutral-200">Sua jornada está vazia</h3>
                                <p className="mt-1 text-sm text-neutral-400">Adicione etapas usando o painel ao lado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedStage && (
                <SuggestionsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    stage={selectedStage}
                    appContext={appContext}
                    onUpdateSuggestions={handleUpdateStageSuggestions}
                />
            )}
        </div>
    );
};

export default FunnelBuilder;