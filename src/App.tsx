import React from 'react';
import LandingPage from './components/landing/LandingPage';
import ApiKeySetup from './components/setup/ApiKeySetup';
import TabButton from './components/ui/TabButton';
import ContextSummary from './components/ui/ContextSummary';
import FundacaoEPersonas from './components/tabs/FundacaoEPersonas';
import FabricaDeConteudos from './components/tabs/FabricaDeConteudos';
import EstrategiaDeConteudo from './components/tabs/EstrategiaDeConteudo';
import AnalisadorDeConcorrencia from './components/tabs/AnalisadorDeConcorrencia';
import OtimizadorDePerfil from './components/tabs/OtimizadorDePerfil';
import { AppContext, BrandDna, HistoryState, HistoryItem } from './types';
import {
    IdentificationIcon, PencilSquareIcon, LightBulbIcon, UsersIcon, MenuIcon,
    XMarkIcon, SparklesIcon, UserCircleIcon
} from './components/icons';

type TabId = 'dna' | 'profile' | 'contentStudio' | 'strategy' | 'competitor';
type AppState = 'landing' | 'apiKey' | 'main';

const APP_STATE_KEY = 'brandingCopilotAppState_v2';
const HISTORY_KEY = 'brandingCopilotHistory_v2';
export const API_KEY_STORAGE_KEY = 'brandingCopilotApiKey_v1';

const useAppState = () => {
    const [appState, setAppState] = React.useState<AppState>('landing');
    const [activeTab, setActiveTab] = React.useState<TabId>('dna');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [prefillData, setPrefillData] = React.useState<{ tab: string; data: any } | null>(null);
    const [activeBrandId, setActiveBrandId] = React.useState<string | null>(null);
    const [isContextCollapsed, setIsContextCollapsed] = React.useState(false);

    const [history, setHistory] = React.useState<HistoryState>(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            const parsed = savedHistory ? JSON.parse(savedHistory) : null;
            return (parsed && parsed.dna && parsed.brandHistories) ? parsed : { dna: [], brandHistories: {} };
        } catch (error) {
            console.error("Could not load history from localStorage", error);
            return { dna: [], brandHistories: {} };
        }
    });

    const [brandDna, setBrandDna] = React.useState<BrandDna | null>(null);

    React.useEffect(() => {
        try {
            const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            setAppState(savedApiKey ? 'main' : 'landing');

            const savedState = localStorage.getItem(APP_STATE_KEY);
            if (savedState) {
                const { activeTab: savedActiveTab, activeBrandId: savedActiveBrandId } = JSON.parse(savedState);
                if (savedActiveTab) setActiveTab(savedActiveTab);
                if (savedActiveBrandId) {
                    const activeBrandHistoryItem = history.dna.find(item => item.id === savedActiveBrandId);
                    if (activeBrandHistoryItem) {
                        setActiveBrandId(savedActiveBrandId);
                        setBrandDna(activeBrandHistoryItem.result.dna);
                    }
                }
            }
        } catch (error) {
            console.error("Could not load app state from localStorage", error);
            setAppState('landing');
        }
    }, []);

    React.useEffect(() => {
        try {
            localStorage.setItem(APP_STATE_KEY, JSON.stringify({ activeTab, activeBrandId }));
        } catch (error) {
            console.error("Could not save app state to localStorage", error);
        }
    }, [activeTab, activeBrandId]);

    React.useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Could not save history to localStorage", error);
        }
    }, [history]);

    const handleKeySubmit = (key: string) => {
        try {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setAppState('main');
        } catch (error) {
            console.error("Could not save API key to localStorage", error);
        }
    };

    const handleChangeApiKey = () => {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setActiveBrand(null);
        setAppState('apiKey');
    };

    const setActiveBrand = (item: HistoryItem | null) => {
        setActiveBrandId(item ? item.id : null);
        setBrandDna(item ? item.result.dna : null);
    };

    const addToHistory = (tab: string, item: HistoryItem) => {
        setHistory(prev => {
            const newHistory = JSON.parse(JSON.stringify(prev));
            if (tab === 'dna') {
                const index = newHistory.dna.findIndex((h: HistoryItem) => h.id === item.id);
                if (index > -1) newHistory.dna[index] = item;
                else newHistory.dna.unshift(item);
            } else if (activeBrandId) {
                const brandHistory = newHistory.brandHistories[activeBrandId] || {};
                const tabHistory = brandHistory[tab] || [];
                const index = tabHistory.findIndex((h: HistoryItem) => h.id === item.id);
                if (index > -1) tabHistory[index] = item;
                else tabHistory.unshift(item);
                brandHistory[tab] = tabHistory.slice(0, 20);
                newHistory.brandHistories[activeBrandId] = brandHistory;
            }
            return newHistory;
        });
    };

    const removeFromHistory = (tab: string, itemId: string) => {
        setHistory(prev => {
            const newHistory = { ...prev };
            if (tab === 'dna') {
                newHistory.dna = newHistory.dna.filter(item => item.id !== itemId);
                if (newHistory.brandHistories[itemId]) delete newHistory.brandHistories[itemId];
                if (activeBrandId === itemId) setActiveBrand(null);
            } else if (activeBrandId && newHistory.brandHistories[activeBrandId]?.[tab]) {
                newHistory.brandHistories[activeBrandId][tab] = newHistory.brandHistories[activeBrandId][tab].filter(item => item.id !== itemId);
            }
            return { ...newHistory };
        });
    };

    const clearHistory = (tab: string) => {
        setHistory(prev => {
            const newHistory = { ...prev };
            if (tab === 'dna') {
                newHistory.dna = [];
                newHistory.brandHistories = {};
                setActiveBrand(null);
            } else if (activeBrandId && newHistory.brandHistories[activeBrandId]?.[tab]) {
                newHistory.brandHistories[activeBrandId][tab] = [];
            }
            return { ...newHistory };
        });
    };

    const appContext: AppContext = {
        brandDna, activeBrandId, history, prefillData,
        setPrefillData: (tab, data) => { setPrefillData({ tab, data }); setActiveTab(tab as TabId); },
        clearPrefillData: () => setPrefillData(null),
        setActiveBrand, addToHistory, removeFromHistory, clearHistory,
    };

    return {
        appState, setAppState, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
        isContextCollapsed, setIsContextCollapsed, appContext, handleKeySubmit, handleChangeApiKey
    };
};

