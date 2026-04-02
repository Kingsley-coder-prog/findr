import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("findr_user")) || null);
  const token = ref(localStorage.getItem("findr_token") || null);

  const isLoggedIn = computed(() => !!token.value);
  const isPremium = computed(() => user.value?.plan === "premium");

  async function register(name, email, password) {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    setAuth(data.user, data.token);
    return data;
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setAuth(data.user, data.token);
    return data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuth();
      window.location.href = "/login";
    }
  }

  function setAuth(userData, tokenValue) {
    user.value = userData;
    token.value = tokenValue;
    localStorage.setItem("findr_user", JSON.stringify(userData));
    localStorage.setItem("findr_token", tokenValue);
  }

  function clearAuth() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("findr_user");
    localStorage.removeItem("findr_token");
  }

  return { user, token, isLoggedIn, isPremium, register, login, logout };
});
