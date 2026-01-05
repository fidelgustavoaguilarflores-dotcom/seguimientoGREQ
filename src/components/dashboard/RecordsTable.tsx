// Paginated table for detailed records.
// Shows key fields and a quick attachment link.
import React, { useState, useEffect } from "react";
import { Row } from "../../types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Paperclip } from "lucide-react";

interface RecordsTableProps {
  data: Row[];
}

export const RecordsTable: React.FC<RecordsTableProps> = ({ data }) => {
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const pageSize = 10;

  // Reset to first page whenever the filtered dataset changes.
  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  // Map observation states to badge styles.
  const getBadgeClass = (obs: string) => {
    switch (obs) {
      case "PENDIENTE":
        return "badge badge-danger";
      case "SUMA-VUCE":
        return "badge badge-success";
      case "AJUSTE":
        return "badge badge-warning";
      case "ORIGINAL":
        return "badge badge-info";
      case "COMPLEMENTARIO":
        return "badge badge-primary";
      case "ACTUALIZACION":
        return "badge badge-primary2";
      case "OBSERVACION":
        return "badge badge-primary3";
      default:
        return "badge";
    }
  };

  const getEstadoClass = (estado: string | null | undefined) => {
    const value = (estado ?? "").toString().toLowerCase();
    if (value.includes("aceptado")) {
      return "badge badge-aceptado";
    }
    if (value.includes("asignado")) {
      return "badge badge-asignado";
    }
    if (value.includes("concluido")) {
      return "badge badge-concluido";
    }
    if (value.includes("control de calidad finalizado")) {
      return "badge badge-control-de-calidad-finalizado";
    }
    if (value.includes("control de calidad solicitado")) {
      return "badge badge-control-de-calidad-solicitado";
    }
    if (value.includes("control funcional")) {
      return "badge badge-control-funcional";
    }
    if (value.includes("control funcional finalizado")) {
      return "badge badge-control-funcional-finalizado";
    }
    if (value.includes("desarrollo finalizado")) {
      return "badge badge-desarrollo-finalizado";
    }
    if (value.includes("publicado")) {
      return "badge badge-publicado";
    }
    if (value.includes("puesta produccion solicitado")) {
      return "badge badge-puesta-produccion-solicitado";
    }
    if (value.includes("solicitado")) {
      return "badge badge-solicitado";
    }
    return "badge";
  };

  const getProgressColor = (value: number) => {
    if (value >= 100) return "var(--primary)";
    if (value >= 80) return "var(--success)";
    if (value >= 60) return "var(--warning)";
    if (value >= 30) return "#fbbf24";
    return "var(--danger)";
  };

  return (
    <div className="card" style={{ marginTop: "20px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ margin: 0 }}>Detalle de Requerimientos ({data.length})</h3>
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            className="form-input"
            style={{ width: "auto", cursor: "pointer" }}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            &lt; Ant
          </button>
          <span
            style={{ display: "flex", alignItems: "center", padding: "0 10px" }}
          >
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="form-input"
            style={{ width: "auto", cursor: "pointer" }}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sig &gt;
          </button>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>GREQ</th>
              <th style={{ width: "140px" }}>Estado</th>
              <th>F. GREQ</th>
              <th style={{ width: "220px" }}>Entidad</th>
              <th>SIGLA</th>
              <th>Observación</th>
              <th>Resp. Análisis</th>
              <th>Resp. Desarrollo</th>
              <th>Resp. CC</th>
              <th>F. Publicación</th>
              <th>Adjunto</th>
              <th style={{ width: "110px" }}>Avance</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr key={row.recordId || `row-${index}`}>
                <td style={{ fontWeight: "bold" }}>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setSelectedRow(row)}
                    title="Ver detalle del requerimiento"
                  >
                    {row.greq}
                  </button>
                </td>
                <td>
                  <span className={getEstadoClass(row.estado)}>
                    {row.estado || "-"}
                  </span>
                </td>
                <td>
                  {row.fechaGreq
                    ? format(row.fechaGreq, "dd/MM/yyyy", { locale: es })
                    : "-"}
                </td>
                <td>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span>{row.nombreEntidad}</span>
                    <span
                      style={{ fontSize: "0.75em", color: "var(--text-muted)" }}
                    >
                      {row.descripcionGreq}
                    </span>
                  </div>
                </td>
                <td>{row.sigla}</td>
                <td>
                  <span className={getBadgeClass(row.observacion)}>
                    {row.observacion}
                  </span>
                </td>
                <td>{row.responsableAnalisis}</td>
                <td>{row.responsablesDesarrollo.join(", ")}</td>
                <td>{row.responsableCC}</td>
                <td>
                  {row.fechaPublicacion
                    ? format(row.fechaPublicacion, "dd/MM/yyyy", { locale: es })
                    : "-"}
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
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "4px 8px",
                        backgroundColor: "var(--primary)",
                        color: "white",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "0.85em",
                      }}
                    >
                      <Paperclip size={14} style={{ marginRight: "4px" }} /> Ver
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div className="progress-bar" style={{ flexGrow: 1 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${row.porcentajeAvance || 0}%`,
                          background: getProgressColor(
                            row.porcentajeAvance || 0
                          ),
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: "0.8em" }}>
                      {row.porcentajeAvance || 0}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  No hay registros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedRow && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle del GREQ ${selectedRow.greq}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">
                  Detalle del GREQ {selectedRow.greq}
                </div>
                <div className="modal-subtitle">
                  {selectedRow.nombreEntidad || selectedRow.entidad}
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setSelectedRow(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-title">Resumen</div>
                <div className="detail-grid">
                  <div>
                    <div className="detail-label">Estado</div>
                    <div className="detail-value">
                      {selectedRow.estado || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Observación</div>
                    <div className="detail-value">
                      {selectedRow.observacion || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Entidad</div>
                    <div className="detail-value">
                      {selectedRow.entidad || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">SIGLA</div>
                    <div className="detail-value">
                      {selectedRow.sigla || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">APCO</div>
                    <div className="detail-value">
                      {selectedRow.apco || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Avance</div>
                    <div className="detail-value">
                      {selectedRow.porcentajeAvance || 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Fechas</div>
                <div className="detail-grid">
                  <div>
                    <div className="detail-label">Fecha GREQ</div>
                    <div className="detail-value">
                      {selectedRow.fechaGreq
                        ? format(selectedRow.fechaGreq, "dd/MM/yyyy", {
                            locale: es,
                          })
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Fecha Publicación</div>
                    <div className="detail-value">
                      {selectedRow.fechaPublicacion
                        ? format(selectedRow.fechaPublicacion, "dd/MM/yyyy", {
                            locale: es,
                          })
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Inicio</div>
                    <div className="detail-value">
                      {selectedRow.fechaInicio
                        ? format(selectedRow.fechaInicio, "dd/MM/yyyy", {
                            locale: es,
                          })
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Final</div>
                    <div className="detail-value">
                      {selectedRow.fechaFinal
                        ? format(selectedRow.fechaFinal, "dd/MM/yyyy", {
                            locale: es,
                          })
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Responsables</div>
                <div className="detail-grid">
                  <div>
                    <div className="detail-label">Análisis</div>
                    <div className="detail-value">
                      {selectedRow.responsableAnalisis || "-"}
                    </div>
                    <div className="detail-meta">
                      Estado: {selectedRow.estadoAnalisis || "-"}
                    </div>
                    <div className="detail-meta">
                      <span>
                        Ini:{" "}
                        {selectedRow.fechaIniAnalisis
                          ? format(selectedRow.fechaIniAnalisis, "dd/MM/yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </span>
                      <span>
                        Fin:{" "}
                        {selectedRow.fechaFinAnalisis
                          ? format(selectedRow.fechaFinAnalisis, "dd/MM/yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Desarrollo</div>
                    <div className="detail-value">
                      {selectedRow.responsablesDesarrollo.length > 0
                        ? selectedRow.responsablesDesarrollo.join(", ")
                        : "-"}
                    </div>
                    <div className="detail-meta">
                      Estado: {selectedRow.estadoDesarrollo || "-"}
                    </div>
                    <div className="detail-meta">
                      <span>
                        Ini:{" "}
                        {selectedRow.fechaIniDesarrollo
                          ? format(
                              selectedRow.fechaIniDesarrollo,
                              "dd/MM/yyyy",
                              {
                                locale: es,
                              }
                            )
                          : "-"}
                      </span>
                      <span>
                        Fin:{" "}
                        {selectedRow.fechaFinDesarrollo
                          ? format(
                              selectedRow.fechaFinDesarrollo,
                              "dd/MM/yyyy",
                              {
                                locale: es,
                              }
                            )
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="detail-label">Control de Calidad</div>
                    <div className="detail-value">
                      {selectedRow.responsableCC || "-"}
                    </div>
                    <div className="detail-meta">
                      Estado: {selectedRow.estadoCC || "-"}
                    </div>
                    <div className="detail-meta">
                      <span>
                        Ini:{" "}
                        {selectedRow.fechaIniCC
                          ? format(selectedRow.fechaIniCC, "dd/MM/yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </span>
                      <span>
                        Fin:{" "}
                        {selectedRow.fechaFinCC
                          ? format(selectedRow.fechaFinCC, "dd/MM/yyyy", {
                              locale: es,
                            })
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Descripción</div>
                <div className="detail-long">
                  {selectedRow.descripcionGreq || "-"}
                </div>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Adjunto</div>
                {selectedRow.archivoAdjunto &&
                selectedRow.archivoAdjunto.length > 0 ? (
                  <a
                    href={selectedRow.archivoAdjunto[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {selectedRow.archivoAdjunto[0].filename || "Ver documento"}
                  </a>
                ) : (
                  <div className="detail-value">-</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
