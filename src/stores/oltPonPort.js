// src/stores/oltPonPort.js
import { defineStore } from "pinia";
import http from "../lib/api/http";

const BASE = "/master/olt-pon-port";

function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}
function numOrNull(v) {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function sanitizePayload(p = {}) {
  const o = { ...p };
  [
    "uuid",
    "code",
    "gpon_olt",
    "endpoint",
    "oid_code",
    "latitude",
    "longitude",
  ].forEach((k) => {
    if (o[k] != null) o[k] = String(o[k]).trim();
  });
  if (o.port_number != null) o.port_number = Number(o.port_number);
  if (o.txdbm !== undefined) o.txdbm = numOrNull(o.txdbm);
  if (o.is_active !== undefined) o.is_active = to01(o.is_active);
  // endpoint/oid_code bisa null
  if (o.endpoint === "") o.endpoint = null;
  if (o.oid_code === "") o.oid_code = null;
  return o;
}

export const useOltPonPortStore = defineStore("oltPonPort", {
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
    // == LIST (ringan) ==
    async fetchList({
      page = 1,
      limit = 10,
      olt_uuid = "",
      olt_card_uuid = "",
      search = "",
    } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (olt_uuid) params.olt_uuid = olt_uuid;
        if (olt_card_uuid) params.olt_card_uuid = olt_card_uuid;
        if (search) params.search = search;
        const { data } = await http.get(BASE, { params });
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
        return this.items;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat OLT PON Port";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // == LIST DETAIL (join ke card/olt, balik array) ==
    async fetchListDetail({
      page = 1,
      limit = 10,
      olt_uuid = "",
      olt_card_uuid = "",
      uuid = "",
    } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (olt_uuid) params.olt_uuid = olt_uuid;
        if (olt_card_uuid) params.olt_card_uuid = olt_card_uuid;
        if (uuid) params.uuid = uuid; // beberapa backend dukung filter uuid di "details"
        const { data } = await http.get(`${BASE}/details`, { params });
        this.items = Array.isArray(data?.data) ? data.data : [];
        this.meta = data?.meta ?? this.meta;
        return this.items;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat OLT PON Port (detail list)";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },

    // == DETAIL (dengan banyak fallback seperti OLT Card) ==
    async getOne(uuid, { olt_uuid = "", olt_card_uuid = "" } = {}) {
      this.loadingOne = true;
      this.error = null;
      try {
        if (!uuid) throw new Error("UUID kosong/invalid");

        const pid = String(uuid);
        const tryGET = async (url, config) => {
          try {
            const { data } = await http.get(url, config);
            const payload = data?.data ?? data ?? null;
            if (payload && !Array.isArray(payload)) return payload;
            if (Array.isArray(payload)) {
              return payload.find((x) => String(x?.uuid) === pid) || null;
            }
            return null;
          } catch (err) {
            // biarkan 404 lanjut ke fallback
            if (err?.response?.status && err.response.status !== 404) throw err;
            return null;
          }
        };

        // 1) /{uuid}
        let item = await tryGET(`${BASE}/${pid}`);
        // 2) /detail/{uuid}
        if (!item) item = await tryGET(`${BASE}/detail/${pid}`);
        // 3) /detail?uuid=...
        if (!item)
          item = await tryGET(`${BASE}/detail`, { params: { uuid: pid } });
        // 4) /details?uuid=... (list-detail → array)
        if (!item)
          item = await tryGET(`${BASE}/details`, { params: { uuid: pid } });
        // 5) /details by hint (olt_uuid/olt_card_uuid), lalu cari
        if (!item && (olt_uuid || olt_card_uuid)) {
          const arr = await this.fetchListDetail({
            page: 1,
            limit: 200,
            olt_uuid,
            olt_card_uuid,
            uuid: pid,
          });
          item = arr.find((x) => String(x?.uuid) === pid) || null;
        }
        // 6) fallback terakhir: cari di state
        if (!item && this.items?.length) {
          item = this.items.find((x) => String(x?.uuid) === pid) || null;
        }

        if (!item) throw new Error("Record not found");
        this.current = item;
        return item;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat detail OLT PON Port";
        throw e;
      } finally {
        this.loadingOne = false;
      }
    },

    // == CREATE ==
    async create(payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        const res = await http.post(`${BASE}/create`, body);
        const created = res?.data?.data ?? res?.data ?? null;
        if (created) {
          const key = String(created.uuid ?? "");
          if (!this.items.some((x) => String(x.uuid ?? "") === key)) {
            this.items.unshift(created);
          }
        }
        return created;
      } catch (e) {
        this.error =
          e?.response?.data?.message || e.message || "Gagal membuat PON Port";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // == UPDATE ==
    async update(uuid, payload) {
      this.saving = true;
      this.error = null;
      try {
        const body = sanitizePayload(payload);
        await http.put(`${BASE}/update/${uuid}`, body); // ganti ke POST bila backend mengharuskan
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
          "Gagal memperbarui PON Port";
        throw e;
      } finally {
        this.saving = false;
      }
    },

    // == DELETE ==
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
          e?.response?.data?.message || e.message || "Gagal menghapus PON Port";
        throw e;
      } finally {
        this.removing = false;
      }
    },

    // == BULK DELETE ==
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
          "Gagal menghapus banyak PON Port";
        throw e;
      } finally {
        this.removing = false;
      }
    },
  },
});
