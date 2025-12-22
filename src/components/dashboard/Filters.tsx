import React from 'react';
import { Row } from '../../types';
import { MultiSelect } from '../ui/MultiSelect';

export interface FiltersState {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    observacion: string; // "Todos" or specific
    entidades: string[];
    siglas: string[];
    respAnalisis: string[];
    respDesarrollo: string[];
    respCC: string[];
    search: string;
}

interface FiltersProps {
    filters: FiltersState;
    setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
    data: Row[]; // To derive options
}

export const Filters: React.FC<FiltersProps> = ({ filters, setFilters, data }) => {

    // Extract unique options
    const uniqueEntidades = React.useMemo(() => Array.from(new Set(data.map(r => r.entidad).filter(Boolean))), [data]);
    const uniqueSiglas = React.useMemo(() => Array.from(new Set(data.map(r => r.sigla).filter(Boolean))), [data]);
    const uniqueRespAnalisis = React.useMemo(() => Array.from(new Set(data.map(r => r.responsableAnalisis).filter(Boolean))), [data]);
    const uniqueRespDesarrollo = React.useMemo(() => {
        const list: string[] = [];
        data.forEach(r => list.push(...r.responsablesDesarrollo));
        return Array.from(new Set(list.filter(Boolean)));
    }, [data]);
    const uniqueRespCC = React.useMemo(() => Array.from(new Set(data.map(r => r.responsableCC).filter(Boolean))), [data]);

    const handleChange = (key: keyof FiltersState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="card" style={{ marginBottom: '20px' }}>
            <div className="grid-dashboard" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                {/* Date Range */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Fecha Publicación (Desde - Hasta)
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            className="form-input"
                            value={filters.startDate}
                            onChange={e => handleChange('startDate', e.target.value)}
                        />
                        <input
                            type="date"
                            className="form-input"
                            value={filters.endDate}
                            onChange={e => handleChange('endDate', e.target.value)}
                        />
                    </div>
                </div>

                {/* Search */}
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Búsqueda (GREQ, APCO, Descripción)
                    </label>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="form-input"
                        value={filters.search}
                        onChange={e => handleChange('search', e.target.value)}
                    />
                </div>

                {/* Observacion */}
                <div>
                    <label style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        Observación
                    </label>
                    <select
                        className="form-select"
                        value={filters.observacion}
                        onChange={e => handleChange('observacion', e.target.value)}
                    >
                        <option value="Todos">Todos</option>
                        <option value="ORIGINAL">ORIGINAL</option>
                        <option value="AJUSTE">AJUSTE</option>
                        <option value="ACTUALIZACIÓN">ACTUALIZACIÓN</option>
                        <option value="SUMA-VUCE">SUMA-VUCE</option>
                        <option value="COMPLEMENTARIO">COMPLEMENTARIO</option>
                        <option value="PENDIENTE">PENDIENTE</option>
                        <option value="OBSERVACION">OBSERVACION</option>
                    </select>
                </div>

                {/* MultiSelects */}
                <MultiSelect
                    label="Entidad"
                    options={uniqueEntidades}
                    selected={filters.entidades}
                    onChange={val => handleChange('entidades', val)}
                />
                <MultiSelect
                    label="SIGLA"
                    options={uniqueSiglas}
                    selected={filters.siglas}
                    onChange={val => handleChange('siglas', val)}
                />
                <MultiSelect
                    label="Resp. Análisis"
                    options={uniqueRespAnalisis}
                    selected={filters.respAnalisis}
                    onChange={val => handleChange('respAnalisis', val)}
                />
                <MultiSelect
                    label="Resp. Desarrollo"
                    options={uniqueRespDesarrollo}
                    selected={filters.respDesarrollo}
                    onChange={val => handleChange('respDesarrollo', val)}
                />
                <MultiSelect
                    label="Resp. CC"
                    options={uniqueRespCC}
                    selected={filters.respCC}
                    onChange={val => handleChange('respCC', val)}
                />

            </div>
        </div>
    );
};
