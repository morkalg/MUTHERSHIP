
import React from 'react';
import { ColorTheme } from '../types';

interface SystemVisualData {
    name: string;
    status: 'OPTIMAL' | 'DAMAGED' | 'CRITICAL' | 'OFFLINE';
}

const WireframeCube: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
    <div className="perspective-1000 w-40 h-40 mx-auto my-4 relative flex items-center justify-center">
        {/* Outer Cube */}
        <div className="w-24 h-24 relative preserve-3d animate-spin-3d">
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 translate-z-12 bg-black/10`} />
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 -translate-z-12 bg-black/10`} />
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 rotate-y-90 translate-z-12`} />
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 rotate-y-90 -translate-z-12`} />
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 rotate-x-90 translate-z-12`} />
            <div className={`absolute inset-0 border-2 ${colorTheme.border} opacity-60 rotate-x-90 -translate-z-12`} />
        </div>

        {/* Inner Cube (Reverse Spin) */}
        <div className="w-12 h-12 absolute preserve-3d animate-spin-3d-reverse">
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 translate-z-6 bg-${colorTheme.name}-500/20`} />
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 -translate-z-6 bg-${colorTheme.name}-500/20`} />
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 rotate-y-90 translate-z-6`} />
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 rotate-y-90 -translate-z-6`} />
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 rotate-x-90 translate-z-6`} />
            <div className={`absolute inset-0 border ${colorTheme.border} opacity-90 rotate-x-90 -translate-z-6`} />
        </div>
    </div>
);

const HexGrid: React.FC<{ colorTheme: ColorTheme; status: SystemVisualData['status'] }> = ({ colorTheme, status }) => {
    const isCritical = status === 'CRITICAL' || status === 'OFFLINE';
    return (
        <div className="relative w-full max-w-sm mx-auto my-4 p-2 overflow-hidden border-t border-b border-gray-800">
            <div className="flex flex-wrap gap-1 justify-center opacity-80">
                {Array.from({ length: 28 }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-6 h-6 border ${colorTheme.border} transition-all duration-300
                            ${status === 'OFFLINE' ? 'opacity-10' : (Math.random() > 0.7 ? 'opacity-100 bg-current' : 'opacity-30')}
                            ${isCritical ? 'animate-pulse text-red-500' : ''}
                        `}
                    />
                ))}
            </div>
            {status !== 'OFFLINE' && <div className="animate-scan" />}
        </div>
    );
};

const CircularRadar: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
    <div className="w-32 h-32 mx-auto my-4 relative rounded-full border-2 border-current opacity-80 flex items-center justify-center overflow-hidden bg-black/40">
        <div className="absolute inset-0 opacity-20 border border-current rounded-full scale-75" />
        <div className="absolute inset-0 opacity-20 border border-current rounded-full scale-50" />
        <div className="absolute inset-0 opacity-20 border border-current rounded-full scale-25" />
        <div className="absolute w-full h-[1px] bg-current opacity-30" />
        <div className="absolute h-full w-[1px] bg-current opacity-30" />

        {/* Sweep */}
        <div className={`absolute w-1/2 h-1/2 top-0 left-0 origin-bottom-right bg-gradient-to-l from-current to-transparent opacity-40 animate-radar`} />

        {/* Blips */}
        <div className="absolute w-1 h-1 bg-current rounded-full top-8 left-10 animate-pulse" />
        <div className="absolute w-1.5 h-1.5 bg-current rounded-full bottom-8 right-6 animate-pulse delay-75" />
    </div>
);

const SineWave: React.FC<{ colorTheme: ColorTheme }> = ({ colorTheme }) => (
    <div className="w-full max-w-sm mx-auto my-4 h-24 flex items-end justify-between gap-1 px-4 border-b border-gray-800 pb-2">
        {Array.from({ length: 20 }).map((_, i) => (
            <div
                key={i}
                className={`w-2 bg-current opacity-60 rounded-t`}
                style={{
                    height: '50%',
                    animation: `wave-pulse ${1 + Math.random()}s ease-in-out infinite`,
                    animationDelay: `-${Math.random()}s`
                }}
            />
        ))}
    </div>
);

const StatusBar: React.FC<{ colorTheme: ColorTheme; status: SystemVisualData['status'] }> = ({ colorTheme, status }) => {
    let width = 'w-full';
    let color = colorTheme.bgAccent;
    if (status === 'DAMAGED') { width = 'w-2/3'; color = 'bg-yellow-500'; }
    if (status === 'CRITICAL') { width = 'w-1/3'; color = 'bg-red-500'; }
    if (status === 'OFFLINE') { width = 'w-0'; }

    return (
        <div className={`w-full h-4 border ${colorTheme.border} p-0.5 mt-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
            <div className={`h-full ${color} transition-all duration-1000 ${status === 'CRITICAL' ? 'animate-pulse' : ''}`} style={{ width: status === 'OFFLINE' ? '0%' : (status === 'CRITICAL' ? '25%' : (status === 'DAMAGED' ? '60%' : '100%')) }} />
        </div>
    );
};

export const SystemVisualizer: React.FC<{ systemName: string; system: SystemVisualData | undefined; colorTheme: ColorTheme }> = ({ systemName, system, colorTheme }) => {
    if (!system) return <div className="text-red-500 border border-red-500 p-2 my-2">[SYSTEM NOT FOUND]</div>;

    const statusColor = system.status === 'OPTIMAL' ? 'text-green-500' : (system.status === 'OFFLINE' ? 'text-gray-500' : 'text-red-500');
    const glowClass = system.status === 'OPTIMAL' ? 'text-glow-green' : (system.status === 'OFFLINE' ? '' : 'text-glow-red');

    // Visual Selector Logic
    const shouldUseCube = ['ENGINE', 'DRIVE', 'CORE', 'REACTOR', 'THRUSTER'].some(k => systemName.includes(k));
    const shouldUseRadar = ['SENSOR', 'SCAN', 'RADAR', 'LIDAR', 'PROBE'].some(k => systemName.includes(k));
    const shouldUseWave = ['COMM', 'SIGNAL', 'RADIO', 'TRANSMISSION', 'ANTENNA'].some(k => systemName.includes(k));

    return (
        <div className={`border ${colorTheme.border} p-4 my-2 text-sm font-bold bg-black/80 w-full max-w-md shadow-lg`}>
            <div className={`flex justify-between border-b pb-2 mb-2 border-gray-700 ${glowClass}`}>
                <span>SYSTEM: {systemName}</span>
                <span className={statusColor}>
                    STATUS: {system.status}
                </span>
            </div>

            <div className={`flex justify-center py-4 overflow-hidden ${system.status === 'OFFLINE' ? 'filter grayscale opacity-30' : ''} ${colorTheme.textPrimary}`}>
                {shouldUseCube ? (
                    <WireframeCube colorTheme={colorTheme} />
                ) : shouldUseRadar ? (
                    <CircularRadar colorTheme={colorTheme} />
                ) : shouldUseWave ? (
                    <SineWave colorTheme={colorTheme} />
                ) : (
                    <HexGrid colorTheme={colorTheme} status={system.status} />
                )}
            </div>

            <StatusBar colorTheme={colorTheme} status={system.status} />
            <div className="mt-2 text-xs opacity-70 font-mono flex justify-between">
                <span>DIAGNOSTIC COMPLETE.</span>
                <span>INTEGRITY VERIFIED.</span>
            </div>
        </div>
    );
};
