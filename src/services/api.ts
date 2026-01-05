// API layer for fetching and normalizing raw records coming from the webhook.
// Converts string-based fields into typed values used by UI components.
import { Row, Observacion, Attachment } from "../types";
import { parse, isValid } from "date-fns";

// Webhook URL can be configured via VITE_WEBHOOK_URL, with a local fallback.
const WEBHOOK_URL =
  import.meta.env.VITE_WEBHOOK_URL ||
  "http://desa.vuce.gob.bo:5678/webhook/a0c58ae1-baa3-4825-8da2-412fc7ae5dc8";

// Raw payload structure as received from the webhook (Airtable-like fields).
interface RawRecord {
  [key: string]: any;
  GREQ?: number;
  Estado?: string;
  Entidad?: string;
  "Nombre Entidad"?: string;
  SIGLA?: string;
  APCO?: string;
  Observacion?: string;
  Observación?: string;
  "Observaci¢n"?: string;
  "Descripci¢n GREQ"?: string;
  "Descripción GREQ"?: string;
  "Responsable ANALISIS"?: string;
  "Estado ANALISIS"?: string;
  "Fecha Inicial ANALISIS"?: string | null;
  "Fecha Final ANALISIS"?: string | null;
  "Responsable DESARROLLO"?: string[] | string;
  "Estado DESARROLLO"?: string;
  "Fecha Inicial DESARROLLO"?: string | null;
  "Fecha Final DESARROLLO"?: string | null;
  "Responsable CONTROL DE CALIDAD"?: string;
  "Estado CONTROL DE CALIDAD"?: string;
  "Fecha Inicial CONTROL CALIDAD"?: string | null;
  "Fecha Final CONTROL CALIDAD"?: string | null;
  "Fecha Inicio"?: string | null;
  "Fecha Final"?: string | null;
  "Fecha Publicación"?: string | null;
  "Fecha Publicaci¢n"?: string | null;
  "Porcentaje de avance"?: number | null;
  Orden?: string | number;
  "C lculo"?: string;
  Cálculo?: string;
  createdTime?: string;
  "Fecha GREQ"?: string;
  "Archivo adjunto"?: Attachment[];
}

// Parses various date formats into a Date object or null.
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // Try YYYY-MM-DD (Local Time)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return parse(dateStr, "yyyy-MM-dd", new Date());
  }

  // Try ISO or other formats
  let parsed = new Date(dateStr);
  if (!isValid(parsed)) {
    // Try dd/MM/yyyy
    parsed = parse(dateStr, "dd/MM/yyyy", new Date());
  }

  return isValid(parsed) ? parsed : null;
}

// Restricts raw observation values to a known set of types.
export function normalizeInternalType(obs: string): Observacion {
  const raw = String(obs ?? "").toUpperCase();
  const normalized = raw.normalize("NFD").replace(/[̀-ͯ]/g, "");

  if (normalized.includes("ACTUALIZACION")) return "ACTUALIZACION";
  if (normalized.includes("OBSERVACION")) return "OBSERVACION";
  if (normalized.includes("ORIGINAL")) return "ORIGINAL";
  if (normalized.includes("AJUSTE")) return "AJUSTE";
  if (normalized.includes("SUMA-VUCE")) return "SUMA-VUCE";
  if (normalized.includes("COMPLEMENTARIO")) return "COMPLEMENTARIO";
  if (normalized.includes("PENDIENTE")) return "PENDIENTE";

  return "OBSERVACION";
}

// Coerces a string or string[] into a string[] for multi-select fields.
export function normalizeArray(val: string[] | string | any[] | undefined): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => normalizeText(item)).filter(Boolean);
  }
  if (typeof val === "string") return [val];
  return [];
}

