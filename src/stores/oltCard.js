import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/olt-card"; // ganti di sini jika prefix berbeda

function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}

function sanitizePayload(p = {}) {
  const obj = { ...p };
  ["uuid", "olt_uuid", "code", "card_type", "model"].forEach((k) => {
    if (obj[k] != null) obj[k] = String(obj[k]).trim();
  });
  if (obj.slot_number != null) obj.slot_number = Number(obj.slot_number);
  if (obj.is_active !== undefined) obj.is_active = to01(obj.is_active);
  return obj;
}

export const useOltCardStore = defineStore("oltCard", {
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
    // LIST
    async fetchList({ page = 1, limit = 10, olt_uuid = "", search = "" } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (olt_uuid) params.olt_uuid = olt_uuid;
        if (search) params.search = search;
        const { data } = await http.get(BASE, { params });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal memuat OLT Card";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // LIST DETAIL (opsional; pakai jika endpoint ini dibutuhkan)
    async fetchListDetail({ page = 1, limit = 10, olt_uuid = "" } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        // ubah "list-detail" kalau beda
        const { data } = await http.get(`${BASE}/list-detail`, {
          params: { page, limit, olt_uuid },
        });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat OLT Card (detail list)";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // DETAIL (dengan fallback /detail/:uuid)
    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;
      try {
        if (!uuid) throw new Error("UUID kosong/invalid");
        const endpoints = [`${BASE}/${uuid}`, `${BASE}/detail/${uuid}`];
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
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail OLT Card";
        throw e;
      } finally {
        this.loadingOne = false;
      }
    },

    // CREATE
    async create(payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        const res = await http.post(`${BASE}/create`, body);
        const newItem = res?.data?.data ?? res?.data ?? null;
        if (newItem) {
          const key = String(newItem.uuid ?? "");
          if (!this.items.some((x) => String(x.uuid ?? "") === key)) {
            this.items.unshift(newItem);
          }
        }
        return newItem;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat OLT Card";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // UPDATE
    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        await http.put(`${BASE}/update/${uuid}`, body);
        const idx = this.items.findIndex(
          (x) => String(x.uuid) === String(uuid)
        );
        if (idx !== -1) this.items[idx] = { ...this.items[idx], ...body, uuid };
        if (this.current && String(this.current.uuid) === String(uuid)) {
          this.current = { ...this.current, ...body };
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memperbarui OLT Card";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // SYNC kartu OLT berdasarkan OLT UUID (bukan card UUID)
    async syncByOlt(olt_uuid) {
      this.saving = true;
      this.error = null;
      try {
        const id = String(olt_uuid || "").trim();
        if (!id) throw new Error("OLT UUID kosong/invalid");

        // urutkan beberapa kemungkinan endpoint + method
        const attempts = [
          { m: "post", url: `${BASE}/sync-olt/${id}`, body: {} }, // POST /sync-olt/:id
          { m: "get", url: `${BASE}/sync-olt/${id}` }, // GET  /sync-olt/:id
          { m: "post", url: `${BASE}/sync-olt`, body: { olt_uuid: id } }, // POST /sync-olt body
          { m: "post", url: `${BASE}/sync-card`, body: { olt_uuid: id } }, // legacy fallback
        ];

        let lastErr = null;
        for (const a of attempts) {
          try {
            const res =
              a.m === "get"
                ? await http.get(a.url)
                : await http.post(a.url, a.body);
            return res?.data?.data ?? res?.data ?? null;
          } catch (e) {
            lastErr = e;
            const code = e?.response?.status;
            // 404/405/400/500 -> coba pola berikutnya
            if ([404, 405, 400, 500].includes(code)) continue;
            throw e; // error lain langsung lempar
          }
        }
        throw lastErr || new Error("Sync endpoint tidak tersedia");
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal melakukan sync card";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // DELETE (single)
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
          e?.response?.data?.message || e.message || "Gagal menghapus OLT Card";
        throw e;
      } finally {
        this.removing = false;
      }
    },

    // DELETES (bulk)
    async removeMany(uuids = []) {
      this.removing = true;
      this.error = null;
      try {
        await http.delete(`${BASE}/deletes`, { data: { uuids } });
        const set = new Set(uuids.map(String));
        this.items = this.items.filter((it) => !set.has(String(it.uuid)));
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal menghapus OLT Card (batch)";
        throw e;
      } finally {
        this.removing = false;
      }
    },
  },
});
