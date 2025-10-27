import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/integrations/supabase/client';
import TabButton from './components/ui/TabButton';
import ContextSummary from './components/ui/ContextSummary';
import FoundationAndPersonas from './components/tabs/FoundationAndPersonas';
import ContentStudio from './components/tabs/ContentStudio';
import ProductDeveloper from './components/tabs/ProductDeveloper';
import MarketingBrainstorm from './components/tabs/MarketingBrainstorm';
import EditorialCalendar from './components/tabs/EditorialCalendar';
import CompetitorAnalyzer from './components/tabs/CompetitorAnalyzer';
import FunnelBuilder from './components/tabs/funnel/FunnelBuilder';
import VideoAnalyzer from './components/tabs/VideoAnalyzer';
import SeoAssistant from './components/tabs/SeoAssistant';
import ImageGenerator from './components/tabs/ImageGenerator';
import LandingPage from './components/landing/LandingPage';
import ProfileOptimizer from './components/tabs/ProfileOptimizer';
import ApiKeySetup from './components/setup/ApiKeySetup';
import Login from './src/pages/Login';
import {
    IdentificationIcon,
    CubeIcon,
    PencilSquareIcon,
    LightBulbIcon,
    CalendarDaysIcon,
    UsersIcon,
    FunnelIcon,
    VideoCameraIcon,
    MenuIcon,
    XMarkIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    PhotoIcon,
    UserCircleIcon,
} from './components/icons/Icons';
import { AppContext, BrandDna, HistoryState, HistoryItem } from './types';

type Tab =
    | 'dna'
    | 'profile'
    | 'contentStudio'
    | 'product'
    | 'brainstorm'
    | 'calendar'
    | 'competitor'
    | 'funnel'
    | 'video'
    | 'seo'
    | 'image';

type AppState = 'landing' | 'main';
    
const APP_STATE_KEY = 'brandingCopilotAppState_v2';
const HISTORY_KEY = 'brandingCopilotHistory_v2';
export const API_KEY_STORAGE_KEY = 'brandingCopilotApiKey_v1';


