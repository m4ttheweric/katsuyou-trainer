export type Mode = "lookup" | "study" | "quiz" | "reference";

export interface RouteState {
  mode: Mode;
  verb?: string;
}

const VALID_MODES = new Set<Mode>(["lookup", "study", "quiz", "reference"]);
const DEFAULT_MODE: Mode = "lookup";

export function parseRoute(url: URL = new URL(window.location.href)): RouteState {
  const segment = url.pathname.split("/").filter(Boolean)[0] || DEFAULT_MODE;
  const mode: Mode = VALID_MODES.has(segment as Mode) ? (segment as Mode) : DEFAULT_MODE;
  const verb = url.searchParams.get("verb") || undefined;
  return mode === "lookup" && verb ? { mode, verb } : { mode };
}

export function buildPath(state: RouteState): string {
  const params = new URLSearchParams();
  if (state.mode === "lookup" && state.verb) params.set("verb", state.verb);
  const qs = params.toString();
  return `/${state.mode}${qs ? `?${qs}` : ""}`;
}

function currentPath(): string {
  return window.location.pathname + window.location.search;
}

export function pushRoute(state: RouteState): void {
  const path = buildPath(state);
  if (path !== currentPath()) {
    history.pushState(state, "", path);
  }
}

export function replaceRoute(state: RouteState): void {
  const path = buildPath(state);
  if (path !== currentPath()) {
    history.replaceState(state, "", path);
  }
}

export function onPopState(cb: (state: RouteState) => void): () => void {
  const handler = () => cb(parseRoute());
  window.addEventListener("popstate", handler);
  return () => window.removeEventListener("popstate", handler);
}
