"use strict";

(() => {
  const settings = window.F101_CONFIG || {};
  const base = typeof settings.supabaseUrl === "string" ? settings.supabaseUrl.trim().replace(/\/+$/, "") : "";
  const key = typeof settings.publishableKey === "string" ? settings.publishableKey.trim() : "";
  const enabled = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base) && /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);

  async function request(path, data, token) {
    if (!enabled) throw new Error("Çevrimiçi takip ayarları tamamlanmadı.");
    const headers = {apikey: key, "Content-Type": "application/json"};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(base + path, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      const error = new Error("Çevrimiçi işlem tamamlanamadı.");
      error.status = response.status;
      throw error;
    }
    const body = await response.text();
    return body ? JSON.parse(body) : null;
  }

  window.F101Api = Object.freeze({
    enabled,
    rpc: (name, data = {}, token) => request(`/rest/v1/rpc/${name}`, data, token),
    login: (email, password) => request("/auth/v1/token?grant_type=password", {email,password}),
    refresh: refreshToken => request("/auth/v1/token?grant_type=refresh_token", {refresh_token:refreshToken}),
    logout: token => request("/auth/v1/logout?scope=local", {}, token)
  });
})();
