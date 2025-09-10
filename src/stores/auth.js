import { defineStore } from "pinia";
import http from "../lib/api/http";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    tokenType: localStorage.getItem("token_type") || "bearer",
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.token,
  },
  actions: {
    async login({ user, password }) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await http.post("/user/login", { user, password });

        if (data?.status && data?.data?.access_token) {
          this.token = data.data.access_token;
          this.tokenType = data.data.token_type || "bearer";
          localStorage.setItem("token", this.token);
          localStorage.setItem("token_type", this.tokenType);
          return true;
        }

        const msg = data?.message || "Login gagal";
        this.error = msg;
        throw new Error(msg);
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          this.error ||
          e.message ||
          "Login gagal";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    logoutLocal() {
      this.token = null;
      this.tokenType = "bearer";
      localStorage.removeItem("token");
      localStorage.removeItem("token_type");
    },

    async logoutServer() {
      try {
        await http.post("/user/logout");
      } catch (e) {
        /* abaikan error server */
      }
      this.logoutLocal();
    },
  },
});
