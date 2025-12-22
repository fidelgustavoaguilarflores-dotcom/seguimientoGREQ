import React, { useMemo } from 'react';
import { Row } from '../../types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartsSectionProps {
    data: Row[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#94a3b8' }
            },
            title: { display: false }
        },
        scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#2d3748' } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#2d3748' } }
        }
    };

    const donutOptions = {
        plugins: {
            legend: { position: 'right' as const, labels: { color: '#94a3b8' } }
        }
    };

    // 1. Time Series by Observation (Group by Month of Fecha Publicacion)
    const timeSeriesData = useMemo(() => {
        const grouped: Record<string, Record<string, number>> = {};
        const months = new Set<string>();

        data.forEach(r => {
            if (!r.fechaPublicacion) return;
            const m = format(startOfMonth(r.fechaPublicacion), 'yyyy-MM', { locale: es });
            months.add(m);
            if (!grouped[m]) grouped[m] = {};
            grouped[m][r.observacion] = (grouped[m][r.observacion] || 0) + 1;
        });

        const sortedMonths = Array.from(months).sort();

        return {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'ORIGINAL',
                    data: sortedMonths.map(m => grouped[m]?.['ORIGINAL'] || 0),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                },
                {
                    label: 'AJUSTE',
                    data: sortedMonths.map(m => grouped[m]?.['AJUSTE'] || 0),
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    fill: true,
                },
                {
                    label: 'SUMA-VUCE',
                    data: sortedMonths.map(m => grouped[m]?.['SUMA-VUCE'] || 0),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    fill: true,
                }
            ]
        };
    }, [data]);

    // 2. Entity Bar Chart
    const entityData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            if (r.entidad) counts[r.entidad] = (counts[r.entidad] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

        return {
            labels: sorted.map(s => s[0]),
            datasets: [{
                label: 'Requerimientos',
                data: sorted.map(s => s[1]),
                backgroundColor: '#8b5cf6',
            }]
        };
    }, [data]);

    // 3. Observation Donut
    const obsData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            counts[r.observacion] = (counts[r.observacion] || 0) + 1;
        });

        return {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: [
                    '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#64748b'
                ],
                borderWidth: 0
            }]
        };
    }, [data]);

    // 4. Dev Horizontal Bar
    const devData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            r.responsablesDesarrollo.forEach(dev => {
                if (dev) counts[dev] = (counts[dev] || 0) + 1;
            });
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

        return {
            labels: sorted.map(s => s[0]),
            datasets: [{
                label: 'Asignaciones',
                data: sorted.map(s => s[1]),
                backgroundColor: '#06b6d4',
            }]
        };
    }, [data]);

    return (
        <div className="grid-dashboard" style={{ marginTop: '20px' }}>

            {/* Time Series */}
            <div className="card" style={{ gridColumn: 'span 12', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Evolución Temporal</h3>
                <Line data={timeSeriesData} options={chartOptions} />
            </div>

            {/* Entity Bar */}
            <div className="card" style={{ gridColumn: 'span 6', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Por Entidad (Top 10)</h3>
                <Bar data={entityData} options={chartOptions} />
            </div>

            {/* Observation Donut */}
            <div className="card" style={{ gridColumn: 'span 3', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Distribución Estado</h3>
                <div style={{ position: 'relative', height: '85%' }}>
                    <Doughnut data={obsData} options={{ ...donutOptions, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Dev Bar */}
            <div className="card" style={{ gridColumn: 'span 3', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Carga Desarrollo</h3>
                <Bar
                    data={devData}
                    options={{
                        ...chartOptions,
                        indexAxis: 'y' as const
                    }}
                />
            </div>

        </div>
    );
};
