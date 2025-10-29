import React from 'react';
type IconProps = React.SVGProps<SVGSVGElement>;
export const BeakerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.139-.022.28-.036.426-.036H14.25c.146 0 .287.014.426.036m-4.95 0a2.25 2.25 0 0 0-2.226 2.016v5.714a2.25 2.25 0 0 0 .659 1.591L9.75 14.5M14.25 3.104a2.25 2.25 0 0 1 2.226 2.016v5.714a2.25 2.25 0 0 1-.659 1.591L14.25 14.5M9.75 14.5h4.5m-4.5 0a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25h4.5a2.25 2.25 0 0 1 2.25 2.25v4.75a2.25 2.25 0 0 1-2.25 2.25m-4.5 0h4.5M9.75 14.5v4.875a2.25 2.25 0 0 0 2.25 2.25h.008a2.25 2.25 0 0 0 2.242-2.25V14.5" />
    </svg>
);