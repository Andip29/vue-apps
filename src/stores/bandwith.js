import { defineStore } from "pinia";
import http from "../lib/api/http"; // sesuai struktur project kamu

export const useBandwithStore = defineStore("bandwith", {
  state: () => ({
    items: [],
    meta: {
      pagination: {
        per_page: 10,
        count: 0,
        current_page: 1,
        total: 0,
        total_pages: 0,
      },
    },
    current: null,
    loadingList: false,
    loadingOne: false,
    saving: false,
    removing: false,
    error: null,
  }),

  actions: {
    async fetchList({ page = 1, limit = 10 } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const { data } = await http.get("/master/bandwith", {
          params: { page, limit },
        });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? {
          pagination: {
            per_page: limit,
            count: 0,
            current_page: page,
            total: 0,
            total_pages: 0,
          },
        };
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat data bandwith";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;
      try {
        const { data } = await http.get(`/master/bandwith/${uuid}`);
        this.current = data?.data ?? null;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail bandwith";
        throw e;
      } finally {
        this.loadingOne = false;
      }
    },

    async create(payload) {
      this.saving = true;
      this.error = null;
      try {
        await http.post("/master/bandwith", payload);
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat bandwith";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        // PUT/PATCH — sesuaikan jika servermu hanya menerima salah satunya
        await http.put(`/master/bandwith/${uuid}`, payload);
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memperbarui bandwith";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    async remove(uuid) {
      this.removing = true;
      this.error = null;
      try {
        await http.delete(`/master/bandwith/${uuid}`);
        // hapus dari daftar lokal biar responsif
        this.items = this.items.filter((it) => it.uuid !== uuid);
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal menghapus bandwith";
        throw e;
      } finally {
        this.removing = false;
      }
    },
  },
});
