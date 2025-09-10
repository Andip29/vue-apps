<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useBandwithStore } from "../../../stores/bandwith";

const router = useRouter();
const store = useBandwithStore();

const form = reactive({
  name: "",
  upload_min: null,
  upload_min_unit: "mbps",
  upload_max: null,
  upload_max_unit: "mbps",
  download_min: null,
  download_min_unit: "mbps",
  download_max: null,
  download_max_unit: "mbps",
  is_active: 1,
});

watch(
  () => form.upload_min_unit,
  (u) => {
    form.upload_max_unit = u;
    form.download_min_unit = u;
    form.download_max_unit = u;
  },
  { immediate: true }
);

const errorMsg = ref("");

async function onSubmit() {
  errorMsg.value = "";
  try {
    await store.create(form);
    router.push({ name: "bandwith-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat bandwith";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header">
      <h2 class="card-title">Tambah Bandwith</h2>
    </header>
    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Nama</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="50Mbps"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Upload Min</label>
            <input
              v-model.number="form.upload_min"
              type="number"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Upload Max</label>
            <input
              v-model.number="form.upload_max"
              type="number"
              class="form-control"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Download Min</label>
            <input
              v-model.number="form.download_min"
              type="number"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Download Max</label>
            <input
              v-model.number="form.download_max"
              type="number"
              class="form-control"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Unit</label>
            <select v-model="form.upload_min_unit" class="form-select">
              <option value="kbps">kbps</option>
              <option value="mbps">mbps</option>
              <option value="gbps">gbps</option>
            </select>
            <small class="text-muted">Unit upload & download disamakan</small>
          </div>
        </div>

        <!-- Samakan unit ke properti lain -->

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
          <router-link
            :to="{ name: 'bandwith-list' }"
            class="btn btn-secondary ms-2"
            >Batal</router-link
          >
        </div>
      </form>
    </div>
  </section>
</template>
