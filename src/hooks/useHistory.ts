import { useState, useEffect } from 'react';
import { BrandDna, HistoryState, HistoryItem } from '@/types';

const HISTORY_KEY = 'brandingCopilotHistory_v2';
const APP_STATE_KEY = 'brandingCopilotAppState_v2';

export const useHistory = () => {
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

    const [activeBrandId, setActiveBrandId] = useState<string | null>(null);
    const [brandDna, setBrandDna] = useState<BrandDna | null>(null);

    useEffect(() => {
        try {
            const savedState = localStorage.getItem(APP_STATE_KEY);
            if (savedState) {
                const { activeBrandId: savedActiveBrandId } = JSON.parse(savedState);
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
            if (tab === 'dna') {
                const existingIndex = prev.dna.findIndex(h => h.id === item.id);
                let newDna;
                if (existingIndex > -1) {
                    newDna = [
                        ...prev.dna.slice(0, existingIndex),
                        item,
                        ...prev.dna.slice(existingIndex + 1),
                    ];
                } else {
                    newDna = [item, ...prev.dna];
                }
                return { ...prev, dna: newDna };
            }
    
            if (activeBrandId) {
                const brandHistory = prev.brandHistories[activeBrandId] || {};
                const tabHistory = brandHistory[tab] || [];
                const existingIndex = tabHistory.findIndex(h => h.id === item.id);
                let newTabHistory;
                if (existingIndex > -1) {
                    newTabHistory = [
                        ...tabHistory.slice(0, existingIndex),
                        item,
                        ...tabHistory.slice(existingIndex + 1),
                    ];
                } else {
                    newTabHistory = [item, ...tabHistory];
                }
    
                return {
                    ...prev,
                    brandHistories: {
                        ...prev.brandHistories,
                        [activeBrandId]: {
                            ...brandHistory,
                            [tab]: newTabHistory.slice(0, 20),
                        },
                    },
                };
            }
            return prev;
        });
    };
    
    const removeFromHistory = (tab: string, itemId: string) => {
        setHistory(prev => {
            if (tab === 'dna') {
                const newDna = prev.dna.filter(item => item.id !== itemId);
                const { [itemId]: _, ...remainingBrandHistories } = prev.brandHistories;
    
                if (activeBrandId === itemId) {
                    setActiveBrandId(null);
                    setBrandDna(null);
                }
    
                return {
                    dna: newDna,
                    brandHistories: remainingBrandHistories,
                };
            }
    
            if (activeBrandId && prev.brandHistories[activeBrandId]?.[tab]) {
                const brandHistory = prev.brandHistories[activeBrandId];
                const newTabHistory = brandHistory[tab].filter(item => item.id !== itemId);
    
                return {
                    ...prev,
                    brandHistories: {
                        ...prev.brandHistories,
                        [activeBrandId]: {
                            ...brandHistory,
                            [tab]: newTabHistory,
                        },
                    },
                };
            }
            return prev;
        });
    };
    
    const clearHistory = (tab: string) => {
        setHistory(prev => {
            if (tab === 'dna') {
                setActiveBrandId(null);
                setBrandDna(null);
                return { dna: [], brandHistories: {} };
            }
    
            if (activeBrandId && prev.brandHistories[activeBrandId]?.[tab]) {
                const brandHistory = prev.brandHistories[activeBrandId];
                return {
                    ...prev,
                    brandHistories: {
                        ...prev.brandHistories,
                        [activeBrandId]: {
                            ...brandHistory,
                            [tab]: [],
                        },
                    },
                };
            }
            return prev;
        });
    };

    return {
        history,
        brandDna,
        activeBrandId,
        setActiveBrand,
        addToHistory,
        removeFromHistory,
        clearHistory,
    };
};