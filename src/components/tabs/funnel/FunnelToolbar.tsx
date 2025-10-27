import React from 'react';
import { FunnelStage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EyeIcon, CursorArrowRaysIcon, ShoppingCartIcon, TrophyIcon } from '@/components/icons/Icons';

interface FunnelToolbarProps {
    onAddStage: (stage: Omit<FunnelStage, 'id'>) => void;
}

const defaultStages: Omit<FunnelStage, 'id'>[] = [
    { title: 'Conscientização', description: 'Atrair a atenção do público-alvo e torná-los cientes do seu produto ou serviço.', icon: 'EyeIcon' },
    { title: 'Interesse & Consideração', description: 'Nutrir leads, demonstrar o valor da sua solução e se diferenciar dos concorrentes.', icon: 'CursorArrowRaysIcon' },
    { title: 'Conversão', description: 'Incentivar a compra ou a ação desejada com ofertas claras e um processo simples.', icon: 'ShoppingCartIcon' },
    { title: 'Retenção & Lealdade', description: 'Fidelizar clientes existentes, incentivando a recompra e a defesa da marca.', icon: 'TrophyIcon' },
];

const FunnelToolbar: React.FC<FunnelToolbarProps> = ({ onAddStage }) => {
    
    const iconMap = {
        EyeIcon,
        CursorArrowRaysIcon,
        ShoppingCartIcon,
        TrophyIcon
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Adicionar Etapa</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {defaultStages.map((stage) => {
                        const Icon = iconMap[stage.icon];
                        return (
                            <button
                                key={stage.title}
                                onClick={() => onAddStage(stage)}
                                className="w-full text-left p-3 bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors flex items-start gap-3"
                            >
                                <Icon className="w-5 h-5 mt-0.5 text-blue-400 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-neutral-200">{stage.title}</p>
                                    <p className="text-xs text-neutral-400">{stage.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default FunnelToolbar;