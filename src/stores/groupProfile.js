// src/stores/groupProfile.js
import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/group-profile";

const to01 = (v) => (v === 1 || v === "1" || v === true ? 1 : 0);

function sanitize(p = {}) {
  const obj = { ...p };

  [
    "uuid",
    "name",
    "type",
    "parent_pool",
    "module",
    "ip_local",
    "first_ip",
    "last_ip",
    "router_uuid", // opsional: kalau backend mendukung filter per router
  ].forEach((k) => {
    if (obj[k] != null) obj[k] = String(obj[k]).trim();
  });

  if (obj.is_active !== undefined) obj.is_active = to01(obj.is_active);
  return obj;
}

export const useGroupProfileStore = defineStore("groupProfile", {
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

    canSync: true,
  }),

  actions: {
    // GET /master/group-profile?limit=&page=[&router_uuid][&search]
    async fetchList({
      page = 1,
      limit = 10,
      router_uuid = "",
      search = "",
    } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (router_uuid) params.router_uuid = router_uuid;
        if (search) params.search = search;

        const { data } = await http.get(BASE, { params });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
        return this.items;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat Group Profile";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // OPTIONAL: beberapa backend punya /list-detail(s)
    async fetchListDetail({ page = 1, limit = 10, router_uuid = "" } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (router_uuid) params.router_uuid = router_uuid;

        // coba /list-detail lalu /list-details
        let res = await http
          .get(`${BASE}/list-detail`, { params })
          .catch(() => null);
        if (!res) res = await http.get(`${BASE}/list-details`, { params });

        const data = res?.data;
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
        return this.items;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat Group Profile (detail list)";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // DETAIL: tahan beberapa pola
    async getOne(uuid) {
      this.loadingOne = true;
      this.error = null;
      try {
        if (!uuid) throw new Error("UUID kosong/invalid");
        const id = String(uuid);

        const candidates = [
          `${BASE}/${id}`,
          `${BASE}/detail/${id}`,
          `${BASE}/show/${id}`,
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
          } catch (err) {
            lastErr = err;
            const code = err?.response?.status;
            if (code && code !== 404) throw err;
          }
        }

        if (!item && this.items?.length) {
          item = this.items.find((x) => String(x.uuid) === id) || null;
        }
        if (!item) throw lastErr || new Error("Record not found");

        this.current = item;
        return item;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail Group Profile";
        throw e;
      } finally {
        this.loadingOne = false;
      }
    },

    // POST /master/group-profile/create
    async create(payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitize(payload);
        const res = await http.post(`${BASE}/create`, body);
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
          e?.response?.data?.message ||
          e.message ||
          "Gagal membuat Group Profile";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // PUT /master/group-profile/update/:id  (kalau server pakai POST, kita fallback)
    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitize(payload);
        try {
          await http.put(`${BASE}/update/${uuid}`, body);
        } catch (err) {
          // fallback bila server ternyata pakai POST untuk update
          if (err?.response?.status === 405) {
            await http.post(`${BASE}/update/${uuid}`, body);
          } else {
            throw err;
          }
        }

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
          "Gagal memperbarui Group Profile";
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
          e?.response?.data?.message ||
          e.message ||
          "Gagal menghapus Group Profile";
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
          "Gagal menghapus banyak Group Profile";
        throw e;
      } finally {
        this.removing = false;
      }
    },

    // POST /master/group-profile/sync (opsional)
    async trySync(payload = {}) {
      if (!this.canSync) return null;
      const id = payload?.uuid ? String(payload.uuid) : null;

      const attempts = [];
      if (id) attempts.push({ m: "post", url: `${BASE}/sync/${id}`, body: {} });
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
          if ([404, 405, 500].includes(s)) continue;
          throw e;
        }
      }
      this.canSync = false;
      return null;
    },
    async sync(payload = {}) {
      return this.trySync(payload);
    },
  },
});
