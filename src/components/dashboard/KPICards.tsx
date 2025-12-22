import React, { useMemo } from 'react';
import { Row } from '../../types';
import { FileText, ClipboardList, CheckCircle, Percent, Building } from 'lucide-react';

interface KPICardsProps {
    data: Row[];
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {

    const stats = useMemo(() => {
        const total = data.length;
        const original = data.filter(r => r.observacion === 'ORIGINAL').length;
        const ajuste = data.filter(r => r.observacion === 'AJUSTE').length;
        const sumaVuce = data.filter(r => r.observacion === 'SUMA-VUCE').length;

        const avgProgress = total > 0
            ? data.reduce((acc, r) => acc + (r.porcentajeAvance || 0), 0) / total
            : 0;

        // Entity with most reqs
        const entityCounts: Record<string, number> = {};
        data.forEach(r => {
            if (r.entidad) entityCounts[r.entidad] = (entityCounts[r.entidad] || 0) + 1;
        });
        const topEntity = Object.entries(entityCounts).sort((a, b) => b[1] - a[1])[0];

        return { total, original, ajuste, sumaVuce, avgProgress, topEntity };
    }, [data]);

    const cards = [
        { title: 'Total Requerimientos', value: stats.total, icon: <FileText size={24} color="var(--primary)" /> },
        { title: 'En ORIGINAL', value: stats.original, icon: <ClipboardList size={24} color="var(--info)" /> },
        { title: 'En AJUSTE', value: stats.ajuste, icon: <ClipboardList size={24} color="var(--warning)" /> },
        { title: 'Listos SUMA-VUCE', value: stats.sumaVuce, icon: <CheckCircle size={24} color="var(--success)" /> },
        { title: 'Promedio Avance', value: `${stats.avgProgress.toFixed(1)}%`, icon: <Percent size={24} color="var(--accent)" /> },
        {
            title: 'Entidad Top',
            value: stats.topEntity ? stats.topEntity[0] : '-',
            sub: stats.topEntity ? `${stats.topEntity[1]} reqs` : '',
            icon: <Building size={24} color="var(--text-muted)" />
        },
    ];

    return (
        <div className="kpi-grid">
            {cards.map((k, i) => (
                <div className="card" key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        {k.icon}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{k.title}</div>
                        <div style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{k.value}</div>
                        {k.sub && <div style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{k.sub}</div>}
                    </div>
                </div>
            ))}
        </div>
    );
};
