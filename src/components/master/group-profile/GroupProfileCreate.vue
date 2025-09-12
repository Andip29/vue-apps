<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGroupProfileStore } from "../../../stores/groupProfile";
import { useRouterStore } from "../../../stores/router";

const route = useRoute();
const router = useRouter();

const gpStore = useGroupProfileStore();
const rtStore = useRouterStore();

const errorMsg = ref("");

// dropdown router
const routers = computed(() => rtStore.items || []);
function routerLabel(r) {
  const code = r.code || r.name || "(tanpa nama)";
  const ip = r.ip_address ? ` — ${r.ip_address}` : "";
  const brand = r.brand ? ` (${r.brand})` : "";
  return `${code}${brand}${ip}`;
}

const form = reactive({
  router_uuid: String(route.query.router_uuid || ""), // opsional prefill dari query
  name: "",
  type: "",
  parent_pool: "",
  module: "",
  ip_local: "",
  first_ip: "",
  last_ip: "",
  is_active: true,
});

async function onSubmit() {
  errorMsg.value = "";
  try {
    const created = await gpStore.create({
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

    const newId = created?.uuid ?? created?.id ?? null;
    if (newId) {
      router.push({
        name: "group-profile-list",
        params: { uuid: String(newId) },
      });
    } else {
      router.push({ name: "group-profile-detail" });
    }
  } catch (e) {
    errorMsg.value =
      gpStore.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat Group Profile";
  }
}

function goBack() {
  router.push({ name: "group-profile-list" });
}

onMounted(async () => {
  // siapkan data dropdown router
  await rtStore.fetchList({ page: 1, limit: 1000 }).catch(() => {});
});
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <h2 class="card-title m-0">Tambah Group Profile</h2>
      <div class="card-actions d-flex align-items-center">
        <button class="btn btn-sm btn-secondary" @click="goBack">
          ← Kembali
        </button>
      </div>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="row g-3">
          <!-- Router (dropdown by name/code) -->
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
              placeholder="FTTH / FTTB / lainnya"
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
            Simpan
          </button>
          <button type="button" class="btn btn-secondary ms-2" @click="goBack">
            Batal
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
