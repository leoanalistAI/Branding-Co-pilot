import React from 'react';

// Generic Icon Props
type IconProps = React.SVGProps<SVGSVGElement>;

export const IdentificationIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

export const PencilSquareIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const LightBulbIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.421-.492-2.682-1.233-3.654-2.195a7.5 7.5 0 0 1-1.095-4.43c0-2.442 1.49-4.59 3.654-5.96l.823-.548a3 3 0 0 0 .722-4.21 3 3 0 0 0-4.21-.722l-.823.548a7.5 7.5 0 0 0-3.654 5.96c0 1.64.52 3.2 1.468 4.548a12.06 12.06 0 0 0 4.5 3.811m10.5-11.622a7.5 7.5 0 0 0-7.5 0c1.421.492 2.682 1.233 3.654 2.195a7.5 7.5 0 0 0 1.095 4.43c0 2.442-1.49 4.59-3.654 5.96l-.823.548a3 3 0 0 1-.722 4.21 3 3 0 0 1 4.21.722l.823-.548a7.5 7.5 0 0 1 3.654-5.96c0-1.64-.52-3.2-1.468-4.548a12.06 12.06 0 0 1-4.5-3.811" />
    </svg>
);

export const CalendarDaysIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0ZM10.5 18.75a9.094 9.094 0 0 1 4.71-1.717m-4.71 1.717c-2.132.44-4.402.79-6.75 1.018a25.4 25.4 0 0 0-3.13-.057m-3.13.057c-1.666.148-3.223.44-4.682 1.018a3 3 0 0 1-2.72-4.682 9.094 9.094 0 0 1 1.717-4.71m1.018-3.13a25.4 25.4 0 0 1 .057-3.13c.148-1.666.44-3.223 1.018-4.682a3 3 0 0 1 4.682-2.72 9.094 9.094 0 0 1 4.71 1.717m-1.717 4.71c.44 2.132.79 4.402 1.018 6.75a25.4 25.4 0 0 1 .057 3.13m-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 1-4.682 2.72 9.094 9.094 0 0 1-4.71-1.717m1.717-4.71c-.44-2.132-.79-4.402-1.018-6.75a25.4 25.4 0 0 0-.057-3.13m.057-3.13c.148-1.666.44-3.223 1.018-4.682a3 3 0 0 0 2.72 4.682 9.094 9.094 0 0 0 4.71-1.717m-1.717-4.71c2.132-.44 4.402-.79 6.75-1.018a25.4 25.4 0 0 1 3.13.057m3.13-.057c1.666-.148 3.223-.44 4.682-1.018a3 3 0 0 0 2.72 4.682 9.094 9.094 0 0 1-1.717 4.71m-1.018 3.13a25.4 25.4 0 0 0-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 0-2.72-4.682 9.094 9.094 0 0 0-4.71 1.717m1.717 4.71c.44 2.132.79 4.402 1.018 6.75a25.4 25.4 0 0 0 .057 3.13m-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 0 4.682 2.72 9.094 9.094 0 0 0 4.71-1.717" />
    </svg>
);

export const VideoCameraIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
    </svg>
);

export const MagnifyingGlassIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

export const PhotoIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm1.5-1.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
);

export const UserCircleIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export const MenuIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const XMarkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const BeakerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.139-.022.28-.036.426-.036H14.25c.146 0 .287.014.426.036m-4.95 0a2.25 2.25 0 0 0-2.226 2.016v5.714a2.25 2.25 0 0 0 .659 1.591L9.75 14.5M14.25 3.104a2.25 2.25 0 0 1 2.226 2.016v5.714a2.25 2.25 0 0 1-.659 1.591L14.25 14.5M9.75 14.5h4.5m-4.5 0a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25v4.75a2.25 2.25 0 0 1-2.25 2.25m-4.5 0h4.5M9.75 14.5v4.875a2.25 2.25 0 0 0 2.25 2.25h.008a2.25 2.25 0 0 0 2.242-2.25V14.5" />
    </svg>
);

export const UserGroupIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.962a3.75 3.75 0 1 0-7.5 0 3.75 3.75 0 0 0 7.5 0ZM10.5 18.75a9.094 9.094 0 0 1 4.71-1.717m-4.71 1.717c-2.132.44-4.402.79-6.75 1.018a25.4 25.4 0 0 0-3.13-.057m-3.13.057c-1.666.148-3.223.44-4.682 1.018a3 3 0 0 1-2.72-4.682 9.094 9.094 0 0 1 1.717-4.71m1.018-3.13a25.4 25.4 0 0 1 .057-3.13c.148-1.666.44-3.223 1.018-4.682a3 3 0 0 1 4.682-2.72 9.094 9.094 0 0 1 4.71 1.717m-1.717 4.71c.44 2.132.79 4.402 1.018 6.75a25.4 25.4 0 0 1 .057 3.13m-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 1-4.682 2.72 9.094 9.094 0 0 1-4.71-1.717m1.717-4.71c-.44-2.132-.79-4.402-1.018-6.75a25.4 25.4 0 0 0-.057-3.13m.057-3.13c.148-1.666.44-3.223 1.018-4.682a3 3 0 0 0 2.72 4.682 9.094 9.094 0 0 0 4.71-1.717m-1.717-4.71c2.132-.44 4.402-.79 6.75-1.018a25.4 25.4 0 0 1 3.13.057m3.13-.057c1.666-.148 3.223-.44 4.682-1.018a3 3 0 0 0 2.72 4.682 9.094 9.094 0 0 1-1.717 4.71m-1.018 3.13a25.4 25.4 0 0 0-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 0-2.72-4.682 9.094 9.094 0 0 0-4.71 1.717m1.717 4.71c.44 2.132.79 4.402 1.018 6.75a25.4 25.4 0 0 0 .057 3.13m-.057 3.13c-.148 1.666-.44 3.223-1.018 4.682a3 3 0 0 0 4.682 2.72 9.094 9.094 0 0 0 4.71-1.717" />
    </svg>
);

export const ArrowPathIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.18-3.185m-3.18-3.182-3.182-3.182a8.25 8.25 0 0 0-11.664 0L2.985 14.652" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const ArrowDownTrayIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);