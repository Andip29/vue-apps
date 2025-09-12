<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePacketProfileStore } from "../../../stores/packetProfile";

const props = defineProps({ uuid: { type: String, required: false } });
const route = useRoute();
const router = useRouter();
const store = usePacketProfileStore();

const id = ref(
  String(props.uuid || route.params.uuid || route.query.uuid || "")
);
const loading = ref(false);
const errorMsg = ref("");

const item = computed(() => store.current);
const bandwith = computed(() => item.value?.bandwith || null);
const groupProfile = computed(() => item.value?.group_profile || null);

const fmt = (v) =>
  v === null || v === undefined || v === "" ? "-" : String(v);
const fmtMoney = (n) => {
  const v = Number(n ?? 0);
  if (!Number.isFinite(v)) return "-";
  return v.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
};
const fmtDate = (v) => (!v ? "-" : new Date(v).toLocaleString());
const fmtRange = (min, max, unitMin, unitMax) => {
  const a = min ?? null,
    b = max ?? null;
  if (a == null && b == null) return "-";
  const u1 = unitMin || "",
    u2 = unitMax || u1;
  if (a != null && b != null)
    return `${a}–${b} ${u1 === u2 ? u1 : `${u1}/${u2}`}`;
  if (a != null) return `${a} ${u1}`;
  return `${b} ${u2}`;
};

async function load() {
  if (!id.value || id.value === "undefined" || id.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const it = await store.getOne(String(id.value));
    if (!it) throw new Error("Record not found");
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail packet profile";
  } finally {
    loading.value = false;
  }
}

function goBack() {
  // sesuaikan dengan nama route list-mu: 'packetprofile-list' atau 'packet-profile-list'
  router.push({ name: "packet-profile-list" });
}

onMounted(load);
watch(
  () => [props.uuid, route.params.uuid, route.query.uuid],
  ([p, rp, rq]) => {
    id.value = String(p || rp || rq || "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Detail Packet Profile</h2>
      <div class="card-actions d-flex align-items-center">
        <router-link
          :to="{ name: 'packet-profile-edit', params: { uuid: String(id) } }"
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
          title="Edit"
        >
          <i class="icons icon-note"></i>
        </router-link>
        <button class="btn btn-sm btn-secondary" @click="goBack">
          ← Kembali
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else-if="item" class="row g-3">
        <!-- Informasi Paket -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Informasi Paket</h5>
            </div>
            <div class="card-body">
              <dl class="row mb-0">
                <dt class="col-5">Nama</dt>
                <dd class="col-7">{{ fmt(item.name) }}</dd>
                <dt class="col-5">Harga Dasar</dt>
                <dd class="col-7">{{ fmtMoney(item.base_cost) }}</dd>
                <dt class="col-5">Harga Jual</dt>
                <dd class="col-7">{{ fmtMoney(item.price) }}</dd>
                <dt class="col-5">PPN</dt>
                <dd class="col-7">{{ fmt(item.ppn) }}%</dd>
                <dt class="col-5">Status</dt>
                <dd class="col-7">
                  <span
                    class="badge"
                    :class="item.is_active ? 'bg-success' : 'bg-secondary'"
                  >
                    {{ item.is_active ? "Aktif" : "Nonaktif" }}
                  </span>
                </dd>
                <dt class="col-5">UUID</dt>
                <dd class="col-7">{{ fmt(item.uuid) }}</dd>
                <dt class="col-5">Dibuat</dt>
                <dd class="col-7">{{ fmtDate(item.created_at) }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <!-- Bandwith & Group Profile -->
        <div class="col-md-6">
          <div class="card mb-3">
            <div class="card-header">
              <h5 class="card-title mb-0">Bandwith</h5>
            </div>
            <div class="card-body">
              <template v-if="bandwith">
                <dl class="row mb-0">
                  <dt class="col-5">Nama</dt>
                  <dd class="col-7">{{ fmt(bandwith.name) }}</dd>
                  <dt class="col-5">Upload</dt>
                  <dd class="col-7">
                    {{
                      fmtRange(
                        bandwith.upload_min,
                        bandwith.upload_max,
                        bandwith.upload_min_unit,
                        bandwith.upload_max_unit
                      )
                    }}
                  </dd>
                  <dt class="col-5">Download</dt>
                  <dd class="col-7">
                    {{
                      fmtRange(
                        bandwith.download_min,
                        bandwith.download_max,
                        bandwith.download_min_unit,
                        bandwith.download_max_unit
                      )
                    }}
                  </dd>
                  <dt class="col-5">UUID</dt>
                  <dd class="col-7">{{ fmt(bandwith.uuid) }}</dd>
                </dl>
              </template>
              <div v-else class="text-muted">—</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Group Profile</h5>
            </div>
            <div class="card-body">
              <template v-if="groupProfile">
                <dl class="row mb-0">
                  <dt class="col-5">Nama</dt>
                  <dd class="col-7">{{ fmt(groupProfile.name) }}</dd>
                  <dt class="col-5">UUID</dt>
                  <dd class="col-7">{{ fmt(groupProfile.uuid) }}</dd>
                </dl>
              </template>
              <div v-else class="text-muted">—</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Data tidak ditemukan.</div>
    </div>
  </section>
</template>
