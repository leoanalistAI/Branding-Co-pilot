import React from 'react';
import { AppContext } from '../../types';
import { ChevronUpIcon, ChevronDownIcon } from '../icons/Icons';

interface ContextSummaryProps {
    context: AppContext;
    onChangeApiKey: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const ContextSummary: React.FC<ContextSummaryProps> = ({ context, onChangeApiKey, isCollapsed, onToggleCollapse }) => {
    return (
        <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
            <button onClick={onToggleCollapse} className="w-full flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-neutral-200">Contexto Ativo</h4>
                {isCollapsed ? <ChevronDownIcon className="w-4 h-4 text-neutral-400" /> : <ChevronUpIcon className="w-4 h-4 text-neutral-400" />}
            </button>
             {!isCollapsed && (
                <>
                    {context.brandDna ? (
                        <div className="space-y-2 text-xs text-neutral-400">
                            <p><strong>Marca:</strong> {context.brandDna.name}</p>
                            <p><strong>Voz:</strong> {context.brandDna.voiceAndPersonality}</p>
                            {context.brandDna.pillars && <p><strong>Pilares:</strong> {context.brandDna.pillars.slice(0, 2).join(', ')}...</p>}
                        </div>
                    ) : (
                        <div className="text-xs text-neutral-500">
                            Crie um DNA de Marca para começar.
                        </div>
                    )}
                    <button
                        onClick={onChangeApiKey}
                        className="text-xs text-neutral-500 hover:text-blue-400 w-full text-center mt-3 p-1"
                    >
                        Trocar Chave de API
                    </button>
                </>
             )}
        </div>
    );
};

export default ContextSummary;