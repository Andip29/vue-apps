import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/olt";

function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}

function sanitizePayload(p = {}) {
  const obj = { ...p };
  [
    "code",
    "brand",
    "type",
    "mode",
    "location",
    "latitude",
    "longitude",
    "ip_address",
    "username",
    "password",
    "community",
  ].forEach((k) => {
    if (obj[k] != null) obj[k] = String(obj[k]).trim();
  });
  if (obj.is_active !== undefined) obj.is_active = to01(obj.is_active);
  return obj;
}

export const useOltStore = defineStore("olt", {
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
          e?.response?.data?.message || e.message || "Gagal memuat daftar OLT";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;
      try {
        if (!uuid) throw new Error("UUID kosong/invalid");
        const endpoints = [
          `${BASE}/${uuid}`,
          `${BASE}/detail/${uuid}`,
          `${BASE}/show/${uuid}`,
        ];
        let item = null,
          lastErr = null;
        for (const url of endpoints) {
          try {
            const { data } = await http.get(url);
            item = data?.data ?? data ?? null;
            if (item) break;
          } catch (err) {
            lastErr = err;
            const code = err?.response?.status;
            if (code && code !== 404) throw err;
          }
        }
        if (!item && this.items?.length) {
          item =
            this.items.find((it) => String(it.uuid) === String(uuid)) || null;
        }
        if (!item) throw lastErr || new Error("Record not found");
        this.current = item;
        return item;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal memuat detail OLT";
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
        const res = await http.post(`${BASE}/create`, body);
        const newItem = res?.data?.data ?? res?.data ?? null;

        if (newItem) {
          // sisipkan ke list kalau belum ada
          const keyNew = String(newItem.uuid ?? newItem.id ?? "");
          if (
            !this.items.some((x) => String(x.uuid ?? x.id ?? "") === keyNew)
          ) {
            this.items.unshift(newItem);
          }
        }
        return newItem; // penting: untuk redirect ke edit/detail pakai uuid
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat OLT";
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
        // catatan: sesuai implementasi kamu, API pakai POST untuk update
        await http.post(`${BASE}/update/${uuid}`, body);

        // sinkronkan ke state lokal
        const idx = this.items.findIndex(
          (x) => String(x.uuid) === String(uuid)
        );
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...body, uuid };

        if (this.current && String(this.current.uuid) === String(uuid)) {
          this.current = { ...this.current, ...body };
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal memperbarui OLT";
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
        this.items = this.items.filter(
          (it) => String(it.uuid) !== String(uuid)
        );
        if (this.current?.uuid && String(this.current.uuid) === String(uuid)) {
          this.current = null;
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal menghapus OLT";
        throw e;
      } finally {
        this.removing = false;
      }
    },
  },
});
