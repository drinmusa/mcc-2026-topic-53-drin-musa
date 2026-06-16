import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { getAuthToken } from "./auth";
import { Platform } from "react-native";


const BASE_URL = Platform.select({
  ios: process.env.EXPO_PUBLIC_API_URL_IOS,
  android: process.env.EXPO_PUBLIC_API_URL_ANDROID,
  default: process.env.EXPO_PUBLIC_API_URL,
}) as string;
export type ApiError = {
  message: string;
  status?: number;
};

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "Something went wrong";

    const normalizedError: ApiError = {
      message,
      status,
    };

    return Promise.reject(normalizedError);
  },
);

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  console.log("🚀 ~ api.ts:63 ~ apiPost ~ url:", url);
  const response = await api.post<T>(url, body, config);
  return response.data;
}

export async function apiPut<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.put<T>(url, body, config);
  return response.data;
}

export async function apiPatch<T, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.patch<T>(url, body, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await api.delete<T>(url, config);
  return response.data;
}

export default api;
