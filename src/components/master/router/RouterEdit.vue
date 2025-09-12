<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRouterStore } from "../../../stores/router";

const route = useRoute();
const router = useRouter();
const store = useRouterStore();

const uuid = ref(String(route.params.uuid || route.query.uuid || ""));
const errorMsg = ref("");
const showPass = ref(true); // default: tampilkan password

const saving = computed(() => store.saving);
const loading = ref(false);

const form = reactive({
  code: "",
  brand: "",
  location: "",
  latitude: "",
  longitude: "",
  ip_address: "",
  username: "",
  password: "",
  community: "",
  port: "",
  ip_address_radius: "",
  secret_radius: "",
  is_active: 1,
});

// hanya untuk UI; update API default di store.update tidak mengirim file.
// Kalau backend perlu update lampiran, ubah store.update agar pakai FormData.
const files = ref([]);

/* Helpers */
function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}
function hydrate(it = {}) {
  form.code = it.code ?? "";
  form.brand = it.brand ?? "";
  form.location = it.location ?? "";
  form.latitude = String(it.latitude ?? "");
  form.longitude = String(it.longitude ?? "");
  form.ip_address = it.ip_address ?? "";
  form.username = it.username ?? "";
  form.password = it.password ?? ""; // tampilkan apa adanya
  form.community = it.community ?? "";
  form.port = String(it.port ?? "");
  form.ip_address_radius = it.ip_address_radius ?? "";
  form.secret_radius = it.secret_radius ?? "";
  form.is_active = to01(it.is_active);
}

async function load() {
  if (!uuid.value) {
    errorMsg.value = "UUID tidak valid.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const it = await store.getOne(uuid.value);
    if (!it) throw new Error("Record not found");
    hydrate(it);
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat detail router";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  errorMsg.value = "";

  // validasi sederhana
  if (!form.code || !form.brand || !form.ip_address) {
    errorMsg.value = "Code, Brand, dan IP Address wajib diisi.";
    return;
  }
  if (!form.username) {
    errorMsg.value = "Username wajib diisi.";
    return;
  }

  try {
    const payload = {
      ...form,
      is_active: to01(form.is_active),
    };

    // NOTE: jika backend menerima file saat update,
    // pindahkan logika submit ke FormData di store.update.
    await store.update(uuid.value, payload);

    router.push({ name: "router-detail", params: { uuid: uuid.value } });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal menyimpan perubahan router";
  }
}

function goBack() {
  // kalau datang dari detail, balik ke detail; kalau tidak, ke list
  if (route.name === "router-edit") {
    router.push({ name: "router-detail", params: { uuid: uuid.value } });
  } else {
    router.push({ name: "router-list" });
  }
}

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
  <div class="col-lg-12">
    <section class="card">
      <header
        class="card-header d-flex justify-content-between align-items-center"
      >
        <div>
          <h2 class="card-title mb-0">Edit Router</h2>
          <p class="card-subtitle">Perbarui data router.</p>
        </div>
        <div class="card-actions">
          <button class="btn btn-sm btn-secondary" @click="goBack">
            ← Kembali
          </button>
        </div>
      </header>

      <div class="card-body">
        <div v-if="loading" class="text-muted mb-3">Memuat…</div>
        <div v-if="errorMsg" class="alert alert-danger mb-3">
          {{ errorMsg }}
        </div>

        <form v-if="!loading" @submit.prevent="onSubmit">
          <!-- Baris 1 -->
          <div class="row form-group pb-3">
            <div class="col-lg-4">
              <label class="col-form-label">Code</label>
              <input
                v-model.trim="form.code"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">Brand</label>
              <input
                v-model.trim="form.brand"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">Location</label>
              <input
                v-model.trim="form.location"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <!-- Baris 2 -->
          <div class="row form-group pb-3">
            <div class="col-lg-4">
              <label class="col-form-label">Latitude</label>
              <input
                v-model.trim="form.latitude"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">Longitude</label>
              <input
                v-model.trim="form.longitude"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">IP Address</label>
              <input
                v-model.trim="form.ip_address"
                type="text"
                class="form-control"
                required
              />
            </div>
          </div>

          <!-- Baris 3 -->
          <div class="row form-group pb-3">
            <div class="col-lg-4">
              <label class="col-form-label">Username</label>
              <input
                v-model.trim="form.username"
                type="text"
                class="form-control"
                required
              />
            </div>
            <div class="col-lg-4">
              <label
                class="col-form-label d-flex align-items-center justify-content-between"
              >
                <span>Password</span>
                <small class="text-muted">
                  <input
                    type="checkbox"
                    class="form-check-input me-1"
                    v-model="showPass"
                  />
                  <span>tampilkan</span>
                </small>
              </label>
              <input
                v-model.trim="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-control"
                required
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">Community</label>
              <input
                v-model.trim="form.community"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <!-- Baris 4 -->
          <div class="row form-group pb-3">
            <div class="col-lg-4">
              <label class="col-form-label">Port (API)</label>
              <input
                v-model.trim="form.port"
                type="text"
                class="form-control"
                placeholder="8728"
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">IP Radius</label>
              <input
                v-model.trim="form.ip_address_radius"
                type="text"
                class="form-control"
              />
            </div>
            <div class="col-lg-4">
              <label class="col-form-label">Secret Radius</label>
              <input
                v-model.trim="form.secret_radius"
                type="text"
                class="form-control"
              />
            </div>
          </div>

          <!-- Status + Upload (opsional) -->
          <div class="row form-group pb-3">
            <div class="col-lg-4 d-flex align-items-center">
              <div class="form-check form-switch">
                <input
                  id="isActive"
                  class="form-check-input"
                  type="checkbox"
                  :checked="form.is_active === 1"
                  @change="form.is_active = $event.target.checked ? 1 : 0"
                />
                <label class="form-check-label ms-2" for="isActive"
                  >Aktif</label
                >
              </div>
            </div>
            <div class="col-lg-8">
              <label class="col-form-label">Lampiran (opsional)</label>
              <input
                type="file"
                class="form-control"
                multiple
                @change="files = Array.from($event.target.files || [])"
              />
              <small class="text-muted"
                >* Update lampiran hanya aktif jika store.update diubah ke
                FormData.</small
              >
            </div>
          </div>

          <footer class="card-footer text-end px-0">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span
                v-if="saving"
                class="spinner-border spinner-border-sm me-1"
              ></span>
              Simpan Perubahan
            </button>
            <button
              type="button"
              class="btn btn-secondary ms-2"
              @click="goBack"
            >
              Batal
            </button>
          </footer>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped></style>
