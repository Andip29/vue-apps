import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/bandwith";

function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}

function sanitizePayload(p = {}) {
  const obj = { ...p };
  // trim string
  [
    "name",
    "upload_min",
    "upload_max",
    "upload_min_unit",
    "upload_max_unit",
    "download_min",
    "download_max",
    "download_min_unit",
    "download_max_unit",
  ].forEach((k) => {
    if (obj[k] != null) obj[k] = String(obj[k]).trim();
  });
  // boolean → 0/1 jika diperlukan backend
  if (obj.is_active !== undefined) obj.is_active = to01(obj.is_active);
  return obj;
}

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
    async fetchList({ page = 1, limit = 100, search = "" } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (search) params.search = search;
        const { data } = await http.get(BASE, { params });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat daftar Bandwidth";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;
      try {
        // API Bandwidth kamu: GET /master/bandwith/{uuid}
        const { data } = await http.get(`${BASE}/${uuid}`);
        this.current = data?.data ?? null;
        // fallback ke list jika perlu
        if (!this.current && this.items?.length) {
          this.current = this.items.find((it) => it.uuid === uuid) || null;
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail Bandwidth";
        throw e;
      } finally {
        this.loadingOne = false;
      }
    },

    async create(payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        await http.post(`${BASE}/create`, body);
        // opsional: bisa push ke items jika API mengembalikan data baru
        // if (res?.data?.data) this.items.unshift(res.data.data);
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat Bandwidth";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        // Sesuaikan method dengan server-mu:
        // sebelumnya kamu pakai PUT /master/bandwith/update/{uuid}
        await http.put(`${BASE}/update/${uuid}`, body);

        // sinkronkan ke state lokal
        const idx = this.items.findIndex((x) => x.uuid === uuid);
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...body, uuid };
        if (this.current?.uuid === uuid)
          this.current = { ...this.current, ...body };
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memperbarui Bandwidth";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    async remove(uuid) {
      this.removing = true;
      this.error = null;
      try {
        await http.delete(`${BASE}/delete/${uuid}`);
        this.items = this.items.filter((it) => it.uuid !== uuid);
        if (this.current?.uuid === uuid) this.current = null;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal menghapus Bandwidth";
        throw e;
      } finally {
        this.removing = false;
      }
    },
  },
});
