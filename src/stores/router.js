// src/stores/router.js
import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/router";

// helpers
const to01 = (v) => (v === 1 || v === "1" || v === true ? 1 : 0);

function sanitizePayload(p = {}) {
  const obj = { ...p };
  [
    "uuid",
    "code",
    "brand",
    "location",
    "latitude",
    "longitude",
    "ip_address",
    "username",
    "password",
    "community",
    "port",
    "ip_address_radius",
    "secret_radius",
  ].forEach((k) => {
    if (obj[k] != null) obj[k] = String(obj[k]).trim();
  });
  if (obj.is_active !== undefined) obj.is_active = to01(obj.is_active);
  return obj;
}

// optional: kirim multipart bila ada file[] yang diupload
function toFormDataIfFiles(payload = {}) {
  const files = payload.files || payload.file || payload["file[]"];
  const hasFiles =
    (Array.isArray(files) && files.length) ||
    (typeof File !== "undefined" && files instanceof File);

  if (!hasFiles) return null;

  const fd = new FormData();
  const body = sanitizePayload(payload);
  Object.entries(body).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });

  // dukung berbagai bentuk
  if (Array.isArray(files)) {
    files.forEach((f) => f && fd.append("file[]", f));
  } else if (files) {
    fd.append("file[]", files);
  }
  return fd;
}

export const useRouterStore = defineStore("routerMaster", {
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

    // NEW: flag untuk mematikan sync bila endpoint error (404/405/500)
    canSync: true,
  }),

  actions: {
    // GET /master/router?limit=&page=&search?
    async fetchList({ page = 1, limit = 10, search = "" } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (search) params.search = search;
        const { data } = await http.get(BASE, { params });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
        return this.items;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal memuat Router";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // DETAIL: coba beberapa pola supaya tahan perbedaan backend
    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;

      try {
        if (!uuid) throw new Error("UUID kosong/invalid");

        const id = String(uuid);
        const candidates = [
          `${BASE}/${id}`, // sesuai dokumenmu
          `${BASE}/detail/${id}`, // jika server expose /detail/:id
          `${BASE}/show/${id}`, // fallback (seperti di OLT)
        ];

        let item = null;
        let lastErr = null;

        for (const url of candidates) {
          try {
            const { data } = await http.get(url);
            const payload = data?.data ?? data ?? null;

            if (
              payload &&
              typeof payload === "object" &&
              !Array.isArray(payload)
            ) {
              item = payload;
              break;
            }
            if (Array.isArray(payload)) {
              item = payload.find((x) => String(x?.uuid) === id) || null;
              if (item) break;
            }
          } catch (err) {
            lastErr = err;
            const code = err?.response?.status;
            // kalau bukan 404, lempar langsung
            if (code && code !== 404) throw err;
          }
        }

        // fallback terakhir dari cache list
        if (!item && this.items?.length) {
          item = this.items.find((x) => String(x.uuid) === String(id)) || null;
        }

        if (!item) throw lastErr || new Error("Record not found");

        this.current = item;
        return item;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail Router";
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
        const fd = toFormDataIfFiles(payload);
        const body = fd || sanitizePayload(payload);
        const headers = fd
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined;

        const res = await http.post(`${BASE}/create`, body, headers);
        const newItem = res?.data?.data ?? res?.data ?? null;

        if (newItem) {
          const key = String(newItem.uuid ?? newItem.id ?? "");
          if (!this.items.some((x) => String(x.uuid ?? x.id ?? "") === key)) {
            this.items.unshift(newItem);
          }
        }
        return newItem;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat Router";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // UPDATE (POST /master/router/update/:id)
    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        const fd = toFormDataIfFiles(payload);
        const body = fd || sanitizePayload(payload);
        const headers = fd
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : undefined;

        await http.post(`${BASE}/update/${uuid}`, body, headers);

        // sinkron state lokal
        const idx = this.items.findIndex(
          (x) => String(x.uuid) === String(uuid)
        );
        if (idx !== -1)
          this.items[idx] = {
            ...this.items[idx],
            ...sanitizePayload(payload),
            uuid,
          };
        if (this.current && String(this.current.uuid) === String(uuid)) {
          this.current = { ...this.current, ...sanitizePayload(payload) };
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal memperbarui Router";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // DELETE single
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
          e?.response?.data?.message || e.message || "Gagal menghapus Router";
        throw e;
      } finally {
        this.removing = false;
      }
    },

    // DELETE bulk
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
          "Gagal menghapus banyak Router";
        throw e;
      } finally {
        this.removing = false;
      }
    },

    // NEW: sync "aman" — coba beberapa pola, auto-nonaktifkan kalau server error
    async trySync({ uuid } = {}) {
      if (!this.canSync) return null;

      const id = uuid ? String(uuid) : null;
      const attempts = [];

      // beberapa server expose /sync/:uuid
      if (id) attempts.push({ m: "post", url: `${BASE}/sync/${id}`, body: {} });
      // sebagian lain /sync dengan payload { uuid }
      attempts.push({
        m: "post",
        url: `${BASE}/sync`,
        body: id ? { uuid: id } : {},
      });

      for (const a of attempts) {
        try {
          const { data } = await http[a.m](a.url, a.body);
          return data?.data ?? data ?? null;
        } catch (e) {
          const s = e?.response?.status;
          // kalau endpoint tidak ada / method salah / server error, coba alternatif
          if ([404, 405, 500].includes(s)) continue;
          // error lain (401/403/network) bubble up
          throw e;
        }
      }

      // semua percobaan gagal => matikan sync untuk sesi ini
      this.canSync = false;
      return null;
    },

    // OPTIONAL: alias sync yang memakai trySync
    async sync(payload = {}) {
      const res = await this.trySync(payload);
      return res;
    },
  },
});