// Normalizes attachment data into a consistent array shape.
export function normalizeAttachment(val: any): Attachment[] {
  if (!val) return [];
  // If it's a string (fast link), wrap it
  if (typeof val === "string") {
    return [
      {
        id: "generated-id",
        url: val,
        filename: "Ver Documento",
        type: "link",
      },
    ];
  }
  // If it's an array (Airtable format)
  if (Array.isArray(val)) {
    return val.map((item) => ({
      id: item.id || "generated-id",
      url: item.url || "",
      filename: item.filename || "Documento",
      size: item.size,
      type: item.type,
    }));
  }
  return [];
}

export function normalizeText(val: any): string {
  if (val == null) return "";
  if (typeof val === "string" || typeof val === "number") {
    return String(val);
  }
  if (typeof val === "object") {
    if ("value" in val) return String((val as { value?: unknown }).value ?? "");
    if ("name" in val) return String((val as { name?: unknown }).name ?? "");
    if ("id" in val) return String((val as { id?: unknown }).id ?? "");
  }
  return "";
}

export function normalizePercentage(val: any): number {
  if (val == null || val == "") return 0;
  const num = typeof val == "number" ? val : Number(val);
  if (Number.isNaN(num)) return 0;
  if (num <= 1) return num * 100;
  return num;
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

  return data.map((r) => ({
    recordId: normalizeText(r["Cálculo"] || r["C lculo"] || r["Cÿlculo"]) || "",
    greq: r["GREQ"] ?? 0,
    estado: normalizeText(r["Estado"]),
    entidad: normalizeText(r["Entidad"]),
    nombreEntidad: normalizeText(r["Nombre Entidad"]),
    sigla: normalizeText(r["SIGLA"]),
    apco: normalizeText(r["APCO"]),
    observacion: normalizeInternalType(
      normalizeText(
        r["Observación"] ||
        r["Observacion"] ||
        r["Observaci¢n"] ||
        r["Observaci½n"]
      )
    ),
    descripcionGreq: normalizeText(
      r["Descripción GREQ"] || r["Descripci¢n GREQ"] || r["Descripci½n GREQ"]
    ),
    responsableAnalisis: normalizeText(r["Responsable ANALISIS"]),
    estadoAnalisis: normalizeText(r["Estado ANALISIS"]),
    fechaIniAnalisis: parseDate(r["Fecha Inicial ANALISIS"] ?? null),
    fechaFinAnalisis: parseDate(r["Fecha Final ANALISIS"] ?? null),
    responsablesDesarrollo: normalizeArray(r["Responsable DESARROLLO"]),
    estadoDesarrollo: normalizeText(r["Estado DESARROLLO"]),
    fechaIniDesarrollo: parseDate(r["Fecha Inicial DESARROLLO"] ?? null),
    fechaFinDesarrollo: parseDate(r["Fecha Final DESARROLLO"] ?? null),
    responsableCC: normalizeText(r["Responsable CONTROL DE CALIDAD"]),
    estadoCC: normalizeText(r["Estado CONTROL DE CALIDAD"]),
    fechaIniCC: parseDate(r["Fecha Inicial CONTROL CALIDAD"] ?? null),
    fechaFinCC: parseDate(r["Fecha Final CONTROL CALIDAD"] ?? null),
    fechaInicio: parseDate(r["Fecha Inicio"] ?? null),
    fechaFinal: parseDate(r["Fecha Final"] ?? null),
    fechaPublicacion: parseDate(
      r["Fecha Publicación"] || r["Fecha Publicaci¢n"] || r["Fecha Publicaci½n"]
    ),
    porcentajeAvance: normalizePercentage(r["Porcentaje de avance"]),
    orden:
      typeof r["Orden"] === "number" ? r["Orden"] : Number(r["Orden"]) || 0,
    createdTime: r["createdTime"] ? new Date(r["createdTime"]) : undefined,
    fechaGreq: parseDate(r["Fecha GREQ"] || null),
    archivoAdjunto: normalizeAttachment(r["Archivo adjunto"]),
  }));
}
