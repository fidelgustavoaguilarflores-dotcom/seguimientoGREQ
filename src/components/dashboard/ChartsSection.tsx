import React, { useMemo, useState } from 'react';
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
import {
    format,
    startOfMonth,
    startOfYear,
    startOfWeek,
    startOfDay,
    parseISO,
} from 'date-fns';
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

type Granularity = 'year' | 'month' | 'week' | 'day';

export const ChartsSection: React.FC<ChartsSectionProps> = ({ data }) => {

    const [granularity, setGranularity] = useState<Granularity>('month');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

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

    // 1. Time Series by Observation with Filters
    const timeSeriesData = useMemo(() => {
        const grouped: Record<string, Record<string, number>> = {};
        const timeKeys = new Set<string>();
        const obsTypes = new Set<string>();

        data.forEach(r => {
            // Filter by Fecha GREQ Range if set
            if (dateRange.start && dateRange.end) {
                if (!r.fechaGreq) return;
                if (r.fechaGreq < dateRange.start || r.fechaGreq > dateRange.end) return;
            }

            // Fallback to fechaGreq if fechaPublicacion is missing to ensure we show all states (like AJUSTE)
            const rawDate = r.fechaGreq || r.fechaPublicacion;
            if (!rawDate) return;

            let key = '';

            // Handle both string (ISO) and Date objects
            let date: Date;
            if (typeof rawDate === 'string') {
                date = parseISO(rawDate);
            } else if (rawDate instanceof Date) {
                date = rawDate;
            } else {
                return; // Unknown type
            }

            // Validate date
            if (isNaN(date.getTime())) return;

            switch (granularity) {
                case 'year':
                    key = format(startOfYear(date), 'yyyy', { locale: es });
                    break;
                case 'month':
                    key = format(startOfMonth(date), 'yyyy-MM', { locale: es });
                    break;
                case 'week':
                    key = format(startOfWeek(date), 'yyyy-\'W\'ww', { locale: es });
                    break;
                case 'day':
                    key = format(startOfDay(date), 'yyyy-MM-dd', { locale: es });
                    break;
            }

            timeKeys.add(key);
            if (r.observacion) {
                obsTypes.add(r.observacion);
                if (!grouped[key]) grouped[key] = {};
                grouped[key][r.observacion] = (grouped[key][r.observacion] || 0) + 1;
            }
        });

        const sortedKeys = Array.from(timeKeys).sort();
        const uniqueObs = Array.from(obsTypes).sort();

        // LOGGING FOR DEBUGGING
        console.log("Unique Observations Found for Time Series:", uniqueObs);
        console.log("Total Data Rows (Filtered):", data.length);

        // Color palette for dynamic lines
        const colors = [
            '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#64748b', '#06b6d4'
        ];

        const datasets = uniqueObs.map((obs, index) => {
            const color = colors[index % colors.length];
            return {
                label: obs,
                data: sortedKeys.map(k => grouped[k]?.[obs] || 0),
                borderColor: color,
                backgroundColor: color + '33',
                fill: false,
                tension: 0.3
            };
        });

        return {
            labels: sortedKeys,
            datasets: datasets
        };
    }, [data, granularity, dateRange]);

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

    // 4. Analysis Horizontal Bar
    const analysisData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            if (r.responsableAnalisis) counts[r.responsableAnalisis] = (counts[r.responsableAnalisis] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

        return {
            labels: sorted.map(s => s[0]),
            datasets: [{
                label: 'Asignaciones',
                data: sorted.map(s => s[1]),
                backgroundColor: '#f59e0b',
            }]
        };
    }, [data]);

    // 5. Dev Horizontal Bar
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
                backgroundColor: '#3b82f6',
            }]
        };
    }, [data]);

    // 6. CC Horizontal Bar
    const ccData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(r => {
            if (r.responsableCC) counts[r.responsableCC] = (counts[r.responsableCC] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

        return {
            labels: sorted.map(s => s[0]),
            datasets: [{
                label: 'Asignaciones',
                data: sorted.map(s => s[1]),
                backgroundColor: '#10b981',
            }]
        };
    }, [data]);

    return (
        <div className="grid-dashboard" style={{ marginTop: '20px' }}>

            {/* Time Series */}
            <div className="card" style={{ gridColumn: 'span 12', height: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1em' }}>Evolución Temporal</h3>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Granularity Controls */}
                        <div style={{ display: 'flex', background: 'var(--bg-body)', borderRadius: '6px', padding: '2px' }}>
                            {(['year', 'month', 'week', 'day'] as Granularity[]).map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGranularity(g)}
                                    style={{
                                        background: granularity === g ? 'var(--primary)' : 'transparent',
                                        color: granularity === g ? 'white' : 'var(--text-secondary)',
                                        border: 'none',
                                        padding: '4px 12px',
                                        borderRadius: '4px',
                                        fontSize: '0.85em',
                                        cursor: 'pointer',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {g === 'year' ? 'Añ' : g === 'month' ? 'Mes' : g === 'week' ? 'Sem' : 'Día'}
                                </button>
                            ))}
                        </div>

                        {/* Date Range Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>F. GREQ:</span>
                            <input
                                type="date"
                                className="form-input"
                                style={{ width: '130px', padding: '4px 8px', fontSize: '0.85em', height: '28px' }}
                                value={dateRange.start}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                            <input
                                type="date"
                                className="form-input"
                                style={{ width: '130px', padding: '4px 8px', fontSize: '0.85em', height: '28px' }}
                                value={dateRange.end}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ height: '320px' }}>
                    <Line data={timeSeriesData} options={chartOptions} />
                </div>
            </div>

            {/* Entity Bar */}
            <div className="card" style={{ gridColumn: 'span 6', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Por Entidad (Top 10)</h3>
                <Bar data={entityData} options={chartOptions} />
            </div>

            {/* Observation Donut */}
            <div className="card" style={{ gridColumn: 'span 6', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Distribución Estado</h3>
                <div style={{ position: 'relative', height: '85%' }}>
                    <Doughnut data={obsData} options={{ ...donutOptions, maintainAspectRatio: false }} />
                </div>
            </div>

            {/* Analysis Bar */}
            <div className="card" style={{ gridColumn: 'span 4', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Carga Análisis</h3>
                <Bar
                    data={analysisData}
                    options={{
                        ...chartOptions,
                        indexAxis: 'y' as const
                    }}
                />
            </div>

            {/* Dev Bar */}
            <div className="card" style={{ gridColumn: 'span 4', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Carga Desarrollo</h3>
                <Bar
                    data={devData}
                    options={{
                        ...chartOptions,
                        indexAxis: 'y' as const
                    }}
                />
            </div>

            {/* CC Bar */}
            <div className="card" style={{ gridColumn: 'span 4', height: '300px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1em' }}>Carga Control Calidad</h3>
                <Bar
                    data={ccData}
                    options={{
                        ...chartOptions,
                        indexAxis: 'y' as const
                    }}
                />
            </div>

        </div>
    );
};
