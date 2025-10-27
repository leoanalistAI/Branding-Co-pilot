import { FC, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary';
    icon?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Button: FC<ButtonProps> = ({ children, isLoading = false, variant = 'primary', icon, size = 'md', className, ...props }) => {
    const baseClasses = "flex items-center justify-center gap-2 rounded-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: 'bg-black text-blue-400 border border-blue-900 hover:border-blue-600 hover:text-blue-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]',
        secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)} disabled={isLoading} {...props}>
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;