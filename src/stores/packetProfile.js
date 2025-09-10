import { defineStore } from "pinia";
import http from "../lib/api/http";

export const usePacketProfileStore = defineStore("packetProfile", {
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
    loadingList: false,
    error: null,
  }),

  actions: {
    async fetchList({ page = 1, limit = 10, router_uuid } = {}) {
      this.loadingList = true;
      this.error = null;
      try {
        const params = { page, limit };
        if (router_uuid) params.router_uuid = router_uuid;

        const { data } = await http.get("/master/packet-profile", { params });
        // response contoh: { status, message, data: [...], meta: { pagination: {...} } }
        this.items = data?.data ?? [];
        this.meta = data?.meta ?? this.meta;
      } catch (e) {
        this.error =
          e?.response?.data?.message ||
          e.message ||
          "Gagal memuat Packet Profile";
        throw e;
      } finally {
        this.loadingList = false;
      }
    },
  },
});
