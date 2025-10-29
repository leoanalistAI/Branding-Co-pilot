import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
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
import { HistoryItem } from './types';

type TabId =
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

type AppState = 'landing' | 'apiKey' | 'main';
    
export const API_KEY_STORAGE_KEY = 'brandingCopilotApiKey_v1';

const tabs = [
    { id: 'dna', label: 'DNA da Marca Pessoal', icon: IdentificationIcon, component: <FoundationAndPersonas /> },
    { id: 'profile', label: 'Otimizador de Perfil', icon: UserCircleIcon, component: <ProfileOptimizer />, requiresFoundation: true },
    { id: 'contentStudio', label: 'Estúdio de Conteúdo', icon: PencilSquareIcon, component: <ContentStudio />, requiresFoundation: true },
    { id: 'seo', label: 'SEO Pessoal', icon: MagnifyingGlassIcon, component: <SeoAssistant />, requiresFoundation: true },
    { id: 'image', label: 'Gerador de Imagens', icon: PhotoIcon, component: <ImageGenerator />, requiresFoundation: true },
    { id: 'product', label: 'Crie produtos e/ou serviços', icon: CubeIcon, component: <ProductDeveloper />, requiresFoundation: true },
    { id: 'brainstorm', label: 'Brainstorm de Marca', icon: LightBulbIcon, component: <MarketingBrainstorm />, requiresFoundation: true },
    { id: 'calendar', label: 'Calendário Editorial', icon: CalendarDaysIcon, component: <EditorialCalendar />, requiresFoundation: true },
    { id: 'competitor', label: 'Análise de Influência', icon: UsersIcon, component: <CompetitorAnalyzer />, requiresFoundation: true },
    { id: 'funnel', label: 'Jornada da Audiência', icon: FunnelIcon, component: <FunnelBuilder />, requiresFoundation: true },
    { id: 'video', label: 'Analisador de Vídeo', icon: VideoCameraIcon, component: <VideoAnalyzer />, requiresFoundation: true },
];

const MainApp = () => {
    const appContext = useAppContext();
    const { 
        activeTab, 
        handleTabClick, 
        setIsSidebarOpen, 
        brandDna, 
        getHistoryForTab 
    } = appContext;

    const [isSidebarOpen, setLocalIsSidebarOpen] = React.useState(false);

    const handleLocalSidebar = (isOpen: boolean) => {
        setLocalIsSidebarOpen(isOpen);
        setIsSidebarOpen(isOpen);
    }

    const activeComponent = React.useMemo(() => {
        const activeTabData = tabs.find(tab => tab.id === activeTab);
        if (!activeTabData) return null;

        // Pass history prop to components that need it
        if (['profile', 'contentStudio', 'seo', 'image', 'product', 'brainstorm', 'calendar', 'competitor', 'video'].includes(activeTabData.id)) {
            return React.cloneElement(activeTabData.component, { history: getHistoryForTab(activeTabData.id) });
        }
        // Pass appContext to components that need it directly
        if (['dna', 'funnel'].includes(activeTabData.id)) {
             return React.cloneElement(activeTabData.component, { appContext: appContext });
        }
        return activeTabData.component;
    }, [activeTab, getHistoryForTab, appContext]);

    const activeTabLabel = tabs.find(tab => tab.id === activeTab)?.label;
    const isFoundationSet = !!brandDna;

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
                onClick={() => handleLocalSidebar(false)}
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
                    onClick={() => {
                        handleTabClick(tab.id);
                        handleLocalSidebar(false);
                    }}
                    disabled={tab.requiresFoundation && !isFoundationSet}
                />
            ))}
        </nav>
        <ContextSummary 
            context={appContext} 
            onChangeApiKey={() => {
                localStorage.removeItem(API_KEY_STORAGE_KEY);
                appContext.setActiveBrand(null);
                window.location.reload(); // Easiest way to reset to API key screen
            }}
            isCollapsed={appContext.isContextCollapsed}
            onToggleCollapse={() => appContext.setIsContextCollapsed(!appContext.isContextCollapsed)}
        />
      </>
    );

    return (
        <div className="bg-black text-neutral-300 min-h-screen font-sans">
            <div className="flex h-screen overflow-hidden">
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-30 md:hidden"
                        onClick={() => handleLocalSidebar(false)}
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
                            onClick={() => handleLocalSidebar(true)}
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


const App: React.FC = () => {
    const [appState, setAppState] = React.useState<AppState>('landing');

    React.useEffect(() => {
        const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedApiKey) {
            setAppState('main');
        } else {
            setAppState('landing');
        }
    }, []);
    
    const handleKeySubmit = (key: string) => {
        try {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setAppState('main');
        } catch (error) {
            console.error("Could not save API key to localStorage", error);
        }
    };

    if (appState === 'landing') {
        return <LandingPage onStart={() => setAppState('apiKey')} />;
    }

    if (appState === 'apiKey') {
        return <ApiKeySetup onKeySubmit={handleKeySubmit} />;
    }

    return (
        <AppProvider>
            <MainApp />
        </AppProvider>
    );
};

export default App;