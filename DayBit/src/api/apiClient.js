import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const REFRESH_URL = "/api/auth/refresh";
const CSRF_URL = "/api/auth/csrf";
const MUTATING_METHODS = ["post", "patch", "put", "delete"];

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
}

let defaultCsrfHeaderName = "X-XSRF-TOKEN";
let csrfFetchPromise = null;

function fetchCsrfToken() {
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = axios
    .get(CSRF_URL, {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      withCredentials: true,
    })
    .then((response) => {
      const result = response.data.result;
      defaultCsrfHeaderName = result.headerName || defaultCsrfHeaderName;
      return { token: result.token, headerName: defaultCsrfHeaderName };
    })
    .finally(() => {
      csrfFetchPromise = null;
    });

  return csrfFetchPromise;
}

export function refreshCsrfToken() {
  return fetchCsrfToken();
}

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (!MUTATING_METHODS.includes(method) || config.url === CSRF_URL) {
    return config;
  }

  const { token, headerName } = await fetchCsrfToken();
  config.headers = config.headers ?? {};
  config.headers[headerName] = token;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || !config) {
      return Promise.reject(error);
    }

    if (response.data?.code === "AUTH403_2" && !config._csrfRetry) {
      config._csrfRetry = true;
      return apiClient(config);
    }

    if (response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    // 재발급 자체가 실패하면 그대로 에러를 던짐 — 호출한 쪽에서 처리(리다이렉트 등)하도록 맡김.
    // 여기서 강제로 리다이렉트하면 콜백 페이지 같은 곳의 재시도 로직을 가로채 버림
    if (config.url === REFRESH_URL) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => apiClient(config));
    }

    isRefreshing = true;
    try {
      await apiClient.post(REFRESH_URL);
      flushQueue(null);
      return apiClient(config);
    } catch (refreshError) {
      flushQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
