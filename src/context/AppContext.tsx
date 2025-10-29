import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { BrandDna, HistoryState, HistoryItem } from '../types';

const APP_STATE_KEY = 'brandingCopilotAppState_v2';
const HISTORY_KEY = 'brandingCopilotHistory_v2';

interface AppContextType {
    brandDna: BrandDna | null;
    activeBrandId: string | null;
    history: HistoryState;
    prefillData: { tab: string; data: any } | null;
    activeTab: string;
    isContextCollapsed: boolean;
    
    setActiveTab: (tab: string) => void;
    handleTabClick: (tab: string) => void;
    setIsSidebarOpen: (isOpen: boolean) => void;
    setIsContextCollapsed: (isCollapsed: boolean) => void;
    setPrefillData: (tab: string, data: any) => void;
    clearPrefillData: () => void;
    setActiveBrand: (item: HistoryItem | null) => void;
    addToHistory: (tab: string, item: HistoryItem) => void;
    removeFromHistory: (tab: string, itemId: string) => void;
    clearHistory: (tab: string) => void;
    getHistoryForTab: (tabId: string) => HistoryItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [activeTab, setActiveTab] = useState<string>('brainstorm');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [prefillData, setPrefillData] = useState<{ tab: string; data: any } | null>(null);
    const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
    const [isContextCollapsed, setIsContextCollapsed] = useState(false);

    const [history, setHistory] = useState<HistoryState>(() => {
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
    
    const [brandDna, setBrandDna] = useState<BrandDna | null>(null);

    useEffect(() => {
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


    useEffect(() => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Could not save history to localStorage", error);
        }
    }, [history]);

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
                const existingIndex = newHistory.dna.findIndex((h: HistoryItem) => h.id === item.id);
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
                const existingIndex = newHistory.brandHistories[activeBrandId][tab].findIndex((h: HistoryItem) => h.id === item.id);
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

    const getHistoryForTab = (tabId: string): HistoryItem[] => {
        if (tabId === 'dna') {
            return history.dna || [];
        }
        if (!activeBrandId) {
            return [];
        }
        return history.brandHistories[activeBrandId]?.[tabId] || [];
    }

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
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

    const value = {
        brandDna,
        activeBrandId,
        history,
        prefillData,
        activeTab,
        isContextCollapsed,
        setActiveTab,
        handleTabClick,
        setIsSidebarOpen,
        setIsContextCollapsed,
        setPrefillData: (tab: string, data: any) => {
            setPrefillData({ tab, data });
            setActiveTab(tab);
        },
        clearPrefillData: () => setPrefillData(null),
        setActiveBrand,
        addToHistory,
        removeFromHistory,
        clearHistory,
        getHistoryForTab,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};