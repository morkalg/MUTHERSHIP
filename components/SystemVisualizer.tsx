
import React from 'react';
import { ColorTheme } from '../types';

interface SystemVisualData {
    name: string;
    status: 'OPTIMAL' | 'DAMAGED' | 'CRITICAL' | 'OFFLINE';
}

const WireframeCube: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
    <div className="w-32 h-32 relative preserve-3d animate-spin-slow my-4 mx-auto">
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 translate-z-16`} />
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 -translate-z-16`} />
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 rotate-y-90 translate-z-16`} />
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 rotate-y-90 -translate-z-16`} />
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 rotate-x-90 translate-z-16`} />
        <div className={`absolute w-full h-full border-2 ${colorTheme.border} opacity-50 rotate-x-90 -translate-z-16`} />
    </div>
);

const HexGrid: React.FC<{ colorTheme: ColorTheme; status: SystemVisualData['status'] }> = ({ colorTheme, status }) => {
    const isCritical = status === 'CRITICAL' || status === 'OFFLINE';
    const pulseClass = isCritical ? 'animate-pulse text-red-500' : 'animate-pulse-slow';

    return (
        <div className="flex flex-wrap gap-1 p-2 w-full max-w-sm justify-center mx-auto my-4 opacity-80">
            {Array.from({ length: 24 }).map((_, i) => (
                <div
                    key={i}
                    className={`w-6 h-6 border ${colorTheme.border} ${Math.random() > 0.5 ? pulseClass : ''} ${Math.random() > 0.8 ? 'bg-current opacity-20' : ''}`}
                    style={{ animationDelay: `${Math.random()}s` }}
                />
            ))}
        </div>
    );
};

const StatusBar: React.FC<{ colorTheme: ColorTheme; status: SystemVisualData['status'] }> = ({ colorTheme, status }) => {
    let width = 'w-full';
    let color = colorTheme.bgAccent;
    if (status === 'DAMAGED') { width = 'w-2/3'; color = 'bg-yellow-500'; }
    if (status === 'CRITICAL') { width = 'w-1/3'; color = 'bg-red-500'; }
    if (status === 'OFFLINE') { width = 'w-0'; }

    return (
        <div className={`w-full h-4 border ${colorTheme.border} p-0.5 mt-2`}>
            <div className={`h-full ${color} transition-all duration-1000 ${status === 'CRITICAL' ? 'animate-pulse' : ''}`} style={{ width: status === 'OFFLINE' ? '0%' : (status === 'CRITICAL' ? '25%' : (status === 'DAMAGED' ? '60%' : '100%')) }} />
        </div>
    );
};

export const SystemVisualizer: React.FC<{ systemName: string; system: SystemVisualData | undefined; colorTheme: ColorTheme }> = ({ systemName, system, colorTheme }) => {
    if (!system) return <div className="text-red-500">[SYSTEM NOT FOUND]</div>;

    return (
        <div className={`border ${colorTheme.border} p-4 my-2 text-sm font-bold bg-black/30 w-full max-w-md`}>
            <div className="flex justify-between border-b pb-2 mb-2 border-gray-700">
                <span>SYSTEM: {systemName}</span>
                <span className={system.status === 'OPTIMAL' ? 'text-green-500' : (system.status === 'OFFLINE' ? 'text-gray-500' : 'text-red-500')}>
                    STATUS: {system.status}
                </span>
            </div>

            <div className="flex justify-center py-4 overflow-hidden">
                {/* Randomly choose a visual style or based on system type if we had it but for now random-ish/fixed */}
                {systemName.includes('ENGINE') || systemName.includes('DRIVE') ? (
                    <WireframeCube colorTheme={colorTheme} />
                ) : (
                    <HexGrid colorTheme={colorTheme} status={system.status} />
                )}
            </div>

            <StatusBar colorTheme={colorTheme} status={system.status} />
            <div className="mt-2 text-xs opacity-70 font-mono">
                DIAGNOSTIC COMPLETE. INTEGRITY VERIFIED.
            </div>
        </div>
    );
};
