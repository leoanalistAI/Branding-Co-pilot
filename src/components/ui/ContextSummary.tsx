import { useAppContext } from '../../context/AppContext';
import { Cog6ToothIcon, ChevronDownIcon, ChevronUpIcon } from '../icons/Icons';

interface ContextSummaryProps {
    onChangeApiKey: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const ContextSummary: React.FC<ContextSummaryProps> = ({ onChangeApiKey, isCollapsed, onToggleCollapse }) => {
    const { brandDna, activeBrandId, history } = useAppContext();
    const activeBrand = history.dna.find(item => item.id === activeBrandId);

    return (
        <div className="p-4 border-t border-neutral-800 bg-black">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {brandDna ? brandDna.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-neutral-100 truncate">
                            {brandDna ? brandDna.name : "Nenhuma marca ativa"}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">
                            {brandDna ? brandDna.brandStatement : "Crie ou selecione um DNA de marca"}
                        </p>
                    </div>
                </div>
                <button onClick={onToggleCollapse} className="p-1 text-neutral-400 hover:text-white">
                    {isCollapsed ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </button>
            </div>
            
            {!isCollapsed && (
                 <div className="mt-4 pt-4 border-t border-neutral-800">
                    <button 
                        onClick={onChangeApiKey} 
                        className="w-full flex items-center justify-center gap-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Gerenciar Chave de API</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContextSummary;