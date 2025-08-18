import React from 'react';

interface AgentCardProps {
    title: string;
    subtitle: string;
    onClick: () => void;
    isSelected: boolean;
    type?: 'agent' | 'orchestration' | 'action';
}

const AgentCard: React.FC<AgentCardProps> = ({ title, subtitle, onClick, isSelected, type = 'agent' }) => {
    
    const hoverClasses = 'hover:translate-y-[-5px] hover:shadow-lg hover:shadow-cyan-500/20';
    
    let typeClasses = '';
    if (type === 'orchestration') {
        typeClasses = '!border-indigo-500';
    } else if (type === 'action') {
        typeClasses = '!border-green-500';
    }
    
    const selectedClasses = isSelected ? 'scale-105 shadow-xl shadow-blue-500/30 neon' : '';

    return (
        <div
            className={`glass p-4 text-center cursor-pointer flex flex-col justify-center items-center h-48 transition-all duration-300 ${hoverClasses} ${typeClasses} ${selectedClasses}`}
            onClick={onClick}
        >
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-sm text-blue-300 mt-2">{subtitle}</p>
        </div>
    );
};

export default AgentCard;