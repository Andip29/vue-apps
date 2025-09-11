<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useOltStore } from "../../../stores/olt";

const router = useRouter();
const store = useOltStore();

const form = reactive({
  code: "",
  brand: "",
  type: "",
  mode: "",
  location: "",
  latitude: "",
  longitude: "",
  ip_address: "",
  username: "",
  password: "",
  community: "",
  is_active: 1,
});

const errorMsg = ref("");

async function onSubmit() {
  errorMsg.value = "";
  try {
    await store.create(form);
    router.push({ name: "olt-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat OLT";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header">
      <h2 class="card-title">Tambah OLT</h2>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <h5 class="card-title mb-0">Informasi</h5>
        </div>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Code</label>
            <input
              v-model="form.code"
              type="text"
              class="form-control"
              placeholder="OLT-01"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Brand</label>
            <input
              v-model="form.brand"
              type="text"
              class="form-control"
              placeholder="ZTE / Huawei / FiberHome"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Type</label>
            <input
              v-model="form.type"
              type="text"
              class="form-control"
              placeholder="gpon / epon"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Mode</label>
            <input
              v-model="form.mode"
              type="text"
              class="form-control"
              placeholder="GPON"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Location</label>
            <input
              v-model="form.location"
              type="text"
              class="form-control"
              placeholder="Bandung / Ruang Rak A"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Latitude</label>
            <input
              v-model="form.latitude"
              type="text"
              class="form-control"
              placeholder="-6.9173248"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Longitude</label>
            <input
              v-model="form.longitude"
              type="text"
              class="form-control"
              placeholder="107.6068352"
            />
          </div>
          <div class="mt-4 mb-2">
            <h5 class="card-title mb-0">Network & Credential</h5>
          </div>
          <div class="col-md-4">
            <label class="form-label">IP Address</label>
            <input
              v-model="form.ip_address"
              type="text"
              class="form-control"
              placeholder="10.10.100.2"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Username</label>
            <input
              v-model="form.username"
              type="text"
              class="form-control"
              placeholder="admin / global"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Password</label>
            <input
              v-model="form.password"
              type="text"
              class="form-control"
              placeholder="••••••"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Community</label>
            <input
              v-model="form.community"
              type="text"
              class="form-control"
              placeholder="SNMP community"
            />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input
            class="form-check-input"
            type="checkbox"
            :checked="form.is_active === 1"
            @change="form.is_active = $event.target.checked ? 1 : 0"
            id="isActive"
          />
          <label class="form-check-label" for="isActive">Aktif</label>
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
          <router-link :to="{ name: 'olt-list' }" class="btn btn-secondary ms-2"
            >Batal</router-link
          >
        </div>
      </form>
    </div>
  </section>
</template>
