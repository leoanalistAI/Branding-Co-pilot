import { FC, useState } from 'react';
import { AppContext } from '@/types';
import { supabase } from '@/src/integrations/supabase/client';
import { ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';

interface ContextSummaryProps {
    context: AppContext;
    onChangeApiKey: () => void;
}

const ContextSummary: FC<ContextSummaryProps> = ({ context, onChangeApiKey }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="p-4 bg-neutral-950/50 border-t border-neutral-800">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h4 className="text-sm font-semibold text-neutral-200">Contexto Ativo</h4>
                <button className="p-1 text-neutral-400 hover:text-white">
                    {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
                </button>
            </div>
            {isExpanded && (
                <div className="mt-2">
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
                    <div className="flex items-center justify-between mt-3">
                        <button
                            onClick={onChangeApiKey}
                            className="text-xs text-neutral-500 hover:text-blue-400 p-1"
                        >
                            Trocar Chave de API
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="text-xs text-neutral-500 hover:text-red-400 p-1"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContextSummary;