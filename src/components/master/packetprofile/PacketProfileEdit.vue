<script setup>
import { reactive, ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import http from "../../../lib/api/http"; // axios instance
import { usePacketProfileStore } from "../../../stores/packetProfile";

const route = useRoute();
const router = useRouter();
const store = usePacketProfileStore();

const uuid = ref(String(route.params.uuid || ""));
const loading = ref(false);
const errorMsg = ref("");

/** opsi dropdown */
const bandwithOptions = ref([]); // [{uuid,name, ...detail}]
const groupProfileOptions = ref([]); // [{uuid,name}]

/** optional filter: kalau kamu ingin hanya opsi milik router tertentu */
const routerUuidFilter = ref(String(route.query.router_uuid || ""));

/** form */
const form = reactive({
  name: "",
  bandwith_uuid: "",
  group_profile_uuid: "",
  base_cost: "",
  price: "",
  ppn: 11,
  is_active: true,
});

/** helper */
function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function hydrate(it) {
  form.name = it?.name ?? "";
  form.base_cost = it?.base_cost ?? "";
  form.price = it?.price ?? "";
  form.ppn = it?.ppn ?? 11;
  form.is_active =
    it?.is_active === 1 || it?.is_active === "1" || it?.is_active === true;

  // dari detail API ada nested objek
  form.bandwith_uuid = it?.bandwith?.uuid ?? it?.bandwith_uuid ?? "";
  form.group_profile_uuid =
    it?.group_profile?.uuid ?? it?.group_profile_uuid ?? "";

  // kalau backend mengembalikan router_uuid, pakai untuk memfilter opsi
  if (it?.router_uuid) routerUuidFilter.value = String(it.router_uuid);
}

/** load opsi dropdown */
async function fetchBandwithOptions() {
  const params = { page: 1, limit: 1000 };
  if (routerUuidFilter.value) params.router_uuid = routerUuidFilter.value;
  const { data } = await http.get("/master/bandwith", { params });
  bandwithOptions.value = (data?.data ?? []).map((x) => ({
    uuid: x.uuid,
    name: x.name,
    upload_min: x.upload_min,
    upload_max: x.upload_max,
    upload_min_unit: x.upload_min_unit,
    upload_max_unit: x.upload_max_unit,
    download_min: x.download_min,
    download_max: x.download_max,
    download_min_unit: x.download_min_unit,
    download_max_unit: x.download_max_unit,
  }));
}
async function fetchGroupProfileOptions() {
  const params = { page: 1, limit: 1000 };
  if (routerUuidFilter.value) params.router_uuid = routerUuidFilter.value;
  const { data } = await http.get("/master/group-profile", { params });
  groupProfileOptions.value = (data?.data ?? []).map((x) => ({
    uuid: x.uuid,
    name: x.name,
  }));
}

/** selected summary (untuk panel ringkas di kanan) */
const selectedBandwith = computed(
  () => bandwithOptions.value.find((o) => o.uuid === form.bandwith_uuid) || null
);
const selectedGroupProfile = computed(
  () =>
    groupProfileOptions.value.find((o) => o.uuid === form.group_profile_uuid) ||
    null
);

/** load detail + opsi */
async function load() {
  if (!uuid.value) {
    errorMsg.value = "UUID tidak valid.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    // ambil detail dulu agar dapat router_uuid (jika ada) -> lalu ambil opsi
    const it = await store.getOne(uuid.value);
    if (!it) throw new Error("Record not found");

    hydrate(it);
    await Promise.all([fetchBandwithOptions(), fetchGroupProfileOptions()]);

    // validasi: kalau uuid dari detail tidak ada di opsi (data lama), kosongkan
    if (
      form.bandwith_uuid &&
      !bandwithOptions.value.some((o) => o.uuid === form.bandwith_uuid)
    ) {
      form.bandwith_uuid = "";
    }
    if (
      form.group_profile_uuid &&
      !groupProfileOptions.value.some((o) => o.uuid === form.group_profile_uuid)
    ) {
      form.group_profile_uuid = "";
    }
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat packet profile";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    await store.update(uuid.value, {
      name: (form.name || "").trim() || undefined,
      bandwith_uuid: (form.bandwith_uuid || "").trim() || undefined,
      group_profile_uuid: (form.group_profile_uuid || "").trim() || undefined,
      base_cost: toNumberOrNull(form.base_cost),
      price: toNumberOrNull(form.price),
      ppn: toNumberOrNull(form.ppn),
      is_active: !!form.is_active,
    });
    router.push({
      name: "packet-profile-detail",
      params: { uuid: String(uuid.value) },
    });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal menyimpan perubahan";
  }
}

