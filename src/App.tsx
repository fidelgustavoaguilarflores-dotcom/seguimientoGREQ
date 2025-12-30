// Root dashboard view.
// Responsibilities:
// - Load data via the custom hook.
// - Maintain filter state.
// - Compute filtered rows for KPIs, charts, and table.
// - Render the main layout and chat widget.
import { useState, useMemo } from 'react';
import { useVuceData } from './hooks/useVuceData';
import { Filters, FiltersState } from './components/dashboard/Filters';
import { KPICards } from './components/dashboard/KPICards';
import { ChartsSection } from './components/dashboard/ChartsSection';
import { RecordsTable } from './components/dashboard/RecordsTable';
import { isAfter, isBefore, parse, startOfDay } from 'date-fns';
import { LayoutDashboard } from 'lucide-react';
import { ChatWidget } from './components/chat/ChatWidget';

/**
 * App composes the dashboard UI and orchestrates filtering.
 */
function App() {
    const { data, loading, error } = useVuceData();

    const [filters, setFilters] = useState<FiltersState>({
        startDate: '',
        endDate: '',
        startGreq: '',
        endGreq: '',
        observacion: 'Todos',
        entidades: [],
        siglas: [],
        respAnalisis: [],
        respDesarrollo: [],
        respCC: [],
        estado: 'Todos',
        search: ''
    });

    // Apply all UI filters to the dataset.
    const filteredData = useMemo(() => {
        if (!data) return [];

        const result = data.filter(row => {
            // 1. Date Range (Fecha Publicacion)
            if (filters.startDate) {
                if (!row.fechaPublicacion) return false;
                // Parse filter as YYYY-MM-DD local
                const start = parse(filters.startDate, 'yyyy-MM-dd', new Date());
                if (isBefore(startOfDay(row.fechaPublicacion), start)) return false;
            }
            if (filters.endDate) {
                if (!row.fechaPublicacion) return false;
                const end = parse(filters.endDate, 'yyyy-MM-dd', new Date());
                if (isAfter(startOfDay(row.fechaPublicacion), end)) return false;
            }

            // 1.1 Date Range (Fecha GREQ)
            if (filters.startGreq) {
                if (!row.fechaGreq) return false;
                const start = parse(filters.startGreq, 'yyyy-MM-dd', new Date());
                if (isBefore(startOfDay(row.fechaGreq), start)) return false;
            }
            if (filters.endGreq) {
                if (!row.fechaGreq) return false;
                const end = parse(filters.endGreq, 'yyyy-MM-dd', new Date());
                if (isAfter(startOfDay(row.fechaGreq), end)) return false;
            }

            // 2. Observacion
            if (filters.observacion !== 'Todos' && row.observacion !== filters.observacion) return false;

            // 2.1 Estado
            if (filters.estado !== 'Todos' && row.estado !== filters.estado) return false;

            // 3. Entidades
            if (filters.entidades.length > 0 && !filters.entidades.includes(row.entidad)) return false;

            // 4. Siglas
            if (filters.siglas.length > 0 && !filters.siglas.includes(row.sigla)) return false;

            // 5. Responsables
            if (filters.respAnalisis.length > 0 && !filters.respAnalisis.includes(row.responsableAnalisis)) return false;
            if (filters.respCC.length > 0 && !filters.respCC.includes(row.responsableCC)) return false;

            if (filters.respDesarrollo.length > 0) {
                // Multi-select logic: match if the row has ANY of the selected developers.
                const hasDev = row.responsablesDesarrollo.some(d => filters.respDesarrollo.includes(d));
                if (!hasDev) return false;
            }

            // 6. Search
            if (filters.search) {
                const term = filters.search.toLowerCase();
                const matches =
                    (row.greq ? row.greq.toString() : '').includes(term) ||
                    (row.apco || '').toLowerCase().includes(term) ||
                    (row.descripcionGreq || '').toLowerCase().includes(term) ||
                    (row.nombreEntidad || '').toLowerCase().includes(term);
                if (!matches) return false;
            }

            return true;
        });

        return result.sort((a, b) => {
            const aTime = a.fechaGreq ? a.fechaGreq.getTime() : 0;
            const bTime = b.fechaGreq ? b.fechaGreq.getTime() : 0;
            return bTime - aTime;
        });
    }, [data, filters]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
                <div style={{ fontSize: '1.2em' }}>Cargando datos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'var(--danger)' }}>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Error al cargar datos</div>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <div className="container">
            {/* Header */}
            <header style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        padding: '10px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}>
                        <LayoutDashboard size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5em', margin: 0, fontWeight: '700' }}>Dashboard Seguimiento VUCE</h1>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>Control de requerimientos funcionales</span>
                    </div>
                </div>
                <div>
                    {/* Maybe user info or refresh button */}
                    <div className="badge badge-info" style={{ fontSize: '0.85em', padding: '6px 12px' }}>
                        Registros: {data.length}
                    </div>
                </div>
            </header>

            {/* Filters */}
            <Filters filters={filters} setFilters={setFilters} data={data} />

            {/* KPIs */}
            <KPICards data={filteredData} />

            {/* Charts */}
            <ChartsSection data={filteredData} />

            {/* Table */}
            <RecordsTable data={filteredData} />

            <div style={{ height: '50px' }}></div>
            <ChatWidget />
        </div>
    );
}

export default App;
