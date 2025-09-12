<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroupProfileStore } from "../../../stores/groupProfile";
import { useRouterStore } from "../../../stores/router";

const route = useRoute();
const router = useRouter();

const gpStore = useGroupProfileStore();
const rtStore = useRouterStore();

const uuid = ref(String(route.params.uuid || ""));
const idStr = computed(() => String(uuid.value || "")); // <-- konsisten dipakai di tombol
const loading = ref(false);
const errorMsg = ref("");

const routers = computed(() => rtStore.items || []);

const form = reactive({
  router_uuid: "",
  name: "",
  type: "",
  parent_pool: "",
  module: "",
  ip_local: "",
  first_ip: "",
  last_ip: "",
  is_active: true,
});

function hydrate(it) {
  form.router_uuid = it.router_uuid || it.router?.uuid || "";
  form.name = it.name ?? "";
  form.type = it.type ?? "";
  form.parent_pool = it.parent_pool ?? "";
  form.module = it.module ?? "";
  form.ip_local = it.ip_local ?? "";
  form.first_ip = it.first_ip ?? "";
  form.last_ip = it.last_ip ?? "";
  form.is_active =
    it.is_active === 1 || it.is_active === "1" || it.is_active === true;
}

async function load() {
  if (!uuid.value) {
    errorMsg.value = "UUID tidak valid.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await rtStore.fetchList({ page: 1, limit: 1000 }).catch(() => {});
    const it = await gpStore.getOne(uuid.value);
    if (!it) throw new Error("Record not found");
    hydrate(it);
  } catch (e) {
    errorMsg.value =
      gpStore.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat group profile";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    await gpStore.update(uuid.value, {
      router_uuid: (form.router_uuid || "").trim() || undefined,
      name: (form.name || "").trim() || undefined,
      type: (form.type || "").trim() || undefined,
      parent_pool: (form.parent_pool || "").trim() || undefined,
      module: (form.module || "").trim() || undefined,
      ip_local: (form.ip_local || "").trim() || undefined,
      first_ip: (form.first_ip || "").trim() || undefined,
      last_ip: (form.last_ip || "").trim() || undefined,
      is_active: !!form.is_active,
    });
    router.push({ name: "group-profile-list" });
  } catch (e) {
    errorMsg.value =
      gpStore.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal menyimpan perubahan";
  }
}

function goBack() {
  router.push({ name: "group-profile-list" });
}

onMounted(load);
watch(
  () => route.params.uuid,
  (v) => {
    uuid.value = String(v || "");
    load();
  }
);

// label router di dropdown
function routerLabel(r) {
  const code = r.code || r.name || "(tanpa nama)";
  const ip = r.ip_address ? ` — ${r.ip_address}` : "";
  const brand = r.brand ? ` (${r.brand})` : "";
  return `${code}${brand}${ip}`;
}
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Edit Group Profile</h2>
      <div class="card-actions d-flex align-items-center">
        <router-link
          :to="{ name: 'group-profile-detail', params: { uuid: idStr } }"
          class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"
          title="Lihat Detail"
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

      <form v-else @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Router</label>
            <select v-model="form.router_uuid" class="form-control">
              <option value="">— Pilih Router —</option>
              <option v-for="r in routers" :key="r.uuid" :value="r.uuid">
                {{ routerLabel(r) }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Nama Group</label>
            <input
              v-model.trim="form.name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Tipe</label>
            <input
              v-model.trim="form.type"
              type="text"
              class="form-control"
              placeholder="FTTH / FTTB / dll"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Parent Pool</label>
            <input
              v-model.trim="form.parent_pool"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Module</label>
            <input
              v-model.trim="form.module"
              type="text"
              class="form-control"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">IP Local</label>
            <input
              v-model.trim="form.ip_local"
              type="text"
              class="form-control"
              placeholder="10.0.0.1"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">First IP</label>
            <input
              v-model.trim="form.first_ip"
              type="text"
              class="form-control"
              placeholder="10.0.0.2"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Last IP</label>
            <input
              v-model.trim="form.last_ip"
              type="text"
              class="form-control"
              placeholder="10.0.0.254"
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

        <div class="mt-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="gpStore.saving"
          >
            <span
              v-if="gpStore.saving"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Simpan Perubahan
          </button>
          <router-link
            :to="{ name: 'group-profile-detail', params: { uuid: idStr } }"
            class="btn btn-secondary ms-2"
          >
            Batal
          </router-link>
        </div>
      </form>
    </div>
  </section>
</template>
