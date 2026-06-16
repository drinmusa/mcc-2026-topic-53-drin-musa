import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const TOKEN_KEY = "mcc_auth_token";
const USER_KEY = "mcc_auth_user";
const BASE_URL = Platform.select({
  ios: process.env.EXPO_PUBLIC_API_URL_IOS,
  android: process.env.EXPO_PUBLIC_API_URL_ANDROID,
  default: process.env.EXPO_PUBLIC_API_URL,
}) as string;

export type AuthUser = {
  id: number;
  email: string;
};

export async function saveAuthToken(token: string, user: AuthUser) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
  ]);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export async function clearAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function logout() {
  await clearAuth();
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await getAuthToken());
}

export function getAuthHeaders(token?: string) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

export async function login(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Login failed.");
  }

  const result = await response.json();
  await saveAuthToken(result.token, result.user);
  return result.user as AuthUser;
}

export async function register(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Registration failed.");
  }

  const result = await response.json();
  await saveAuthToken(result.token, result.user);
  return result.user as AuthUser;
}
