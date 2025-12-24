// Normalized observation values used across filters, charts, and table badges.
export type Observacion =
    | "OBSERVACION"
    | "ORIGINAL"
    | "AJUSTE"
    | "ACTUALIZACIÓN"
    | "SUMA-VUCE"
    | "COMPLEMENTARIO"
    | "PENDIENTE";

// Primary row structure consumed by the UI.
export interface Row {
    recordId: string;
    greq: number;
    entidad: string;
    nombreEntidad: string;
    sigla: string;
    apco: string;
    observacion: Observacion;
    descripcionGreq: string;
    responsableAnalisis: string;
    estadoAnalisis: string;
    fechaIniAnalisis: Date | null;
    fechaFinAnalisis: Date | null;
    responsablesDesarrollo: string[];
    estadoDesarrollo: string;
    fechaIniDesarrollo: Date | null;
    fechaFinDesarrollo: Date | null;
    responsableCC: string;
    estadoCC: string;
    fechaIniCC: Date | null;
    fechaFinCC: Date | null;
    fechaInicio: Date | null;
    fechaFinal: Date | null;
    fechaPublicacion: Date | null;
    porcentajeAvance: number | null;
    orden: number | null;
    createdTime?: Date;
    fechaGreq: Date | null;
    archivoAdjunto: Attachment[];
}

// File metadata for attachments linked to a record.
export interface Attachment {
    id: string;
    url: string;
    filename: string;
    size?: number;
    type?: string;
}
