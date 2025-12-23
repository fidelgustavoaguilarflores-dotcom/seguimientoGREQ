import React, { useState, useEffect } from 'react';
import { Row } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Paperclip } from 'lucide-react';

interface RecordsTableProps {
    data: Row[];
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ data }) => {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        setPage(1);
    }, [data]);

    const totalPages = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

    const getBadgeClass = (obs: string) => {
        switch (obs) {
            case 'PENDIENTE': return 'badge badge-danger';
            case 'SUMA-VUCE': return 'badge badge-success';
            case 'AJUSTE': return 'badge badge-warning';
            case 'ORIGINAL': return 'badge badge-info';
            default: return 'badge';
        }
    };

    return (
        <div className="card" style={{ marginTop: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Detalle de Requerimientos ({data.length})</h3>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                        className="form-input"
                        style={{ width: 'auto', cursor: 'pointer' }}
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        &lt; Prev
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        className="form-input"
                        style={{ width: 'auto', cursor: 'pointer' }}
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>GREQ</th>
                            <th>F. GREQ</th>
                            <th>Entidad</th>
                            <th>SIGLA</th>
                            <th>Observación</th>
                            <th>Resp. Análisis</th>
                            <th>Resp. Desarrollo</th>
                            <th>Resp. CC</th>
                            <th>F. Publicación</th>
                            <th>Adjunto</th>
                            <th style={{ width: '150px' }}>Avance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={row.recordId || `row-${index}`}>
                                <td style={{ fontWeight: 'bold' }}>{row.greq}</td>
                                <td>
                                    {row.fechaGreq
                                        ? format(row.fechaGreq, 'dd/MM/yyyy', { locale: es })
                                        : '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>{row.nombreEntidad}</span>
                                        <span style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{row.descripcionGreq}</span>
                                    </div>
                                </td>
                                <td>{row.sigla}</td>
                                <td>
                                    <span className={getBadgeClass(row.observacion)}>
                                        {row.observacion}
                                    </span>
                                </td>
                                <td>{row.responsableAnalisis}</td>
                                <td>{row.responsablesDesarrollo.join(', ')}</td>
                                <td>{row.responsableCC}</td>
                                <td>
                                    {row.fechaPublicacion
                                        ? format(row.fechaPublicacion, 'dd/MM/yyyy', { locale: es })
                                        : '-'}
                                </td>
                                <td>
                                    {row.archivoAdjunto && row.archivoAdjunto.length > 0 ? (
                                        <a
                                            href={row.archivoAdjunto[0].url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={row.archivoAdjunto[0].filename}
                                            className="btn-icon"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '4px 8px',
                                                backgroundColor: 'var(--primary)',
                                                color: 'white',
                                                borderRadius: '6px',
                                                textDecoration: 'none',
                                                fontSize: '0.85em'
                                            }}
                                        >
                                            <Paperclip size={14} style={{ marginRight: '4px' }} /> Ver
                                        </a>
                                    ) : '-'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="progress-bar" style={{ flexGrow: 1 }}>
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${row.porcentajeAvance || 0}%` }}
                                            ></div>
                                        </div>
                                        <span style={{ fontSize: '0.8em' }}>{row.porcentajeAvance || 0}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No hay registros
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
