import React, { useMemo } from 'react';
import { Row } from '../../types';
import { FileText, ClipboardList, Percent, Building, User, Code, ShieldCheck } from 'lucide-react';

interface KPICardsProps {
    data: Row[];
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {

    const stats = useMemo(() => {
        const total = data.length;

        // Calculate progress
        const avgProgress = total > 0
            ? data.reduce((acc, r) => acc + (r.porcentajeAvance || 0), 0) / total
            : 0;

        // Calculate Observation Counts
        const obsCounts: Record<string, number> = {};
        data.forEach(r => {
            if (r.observacion) {
                obsCounts[r.observacion] = (obsCounts[r.observacion] || 0) + 1;
            }
        });

        // Get Top 3 Observations
        const topObservations = Object.entries(obsCounts)
            .sort((a, b) => b[1] - a[1]) // Sort descending by count
            .slice(0, 3) // Take top 3
            .map(([name, count]) => ({ name, count }));

        // Helper to find top item in a record
        const getTopItem = (counts: Record<string, number>) => {
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            return sorted.length > 0 ? sorted[0] : null;
        };

        // Entity with most reqs
        const entityCounts: Record<string, number> = {};
        data.forEach(r => {
            if (r.entidad) entityCounts[r.entidad] = (entityCounts[r.entidad] || 0) + 1;
        });
        const topEntity = getTopItem(entityCounts);

        // Top Analyst
        const analystCounts: Record<string, number> = {};
        data.forEach(r => {
            if (r.responsableAnalisis) analystCounts[r.responsableAnalisis] = (analystCounts[r.responsableAnalisis] || 0) + 1;
        });
        const topAnalyst = getTopItem(analystCounts);

        // Top Developer
        const devCounts: Record<string, number> = {};
        data.forEach(r => {
            r.responsablesDesarrollo.forEach(dev => {
                if (dev) devCounts[dev] = (devCounts[dev] || 0) + 1;
            });
        });
        const topDev = getTopItem(devCounts);

        // Top CC (QA)
        const ccCounts: Record<string, number> = {};
        data.forEach(r => {
            if (r.responsableCC) ccCounts[r.responsableCC] = (ccCounts[r.responsableCC] || 0) + 1;
        });
        const topCC = getTopItem(ccCounts);

        return { total, topObservations, avgProgress, topEntity, topAnalyst, topDev, topCC };
    }, [data]);

    const getIconColor = (index: number) => {
        const colors = ['var(--info)', 'var(--warning)', 'var(--success)', 'var(--danger)', 'var(--accent)'];
        return colors[index % colors.length];
    };

    return (
        <div className="kpi-grid">
            {/* Total Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <FileText size={24} color="var(--primary)" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Total Requerimientos</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.total}</div>
                </div>
            </div>

            {/* Dynamic Observation Cards */}
            {stats.topObservations.map((obs, i) => (
                <div className="card" key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <ClipboardList size={24} color={getIconColor(i)} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>En {obs.name}</div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{obs.count}</div>
                    </div>
                </div>
            ))}

            {/* Fill empty slots if less than 3 observations */}
            {Array.from({ length: 3 - stats.topObservations.length }).map((_, i) => (
                <div className="card" key={`empty-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '15px', opacity: 0.5 }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <ClipboardList size={24} color="var(--text-muted)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>-</div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>0</div>
                    </div>
                </div>
            ))}

            {/* Average Progress Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <Percent size={24} color="var(--accent)" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Promedio Avance</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.avgProgress.toFixed(1)}%</div>
                </div>
            </div>

            {/* Top Entity Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <Building size={24} color="var(--text-muted)" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Entidad Top</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.topEntity ? stats.topEntity[0] : '-'}</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{stats.topEntity ? `${stats.topEntity[1]} reqs` : ''}</div>
                </div>
            </div>

            {/* Top Analyst Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <User size={24} color="#f59e0b" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Analista Top</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.topAnalyst ? stats.topAnalyst[0] : '-'}</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{stats.topAnalyst ? `${stats.topAnalyst[1]} reqs` : ''}</div>
                </div>
            </div>

            {/* Top Developer Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <Code size={24} color="#3b82f6" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Desarrollador Top</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.topDev ? stats.topDev[0] : '-'}</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{stats.topDev ? `${stats.topDev[1]} reqs` : ''}</div>
                </div>
            </div>

            {/* Top QA/CC Card */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <ShieldCheck size={24} color="#10b981" />
                </div>
                <div>
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Control Calidad Top</div>
                    <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.topCC ? stats.topCC[0] : '-'}</div>
                    <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{stats.topCC ? `${stats.topCC[1]} reqs` : ''}</div>
                </div>
            </div>
        </div>
    );
};
