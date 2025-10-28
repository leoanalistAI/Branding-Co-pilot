import { FC, SVGProps } from 'react';

interface TabButtonProps {
    label: string;
    icon: FC<SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}

const TabButton: FC<TabButtonProps> = ({ label, icon: Icon, isActive, onClick, disabled = false }) => {
    const baseClasses = "w-full flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black border-l-4";
    const activeClasses = "bg-blue-500/10 text-blue-400 border-blue-500";
    const inactiveClasses = "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 border-transparent";
    const disabledClasses = "opacity-50 cursor-not-allowed hover:bg-transparent border-transparent";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}
            disabled={disabled}
            aria-disabled={disabled}
        >
            <Icon className="w-5 h-5" />
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
};

export default TabButton;