/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const isValidBackendUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  const lower = url.trim().toLowerCase();
  if (lower === "" || lower.startsWith("capacitor:") || lower.startsWith("file:") || lower.includes("capacitor://")) {
    return false;
  }
  
  // If running inside Capacitor APK on a physical device or emulator, localhost is invalid as a backend API endpoint
  const isAPK = !!(window as any).Capacitor ||
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "file:" ||
    window.location.origin?.includes("capacitor://");

  if (isAPK && (lower.includes("localhost") || lower.includes("127.0.0.1"))) {
    return false;
  }
  return true;
};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied for key:", key, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write denied for key:", key, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn("Storage removal denied for key:", key, e);
    }
  }
};

export const getDevAndPreprodUrls = () => {
  const buildUrl = (import.meta as any).env?.VITE_APP_URL || "";
  let devUrl = buildUrl;
  let preUrl = buildUrl;

  const realDevUrl = "https://ais-dev-szfco7srhypplt5m4keqex-53067259193.asia-east1.run.app";
  const realPreUrl = "https://ais-pre-szfco7srhypplt5m4keqex-53067259193.asia-east1.run.app";

  if (!buildUrl || buildUrl.includes(".pages.dev") || buildUrl.includes("localhost")) {
    devUrl = realDevUrl;
    preUrl = realPreUrl;
  } else if (buildUrl.includes("-dev-")) {
    preUrl = buildUrl.replace("-dev-", "-pre-");
  } else if (buildUrl.includes("-pre-")) {
    devUrl = buildUrl.replace("-pre-", "-dev-");
  } else {
    devUrl = realDevUrl;
    preUrl = realPreUrl;
  }
  return { devUrl, preUrl };
};

export const getApiUrl = (endpoint: string): string => {
  const isLocalWebview = 
    !!(window as any).Capacitor ||
    window.location.protocol === "capacitor:" || 
    window.location.protocol === "file:" ||
    window.location.origin?.includes("capacitor://");

  const isCloudflarePages = typeof window !== "undefined" && window.location.hostname?.endsWith(".pages.dev");

  const { devUrl } = getDevAndPreprodUrls();
  let isSeparatelyDeployed = isLocalWebview || isCloudflarePages;

  if (!isSeparatelyDeployed && devUrl && window.location.origin) {
    try {
      const u1 = new URL(window.location.origin);
      const u2 = new URL(devUrl);
      if (u1.hostname !== u2.hostname && !u1.hostname.includes("127.0.0.1") && !u1.hostname.includes("localhost")) {
        isSeparatelyDeployed = true;
      }
    } catch (e) {}
  }

  if (isSeparatelyDeployed) {
    const storedUrl = safeStorage.getItem("mai_backend_url");
    if (isValidBackendUrl(storedUrl) && (!storedUrl!.includes(".pages.dev") || storedUrl!.includes("8cd48335"))) {
      return `${storedUrl!.trim().replace(/\/$/, "")}${endpoint}`;
    }
    const defaultBackup = "https://8cd48335.aiworkspace-f4d.pages.dev";
    // Default fallback to the pre-configured backup server
    safeStorage.setItem("mai_backend_url", defaultBackup);
    return `${defaultBackup}${endpoint}`;
  }

  // Under normal browser environment, always use Relative path to handle dev/preprod URLs automatically and prevent CORS/stale storage.
  return endpoint;
};

// Helper to remap standard endpoints to the fallback instance if connections fail
export const getFallbackUrl = (input: RequestInfo | URL): string => {
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.href;
  } else if (input && typeof (input as any).url === "string") {
    urlStr = (input as any).url;
  }

  const defaultBackup = "https://8cd48335.aiworkspace-f4d.pages.dev";
  if (urlStr.startsWith("/")) {
    return `${defaultBackup}${urlStr}`;
  }
  
  try {
    const parsed = new URL(urlStr);
    return `${defaultBackup}${parsed.pathname}${parsed.search}`;
  } catch (e) {
    return urlStr.replace(/^https?:\/\/[^/]+/, defaultBackup);
  }
};

// Safe fetch wrapper to automatically inject custom keys into headers securely and implement automatic Render failover
export const safeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = "";
  if (typeof input === "string") {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && typeof (input as any).url === "string") {
    url = (input as any).url;
  }

  const injectKeys = (options?: RequestInit): RequestInit => {
    if (!url.includes("/api/")) return options || {};
    const customGeminiKey = safeStorage.getItem("mai_custom_gemini_key");
    const customOpenRouterKey = safeStorage.getItem("mai_custom_openrouter_key");
    if (!customGeminiKey && !customOpenRouterKey) return options || {};

    const opCopy = options ? { ...options } : {};
    const headersObj: Record<string, string> = {};
    if (opCopy.headers) {
      if (opCopy.headers instanceof Headers) {
        opCopy.headers.forEach((val, key) => { headersObj[key] = val; });
      } else if (Array.isArray(opCopy.headers)) {
        for (const [key, val] of opCopy.headers) { headersObj[key] = val; }
      } else {
        Object.assign(headersObj, opCopy.headers);
      }
    }
    if (customGeminiKey) headersObj["X-Gemini-Key"] = customGeminiKey.trim();
    if (customOpenRouterKey) headersObj["X-OpenRouter-Key"] = customOpenRouterKey.trim();
    opCopy.headers = headersObj;
    return opCopy;
  };

  const finalInit = injectKeys(init);

  try {
    const response = await window.fetch(input, finalInit);
    if (!response.ok && response.status >= 500) {
      console.warn(`Primary endpoint failed with status ${response.status}. Initiating automatic backup failover...`);
      const fallbackUrl = getFallbackUrl(input);
      return await window.fetch(fallbackUrl, finalInit);
    }
    return response;
  } catch (err) {
    console.warn("Primary API connection failed. Initiating automatic backup failover to 8cd48335.aiworkspace-f4d.pages.dev...", err);
    try {
      const fallbackUrl = getFallbackUrl(input);
      return await window.fetch(fallbackUrl, finalInit);
    } catch (fallbackErr) {
      console.error("Failover endpoint also failed:", fallbackErr);
      throw err; // throw original connection error
    }
  }
};

export const getGridColsClass = (count: number): string => {
  if (count === 1) return "grid-cols-1 max-w-2xl mx-auto";
  if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
  return "grid-cols-1 md:grid-cols-3 gap-6";
};