/** re-load bila ganti uuid route */
onMounted(load);
watch(
  () => route.params.uuid,
  (v) => {
    uuid.value = String(v || "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Edit Packet Profile</h2>
      <div class="card-actions d-flex align-items-center">
        <router-link
          :to="{ name: 'packet-profile-detail', params: { uuid } }"
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
        >
          <i class="icons icon-note"></i>
        </router-link>
        <router-link
          :to="{ name: 'packet-profile-list' }"
          class="btn btn-sm btn-secondary"
        >
          Kembali
        </router-link>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form v-else @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nama Paket</label>
            <input
              v-model.trim="form.name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="col-md-6">
            <label class="form-label">Bandwith</label>
            <select v-model="form.bandwith_uuid" class="form-select" required>
              <option value="" disabled>Pilih Bandwith…</option>
              <option
                v-for="bw in bandwithOptions"
                :key="bw.uuid"
                :value="bw.uuid"
              >
                {{ bw.name }}
              </option>
            </select>
            <small class="text-muted" v-if="!bandwithOptions.length"
              >Tidak ada bandwith tersedia.</small
            >
          </div>

          <div class="col-md-6">
            <label class="form-label">Group Profile</label>
            <select
              v-model="form.group_profile_uuid"
              class="form-select"
              required
            >
              <option value="" disabled>Pilih Group Profile…</option>
              <option
                v-for="gp in groupProfileOptions"
                :key="gp.uuid"
                :value="gp.uuid"
              >
                {{ gp.name }}
              </option>
            </select>
            <small class="text-muted" v-if="!groupProfileOptions.length"
              >Tidak ada group profile tersedia.</small
            >
          </div>

          <div class="col-md-4">
            <label class="form-label">Harga Dasar</label>
            <input
              v-model.number="form.base_cost"
              type="number"
              class="form-control"
              min="0"
              step="1"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Harga Jual</label>
            <input
              v-model.number="form.price"
              type="number"
              class="form-control"
              min="0"
              step="1"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">PPN (%)</label>
            <input
              v-model.number="form.ppn"
              type="number"
              class="form-control"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input
            id="isActive"
            class="form-check-input"
            type="checkbox"
            v-model="form.is_active"
          />
          <label class="form-check-label" for="isActive">Aktif</label>
        </div>

        <!-- Ringkasan pilihan -->
        <div class="row g-3 mt-3">
          <div class="col-md-6" v-if="selectedBandwith">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Ringkasan Bandwith</h5>
              </div>
              <div class="card-body">
                <div>
                  <strong>{{ selectedBandwith.name }}</strong>
                </div>
                <div class="text-muted">
                  Up: {{ selectedBandwith.upload_min }}–{{
                    selectedBandwith.upload_max
                  }}
                  {{ selectedBandwith.upload_max_unit }}, Down:
                  {{ selectedBandwith.download_min }}–{{
                    selectedBandwith.download_max
                  }}
                  {{ selectedBandwith.download_max_unit }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6" v-if="selectedGroupProfile">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Ringkasan Group Profile</h5>
              </div>
              <div class="card-body">
                <div>
                  <strong>{{ selectedGroupProfile.name }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="store.saving"
          >
            <span
              v-if="store.saving"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Simpan Perubahan
          </button>
          <router-link
            :to="{ name: 'packet-profile-detail', params: { uuid } }"
            class="btn btn-secondary ms-2"
          >
            Batal
          </router-link>
        </div>
      </form>
    </div>
  </section>
</template>
