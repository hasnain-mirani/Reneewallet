// src/lib/apiClient.ts
export type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;                 // if omitted, falls back to localStorage 'token'
  headers?: Record<string, string>;
  signal?: AbortSignal;
  responseType?: "auto" | "json" | "text" | "blob"; // default: auto
};

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5000/api";

function buildUrl(path: string) {
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

async function parseResponse<T>(res: Response, responseType: ApiOptions["responseType"]) {
  // No content
  if (res.status === 204 || res.headers.get("content-length") === "0") return null as T;

  const ct = res.headers.get("content-type") || "";
  const auto = !responseType || responseType === "auto";

  if (responseType === "blob" || (auto && (ct.includes("text/csv") || ct.includes("octet-stream")))) {
    return (await res.blob()) as unknown as T;
  }
  if (responseType === "text" || (auto && ct.startsWith("text/"))) {
    return (await res.text()) as unknown as T;
  }

  // Default to JSON
  try {
    return (await res.json()) as T;
  } catch {
    // Fallback to text if JSON parse fails
    return (await res.text()) as unknown as T;
  }
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = buildUrl(path);
  const method = opts.method ?? "GET";
  // Use explicit token if provided, otherwise try localStorage for reloads
  const resolvedToken =
    opts.token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);

  const res = await fetch(url, {
    method,
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...(opts.headers ?? {}),
    },
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
    signal: opts.signal,
  });

  const data = await parseResponse<T>(res, opts.responseType);

  if (!res.ok) {
    // Try to get a helpful error message
    let message = res.statusText || "Request failed";
    try {
      const asAny = data as any;
      if (asAny && typeof asAny === "object" && asAny.message) message = asAny.message;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${message}`);
  }

  return data as T;
}
