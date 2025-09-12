<script setup>
import { reactive, ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import http from "../../../lib/api/http"; // axios instance kamu
import { usePacketProfileStore } from "../../../stores/packetProfile";

const route = useRoute();
const router = useRouter();
const store = usePacketProfileStore();

const loading = ref(false);
const errorMsg = ref("");

/** opsi dropdown */
const bandwithOptions = ref([]); // [{uuid, name, ...}]
const groupProfileOptions = ref([]); // [{uuid, name}]

/** filter opsional: pakai router_uuid (dari query / dari form) */
const routerUuidFilter = ref(String(route.query.router_uuid || ""));

/** form */
const form = reactive({
  router_uuid: String(route.query.router_uuid || ""), // opsional (juga jadi filter dropdown)
  name: "",
  bandwith_uuid: "",
  group_profile_uuid: "",
  base_cost: "",
  price: "",
  ppn: 11,
  is_active: true, // pakai boolean biar sejalan dg komponen edit
});

/** helpers */
const toNumberOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function fetchBandwithOptions() {
  const params = { page: 1, limit: 1000 };
  const routerId = routerUuidFilter.value || form.router_uuid;
  if (routerId) params.router_uuid = routerId;

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
  const routerId = routerUuidFilter.value || form.router_uuid;
  if (routerId) params.router_uuid = routerId;

  const { data } = await http.get("/master/group-profile", { params });
  groupProfileOptions.value = (data?.data ?? []).map((x) => ({
    uuid: x.uuid,
    name: x.name,
  }));
}

async function loadOptions() {
  try {
    await Promise.all([fetchBandwithOptions(), fetchGroupProfileOptions()]);
    // kalau pilihan lama tak ada di opsi baru (karena filter berubah), kosongkan
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
      e?.response?.data?.message || e?.message || "Gagal memuat opsi dropdown";
  }
}

onMounted(async () => {
  loading.value = true;
  await loadOptions();
  loading.value = false;
});

// reload opsi bila router_uuid (di form) berubah
watch(
  () => form.router_uuid,
  async () => {
    await loadOptions();
  }
);

const selectedBandwith = computed(
  () => bandwithOptions.value.find((o) => o.uuid === form.bandwith_uuid) || null
);
const selectedGroupProfile = computed(
  () =>
    groupProfileOptions.value.find((o) => o.uuid === form.group_profile_uuid) ||
    null
);

async function onSubmit() {
  errorMsg.value = "";
  try {
    const created = await store.create({
      router_uuid: (form.router_uuid || "").trim() || undefined,
      name: (form.name || "").trim() || undefined,
      bandwith_uuid: (form.bandwith_uuid || "").trim() || undefined,
      group_profile_uuid: (form.group_profile_uuid || "").trim() || undefined,
      base_cost: toNumberOrNull(form.base_cost),
      price: toNumberOrNull(form.price),
      ppn: toNumberOrNull(form.ppn),
      is_active: !!form.is_active,
    });

    const uuid = created?.uuid ?? created?.id ?? null;
    if (uuid)
      router.push({
        name: "packet-profile-list",
        params: { uuid: String(uuid) },
      });
    else router.push({ name: "packet-profile-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat packet profile";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header">
      <h2 class="card-title">Tambah Packet Profile</h2>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>
      <div v-if="loading" class="text-muted">Memuat opsi…</div>

      <form v-else @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Router UUID (opsional)</label>
            <input
              v-model.trim="form.router_uuid"
              type="text"
              class="form-control"
              placeholder="router uuid (opsional)"
            />
            <small class="text-muted">
              Jika diisi, dropdown Bandwith & Group Profile akan difilter untuk
              router ini.
            </small>
          </div>

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
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Harga Jual</label>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="1"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">PPN (%)</label>
            <input
              v-model.number="form.ppn"
              type="number"
              min="0"
              step="1"
              class="form-control"
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
            Simpan
          </button>
          <router-link
            :to="{ name: 'packet-profile-list' }"
            class="btn btn-secondary ms-2"
            >Batal</router-link
          >
        </div>
      </form>
    </div>
  </section>
</template>
