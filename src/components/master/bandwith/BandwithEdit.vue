<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useBandwithStore } from "../../../stores/bandwith";

const router = useRouter();
const store = useBandwithStore();

// Ambil UUID dari props (router sudah props: true)
const props = defineProps({ uuid: { type: String, required: true } });

const errorMsg = ref("");
const editId = ref(null); // kalau backend update pakai :id

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

// Di halaman Edit, jangan timpa unit dari server saat mount
watch(
  () => form.upload_min_unit,
  (u) => {
    form.upload_max_unit = u;
    form.download_min_unit = u;
    form.download_max_unit = u;
  },
  { immediate: false } // ← penting di Edit
);

onMounted(async () => {
  try {
    await store.getOne(props.uuid);
    const d = store.current;
    if (!d) throw new Error("Data tidak ditemukan");

    // kalau backend update pakai id numeric:
    editId.value = d.id ?? null;

    form.name = d.name;
    form.upload_min = d.upload_min;
    form.upload_max = d.upload_max;
    form.download_min = d.download_min;
    form.download_max = d.download_max;
    form.upload_min_unit = d.upload_min_unit || "mbps";
    form.upload_max_unit = d.upload_max_unit || form.upload_min_unit;
    form.download_min_unit = d.download_min_unit || form.upload_min_unit;
    form.download_max_unit = d.download_max_unit || form.upload_min_unit;
    form.is_active = d.is_active ?? 1;
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat data";
  }
});

async function onSubmit() {
  errorMsg.value = "";
  try {
    const unit = form.upload_min_unit;
    const payload = {
      ...form,
      upload_max_unit: unit,
      download_min_unit: unit,
      download_max_unit: unit,
    };

    // === PILIH SALAH SATU SESUAI STORE-MU ===

    // 1) Jika store.update(uuid, payload) memang ada dan backend terima UUID:
    await store.update(props.uuid, payload);

    // 2) Kalau backend update pakai id numeric: /master/bandwith/update/:id
    // if (!editId.value) throw new Error("ID internal tidak tersedia");
    // await store.updateById(editId.value, payload);

    router.push({ name: "bandwith-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal menyimpan perubahan";
  }
}
</script>

<template>
  <section class="card">
    <header class="card-header">
      <h2 class="card-title">Edit Bandwith</h2>
    </header>
    <div class="card-body">
      <div v-if="store.loadingOne">Memuat…</div>
      <div v-else>
        <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

        <form @submit.prevent="onSubmit">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Nama</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
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

          <!-- Samakan unit -->

          <div class="form-check form-switch mt-3">
            <input
              class="form-check-input"
              type="checkbox"
              v-model="form.is_active"
              true-value="1"
              false-value="0"
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
    </div>
  </section>
</template>
