import { Row, Observacion } from '../types';
import { parse, isValid } from 'date-fns';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'http://localhost:5678/webhook/a0c58ae1-baa3-4825-8da2-412fc7ae5dc8';

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
}

function parseDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;

    // Try ISO/YYYY-MM-DD
    let parsed = new Date(dateStr);
    if (!isValid(parsed)) {
        // Try dd/MM/yyyy
        parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    }

    return isValid(parsed) ? parsed : null;
}

function normalizeInternalType(obs: string): Observacion {
    const valid: Observacion[] = [
        "OBSERVACION", "ORIGINAL", "AJUSTE", "ACTUALIZACIÓN",
        "SUMA-VUCE", "COMPLEMENTARIO", "PENDIENTE"
    ];
    return valid.includes(obs as Observacion) ? (obs as Observacion) : "OBSERVACION";
}

function normalizeArray(val: string[] | string): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return [val];
    return [];
}

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
        createdTime: r["createdTime"] ? new Date(r["createdTime"]) : undefined
    }));
}