const App: React.FC = () => {
    const {
        appState, setAppState, activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
        isContextCollapsed, setIsContextCollapsed, appContext, handleKeySubmit, handleChangeApiKey
    } = useAppState();

    React.useEffect(() => {
        document.body.style.overflow = isSidebarOpen ? 'hidden' : 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isSidebarOpen]);

    const handleTabClick = (tabId: TabId) => {
        setActiveTab(tabId);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    };

    const tabs = [
        { type: 'header', label: 'Fundação' },
        { type: 'button', id: 'dna', label: 'DNA da Marca Pessoal', icon: IdentificationIcon, component: <FundacaoEPersonas appContext={appContext} /> },
        { type: 'header', label: 'Presença' },
        { type: 'button', id: 'profile', label: 'Otimizador de Perfil', icon: UserCircleIcon, component: <OtimizadorDePerfil appContext={appContext} history={appContext.history.brandHistories[appContext.activeBrandId || '']?.['profile'] || []} />, disabled: !appContext.brandDna },
        { type: 'button', id: 'contentStudio', label: 'Estúdio de Conteúdo', icon: PencilSquareIcon, component: <FabricaDeConteudos appContext={appContext} history={appContext.history.brandHistories[appContext.activeBrandId || '']?.['contentStudio'] || []} />, disabled: !appContext.brandDna },
        { type: 'header', label: 'Estratégia' },
        { type: 'button', id: 'strategy', label: 'Estratégia de Conteúdo', icon: LightBulbIcon, component: <EstrategiaDeConteudo appContext={appContext} history={appContext.history.brandHistories[appContext.activeBrandId || '']?.['strategy'] || []} />, disabled: !appContext.brandDna },
        { type: 'header', label: 'Mercado' },
        { type: 'button', id: 'competitor', label: 'Análise de Mercado', icon: UsersIcon, component: <AnalisadorDeConcorrencia appContext={appContext} history={appContext.history.brandHistories[appContext.activeBrandId || '']?.['competitor'] || []} />, disabled: !appContext.brandDna },
    ];

    if (appState === 'landing') return <LandingPage onStart={() => setAppState('apiKey')} />;
    if (appState === 'apiKey') return <ApiKeySetup onKeySubmit={handleKeySubmit} />;

    const activeTabInfo = tabs.find(tab => tab.type === 'button' && tab.id === activeTab) as any;

    const sidebarContent = (
        <>
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-800 p-2 rounded-lg"><SparklesIcon className="w-6 h-6 text-blue-500" /></div>
                    <div>
                        <h1 className="text-lg font-semibold text-neutral-50">Branding Copilot</h1>
                        <p className="text-xs text-neutral-500">Potencializado por Gemini</p>
                    </div>
                </div>
                <button className="md:hidden p-1 text-neutral-400 hover:text-white" onClick={() => setIsSidebarOpen(false)} aria-label="Fechar menu"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                {tabs.map((tab, index) => tab.type === 'header'
                    ? <h3 key={`header-${index}`} className="px-3 pt-4 pb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{tab.label}</h3>
                    : <TabButton key={(tab as any).id} label={(tab as any).label} icon={(tab as any).icon} isActive={activeTab === (tab as any).id} onClick={() => handleTabClick((tab as any).id as TabId)} disabled={(tab as any).disabled} />
                )}
            </nav>
            <ContextSummary context={appContext} onChangeApiKey={handleChangeApiKey} isCollapsed={isContextCollapsed} onToggleCollapse={() => setIsContextCollapsed(!isContextCollapsed)} />
        </>
    );

    return (
        <div className="bg-black text-neutral-300 min-h-screen font-sans">
            <div className="flex h-screen overflow-hidden">
                {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-hidden="true"></div>}
                <aside className={`fixed top-0 left-0 w-72 h-full bg-black flex flex-col border-r border-neutral-800 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {sidebarContent}
                </aside>
                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="md:hidden sticky top-0 bg-black/80 backdrop-blur-lg z-20 flex items-center justify-between p-4 border-b border-neutral-800">
                        <button className="p-1 text-neutral-400 hover:text-white" onClick={() => setIsSidebarOpen(true)} aria-label="Abrir menu"><MenuIcon className="w-6 h-6" /></button>
                        <h2 className="text-lg font-semibold text-white truncate">{activeTabInfo?.label}</h2>
                        <div className="w-6"></div>
                    </header>
                    <main className="flex-1 overflow-y-auto">{activeTabInfo?.component}</main>
                </div>
            </div>
        </div>
    );
};

export default App;