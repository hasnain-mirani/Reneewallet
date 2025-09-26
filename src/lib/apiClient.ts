// src/lib/apiClient.ts
export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: "auto" | "json" | "text" | "blob";
};

// Prefer relative /api by default.
// If you set VITE_API_BASE_URL, we trim trailing slashes.
const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");
// Always ensure base includes `/api`
const BASE_URL = fromEnv && fromEnv.length > 0 ? fromEnv : "/api";

if (typeof window !== "undefined") {
  (window as any).__API_BASE__ = BASE_URL;
}

function buildUrl(path: string) {
  // Guarantee `/api` prefix
  if (!path.startsWith("/")) path = "/" + path;
  return `${BASE_URL}${path}`;
}

async function parseResponse<T>(res: Response, responseType: ApiOptions["responseType"]) {
  if (res.status === 204 || res.headers.get("content-length") === "0") return null as T;

  const ct = res.headers.get("content-type") || "";
  const auto = !responseType || responseType === "auto";

  if (responseType === "blob" || (auto && (ct.includes("text/csv") || ct.includes("octet-stream")))) {
    return (await res.blob()) as unknown as T;
  }
  if (responseType === "text" || (auto && ct.startsWith("text/"))) {
    return (await res.text()) as unknown as T;
  }

  try {
    return (await res.json()) as T;
  } catch {
    return (await res.text()) as unknown as T;
  }
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = buildUrl(path); // ✅ all requests auto-prefixed with /api
  const method = opts.method ?? "GET";
  const resolvedToken =
    opts.token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const isGet = method === "GET" && opts.body == null;

  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    ...(opts.headers ?? {}),
  };
  if (!isGet) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: !isGet && opts.body != null ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
    signal: opts.signal,
  });

  const data = await parseResponse<T>(res, opts.responseType);

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    try {
      const asAny = data as any;
      if (asAny && typeof asAny === "object" && asAny.message) message = asAny.message;
    } catch { /* empty */ }
    throw new Error(`${res.status} ${message}`);
  }

  return data as T;
}
