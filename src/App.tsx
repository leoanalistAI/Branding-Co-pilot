import React, { useState, useEffect, FC } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/integrations/supabase/client';
import TabButton from '@/components/ui/TabButton';
import ContextSummary from '@/components/ui/ContextSummary';
import FoundationAndPersonas from '@/src/components/tabs/FoundationAndPersonas';
import ContentStudio from '@/src/components/tabs/ContentStudio';
import ProductDeveloper from '@/src/components/tabs/ProductDeveloper';
import MarketingBrainstorm from '@/src/components/tabs/MarketingBrainstorm';
import EditorialCalendar from '@/src/components/tabs/EditorialCalendar';
import CompetitorAnalyzer from '@/src/components/tabs/CompetitorAnalyzer';
import FunnelBuilder from '@/src/components/tabs/funnel/FunnelBuilder';
import VideoAnalyzer from '@/src/components/tabs/VideoAnalyzer';
import SeoAssistant from '@/src/components/tabs/SeoAssistant';
import ImageGenerator from '@/src/components/tabs/ImageGenerator';
import LandingPage from '@/components/landing/LandingPage';
import ProfileOptimizer from '@/src/components/tabs/ProfileOptimizer';
import ApiKeySetup from '@/components/setup/ApiKeySetup';
import Login from '@/src/pages/Login';
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
} from '@/components/icons/Icons';
import { AppContext, HistoryItem } from '@/types';
import { useHistory } from '@/src/hooks/useHistory';

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
export const API_KEY_STORAGE_KEY = 'brandingCopilotApiKey_v1';


const App: FC = () => {
    const [appState, setAppState] = useState<AppState>('landing');
    const [session, setSession] = useState<Session | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(() => {
        try {
            return localStorage.getItem(API_KEY_STORAGE_KEY);
        } catch {
            return null;
        }
    });
    const [activeTab, setActiveTab] = useState<Tab>('dna');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [prefillData, setPrefillData] = useState<{ tab: string; data: any } | null>(null);

    const {
        history,
        brandDna,
        activeBrandId,
        setActiveBrand,
        addToHistory,
        removeFromHistory,
        clearHistory,
    } = useHistory();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(APP_STATE_KEY);
            if (savedState) {
                const { activeTab: savedActiveTab } = JSON.parse(savedState);
                if (savedActiveTab) setActiveTab(savedActiveTab);
            }
        } catch (error) {
            console.error("Could not load app state from localStorage", error);
        }
    }, []);

    useEffect(() => {
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

    useEffect(() => {
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