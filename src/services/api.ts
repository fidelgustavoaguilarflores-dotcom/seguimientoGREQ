// API layer for fetching and normalizing raw records coming from the webhook.
// Converts string-based fields into typed values used by UI components.
import { Row, Observacion, Attachment } from '../types';
import { parse, isValid } from 'date-fns';

// Webhook URL can be configured via VITE_WEBHOOK_URL, with a local fallback.
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:5678/webhook/a0c58ae1-baa3-4825-8da2-412fc7ae5dc8';

// Raw payload structure as received from the webhook (Airtable-like fields).
interface RawRecord {
    "GREQ": number;
    "Entidad": string;
    "Nombre Entidad": string;
    "SIGLA": string;
    "APCO": string;
    "Observación": string;
    "Descripción GREQ": string;
    "Responsable ANALISIS": string;
    "Estado ANALISIS": string;
    "Fecha Inicial ANALISIS": string | null;
    "Fecha Final ANALISIS": string | null;
    "Responsable DESARROLLO": string[] | string;
    "Estado DESARROLLO": string;
    "Fecha Inicial DESARROLLO": string | null;
    "Fecha Final DESARROLLO": string | null;
    "Responsable CONTROL DE CALIDAD": string;
    "Estado CONTROL DE CALIDAD": string;
    "Fecha Inicial CONTROL CALIDAD": string | null;
    "Fecha Final CONTROL CALIDAD": string | null;
    "Fecha Inicio": string | null;
    "Fecha Final": string | null;
    "Fecha Publicación": string | null;
    "Porcentaje de avance": number | null;
    "Orden": string | number;
    "Cálculo": string;
    "createdTime"?: string;
    "Fecha GREQ"?: string;
    "Archivo adjunto"?: Attachment[];
}

// Parses various date formats into a Date object or null.
function parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;

    // Try YYYY-MM-DD (Local Time)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return parse(dateStr, 'yyyy-MM-dd', new Date());
    }

    // Try ISO or other formats
    let parsed = new Date(dateStr);
    if (!isValid(parsed)) {
        // Try dd/MM/yyyy
        parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    }

    return isValid(parsed) ? parsed : null;
}

// Restricts raw observation values to a known set of types.
function normalizeInternalType(obs: string): Observacion {
    const valid: Observacion[] = [
        "OBSERVACION", "ORIGINAL", "AJUSTE", "ACTUALIZACIÓN",
        "SUMA-VUCE", "COMPLEMENTARIO", "PENDIENTE"
    ];
    return valid.includes(obs as Observacion) ? (obs as Observacion) : "OBSERVACION";
}

// Coerces a string or string[] into a string[] for multi-select fields.
function normalizeArray(val: string[] | string): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return [val];
    return [];
}

// Normalizes attachment data into a consistent array shape.
function normalizeAttachment(val: any): Attachment[] {
    if (!val) return [];
    // If it's a string (fast link), wrap it
    if (typeof val === 'string') {
        return [{
            id: 'generated-id',
            url: val,
            filename: 'Ver Documento',
            type: 'link'
        }];
    }
    // If it's an array (Airtable format)
    if (Array.isArray(val)) {
        return val.map(item => ({
            id: item.id || 'generated-id',
            url: item.url || '',
            filename: item.filename || 'Documento',
            size: item.size,
            type: item.type
        }));
    }
    return [];
}

/**
 * Fetches raw records from the webhook and maps them into typed Row objects.
 */
export async function fetchData(): Promise<Row[]> {
    const response = await fetch(WEBHOOK_URL);
    if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data: RawRecord[] = await response.json();

    return data.map(r => ({
        recordId: r["Cálculo"],
        greq: r["GREQ"],
        entidad: r["Entidad"] || '',
        nombreEntidad: r["Nombre Entidad"] || '',
        sigla: r["SIGLA"] || '',
        apco: r["APCO"] || '',
        observacion: normalizeInternalType(r["Observación"]),
        descripcionGreq: r["Descripción GREQ"] || '',
        responsableAnalisis: r["Responsable ANALISIS"] || '',
        estadoAnalisis: r["Estado ANALISIS"] || '',
        fechaIniAnalisis: parseDate(r["Fecha Inicial ANALISIS"]),
        fechaFinAnalisis: parseDate(r["Fecha Final ANALISIS"]),
        responsablesDesarrollo: normalizeArray(r["Responsable DESARROLLO"]),
        estadoDesarrollo: r["Estado DESARROLLO"] || '',
        fechaIniDesarrollo: parseDate(r["Fecha Inicial DESARROLLO"]),
        fechaFinDesarrollo: parseDate(r["Fecha Final DESARROLLO"]),
        responsableCC: r["Responsable CONTROL DE CALIDAD"] || '',
        estadoCC: r["Estado CONTROL DE CALIDAD"] || '',
        fechaIniCC: parseDate(r["Fecha Inicial CONTROL CALIDAD"]),
        fechaFinCC: parseDate(r["Fecha Final CONTROL CALIDAD"]),
        fechaInicio: parseDate(r["Fecha Inicio"]),
        fechaFinal: parseDate(r["Fecha Final"]),
        fechaPublicacion: parseDate(r["Fecha Publicación"]),
        porcentajeAvance: r["Porcentaje de avance"] != null ? r["Porcentaje de avance"] * 100 : 0,
        orden: typeof r["Orden"] === 'number' ? r["Orden"] : Number(r["Orden"]) || 0,
        createdTime: r["createdTime"] ? new Date(r["createdTime"]) : undefined,
        fechaGreq: parseDate(r["Fecha GREQ"] || null),
        archivoAdjunto: normalizeAttachment(r["Archivo adjunto"])
    }));
}