const App: React.FC = () => {
    const [appState, setAppState] = React.useState<AppState>('landing');
    const [session, setSession] = React.useState<Session | null>(null);
    const [apiKey, setApiKey] = React.useState<string | null>(() => {
        try {
            return localStorage.getItem(API_KEY_STORAGE_KEY);
        } catch {
            return null;
        }
    });
    const [activeTab, setActiveTab] = React.useState<Tab>('dna');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [prefillData, setPrefillData] = React.useState<{ tab: string; data: any } | null>(null);
    const [activeBrandId, setActiveBrandId] = React.useState<string | null>(null);

    const [history, setHistory] = React.useState<HistoryState>(() => {
        try {
            const savedHistory = localStorage.getItem(HISTORY_KEY);
            const parsed = savedHistory ? JSON.parse(savedHistory) : null;
            if (parsed && parsed.dna && parsed.brandHistories) {
                return parsed;
            }
            return { dna: [], brandHistories: {} };
        } catch (error) {
            console.error("Could not load history from localStorage", error);
            return { dna: [], brandHistories: {} };
        }
    });
    
    const [brandDna, setBrandDna] = React.useState<BrandDna | null>(null);

    React.useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    React.useEffect(() => {
        try {
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
        }
    }, [history.dna]);

    React.useEffect(() => {
        try {
            const stateToSave = {
                activeTab,
                activeBrandId,
            };
            localStorage.setItem(APP_STATE_KEY, JSON.stringify(stateToSave));
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
            setApiKey(key);
        } catch (error) {
            console.error("Could not save API key to localStorage", error);
        }
    };

    const handleChangeApiKey = () => {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKey(null);
    };

    const setActiveBrand = (item: HistoryItem | null) => {
        if (item) {
            setActiveBrandId(item.id);
            setBrandDna(item.result.dna);
        } else {
            setActiveBrandId(null);
            setBrandDna(null);
        }
    };

    const addToHistory = (tab: string, item: HistoryItem) => {
        setHistory(prev => {
            const newHistory = JSON.parse(JSON.stringify(prev));
            if (tab === 'dna') {
                const existingIndex = newHistory.dna.findIndex(h => h.id === item.id);
                if (existingIndex > -1) {
                     newHistory.dna[existingIndex] = item;
                } else {
                    newHistory.dna.unshift(item);
                }
            } else if (activeBrandId) {
                if (!newHistory.brandHistories[activeBrandId]) {
                    newHistory.brandHistories[activeBrandId] = {};
                }
                if (!newHistory.brandHistories[activeBrandId][tab]) {
                    newHistory.brandHistories[activeBrandId][tab] = [];
                }
                const existingIndex = newHistory.brandHistories[activeBrandId][tab].findIndex(h => h.id === item.id);
                 if (existingIndex > -1) {
                    newHistory.brandHistories[activeBrandId][tab][existingIndex] = item;
                 } else {
                    newHistory.brandHistories[activeBrandId][tab].unshift(item);
                 }
                newHistory.brandHistories[activeBrandId][tab] = newHistory.brandHistories[activeBrandId][tab].slice(0, 20);
            }
            return newHistory;
        });
    };
    
    const removeFromHistory = (tab: string, itemId: string) => {
        setHistory(prev => {
            const newHistory = { ...prev };
            if (tab === 'dna') {
                newHistory.dna = newHistory.dna.filter(item => item.id !== itemId);
                if (newHistory.brandHistories[itemId]) {
                    delete newHistory.brandHistories[itemId];
                }
                if (activeBrandId === itemId) {
                    setActiveBrandId(null);
                    setBrandDna(null);
                }
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
                setActiveBrandId(null);
                setBrandDna(null);
            } else if (activeBrandId && newHistory.brandHistories[activeBrandId]?.[tab]) {
                newHistory.brandHistories[activeBrandId][tab] = [];
            }
            return { ...newHistory };
        });
    };

    const appContext: AppContext = {
        brandDna: brandDna,
        activeBrandId: activeBrandId,
        history: history,
        prefillData: prefillData,
        setPrefillData: (tab, data) => {
            setPrefillData({ tab, data });
            setActiveTab(tab as Tab);
        },
        clearPrefillData: () => {
            setPrefillData(null);
        },
        setActiveBrand: setActiveBrand,
        addToHistory: addToHistory,
        removeFromHistory: removeFromHistory,
        clearHistory: clearHistory,
    };

    React.useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isSidebarOpen]);

    const handleTabClick = (tabId: Tab) => {
        setActiveTab(tabId);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    };

    const isFoundationSet = !!appContext.brandDna;
    
    const getHistoryForTab = (tabId: string): HistoryItem[] => {
        if (tabId === 'dna') {
            return appContext.history.dna || [];
        }
        if (!activeBrandId) {
            return [];
        }
        return appContext.history.brandHistories[activeBrandId]?.[tabId] || [];
    }

    const tabs = [
        { id: 'dna', label: 'DNA da Marca Pessoal', icon: IdentificationIcon, component: <FoundationAndPersonas appContext={appContext} /> },
        { id: 'profile', label: 'Otimizador de Perfil', icon: UserCircleIcon, component: <ProfileOptimizer appContext={appContext} history={getHistoryForTab('profile')} />, disabled: !isFoundationSet },
        { id: 'contentStudio', label: 'Estúdio de Conteúdo', icon: PencilSquareIcon, component: <ContentStudio appContext={appContext} history={getHistoryForTab('contentStudio')} />, disabled: !isFoundationSet },
        { id: 'seo', label: 'SEO Pessoal', icon: MagnifyingGlassIcon, component: <SeoAssistant appContext={appContext} history={getHistoryForTab('seo')} />, disabled: !isFoundationSet },
        { id: 'image', label: 'Gerador de Imagens', icon: PhotoIcon, component: <ImageGenerator appContext={appContext} history={getHistoryForTab('image')} />, disabled: !isFoundationSet },
        { id: 'product', label: 'Crie produtos e/ou serviços', icon: CubeIcon, component: <ProductDeveloper appContext={appContext} history={getHistoryForTab('product')} />, disabled: !isFoundationSet },
        { id: 'brainstorm', label: 'Brainstorm de Marca', icon: LightBulbIcon, component: <MarketingBrainstorm appContext={appContext} history={getHistoryForTab('brainstorm')} />, disabled: !isFoundationSet },
        { id: 'calendar', label: 'Calendário Editorial', icon: CalendarDaysIcon, component: <EditorialCalendar appContext={appContext} history={getHistoryForTab('calendar')} />, disabled: !isFoundationSet },
        { id: 'competitor', label: 'Análise de Influência', icon: UsersIcon, component: <CompetitorAnalyzer appContext={appContext} history={getHistoryForTab('competitor')} />, disabled: !isFoundationSet },
        { id: 'funnel', label: 'Jornada da Audiência', icon: FunnelIcon, component: <FunnelBuilder appContext={appContext} />, disabled: !isFoundationSet },
        { id: 'video', label: 'Analisador de Vídeo', icon: VideoCameraIcon, component: <VideoAnalyzer appContext={appContext} history={getHistoryForTab('video')} />, disabled: !isFoundationSet },
    ];
    
    if (appState === 'landing') {
        return <LandingPage onStart={() => setAppState('main')} />;
    }

    if (!session) {
        return <Login />;
    }

    if (!apiKey) {
        return <ApiKeySetup onKeySubmit={handleKeySubmit} />;
    }

    const activeComponent = tabs.find(tab => tab.id === activeTab)?.component;
    const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label;

    const sidebarContent = (
      <>
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                 <div className="bg-neutral-800 p-2 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold text-neutral-50">Branding Copilot</h1>
                    <p className="text-xs text-neutral-500">Potencializado por Gemini</p>
                </div>
            </div>
             <button
                className="md:hidden p-1 text-neutral-400 hover:text-white"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Fechar menu"
            >
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
            {tabs.map(tab => (
                <TabButton
                    key={tab.id}
                    label={tab.label}
                    icon={tab.icon}
                    isActive={activeTab === tab.id}
                    onClick={() => handleTabClick(tab.id as Tab)}
                    disabled={tab.disabled}
                />
            ))}
        </nav>
        <ContextSummary context={appContext} onChangeApiKey={handleChangeApiKey} />
      </>
    );

    return (
        <div className="bg-black text-neutral-300 min-h-screen font-sans">
            <div className="flex h-screen overflow-hidden">
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                
                <aside className={`fixed top-0 left-0 w-72 h-full bg-black flex flex-col border-r border-neutral-800 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                   {sidebarContent}
                </aside>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <header className="md:hidden sticky top-0 bg-black/80 backdrop-blur-lg z-20 flex items-center justify-between p-4 border-b border-neutral-800">
                         <button
                            className="p-1 text-neutral-400 hover:text-white"
                            onClick={() => setIsSidebarOpen(true)}
                            aria-label="Abrir menu"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-semibold text-white truncate">{activeTabLabel}</h2>
                        <div className="w-6"></div>
                    </header>

                    <main className="flex-1 overflow-y-auto">
                        {activeComponent}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default App;