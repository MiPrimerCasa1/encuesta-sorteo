/** Normaliza query strings del SV (espacios antes de &, etc.). */
export function crearParamsUrl(search = window.location.search): URLSearchParams {
  const fixed = search
    .replace(/\s+&/g, "&")
    .replace(/&\s+/g, "&")
    .replace(/^\?\s*/, "?");
  return new URLSearchParams(fixed);
}

const CLAVES_TELEFONO_SUPERVISOR = [
  "supervisorCelular",
  "SupervisorCelular",
  "supervisor_celular",
  "telefono_supervisor",
  "telefonoSupervisor",
  "TelefonoSupervisor",
  "tel_supervisor",
  "telSupervisor",
  "celular_supervisor",
  "celularSupervisor",
  "supervisor_telefono",
];

function obtenerParametro(params: URLSearchParams, claves: string[]): string {
  for (const clave of claves) {
    const valor = params.get(clave);
    if (valor?.trim()) return valor.trim();
  }
  const clavesLower = new Set(claves.map((c) => c.toLowerCase()));
  for (const [key, value] of params.entries()) {
    if (clavesLower.has(key.toLowerCase()) && value.trim()) return value.trim();
  }
  return "";
}

/** Teléfono del supervisor para WhatsApp. No usar `telefono` del participante. */
export function obtenerTelefonoSupervisor(
  params: URLSearchParams,
  searchCrudo = window.location.search
): string {
  const directo = obtenerParametro(params, CLAVES_TELEFONO_SUPERVISOR);
  if (directo) return directo;

  for (const [key, value] of params.entries()) {
    const k = key.toLowerCase();
    if (!value.trim()) continue;
    if (
      k.includes("supervisor") &&
      (k.includes("celular") || k.includes("telefono") || k.includes("tel"))
    ) {
      return value.trim();
    }
  }

  const qs = searchCrudo.replace(/\s+&/g, "&");
  const match =
    qs.match(/[?&]supervisorCelular=([^&]+)/i) ||
    qs.match(/[?&]supervisor_celular=([^&]+)/i);
  if (match?.[1]) {
    try {
      return decodeURIComponent(match[1].trim());
    } catch {
      return match[1].trim();
    }
  }

  return "";
}

export const CLAVES_DOMICILIO_SUCURSAL = [
  "supervisorSucursalDireccion",
  "domicilio_sucursal",
  "domicilioSucursal",
  "domicilio_vendedor",
  "DomicilioVendedor",
  "direccion_sucursal",
  "direccionSucursal",
  "sucursal_domicilio",
  "domicilio_supervisor",
];
