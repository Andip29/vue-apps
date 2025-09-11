<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltStore } from "../../../stores/olt";
import http from "../../../lib/api/http"; // panggil API langsung di komponen

const BASE = "/master/olt";

const route = useRoute();
const router = useRouter();
const store = useOltStore();

const uuid = ref(String(route.params.uuid ?? ""));
const loading = ref(false);
const errorMsg = ref("");

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
  password: "", // (kosongkan jika tidak diubah)
  community: "",
  is_active: 1,
});

// --- UTIL ---
function to01(v) {
  return v === 1 || v === "1" || v === true ? 1 : 0;
}

function hydrateForm(it) {
  form.code = it.code ?? "";
  form.brand = it.brand ?? "";
  form.type = it.type ?? "";
  form.mode = it.mode ?? "";
  form.location = it.location ?? "";
  form.latitude = it.latitude ?? "";
  form.longitude = it.longitude ?? "";
  form.ip_address = it.ip_address ?? "";
  form.username = it.username ?? "";
  form.password = ""; // biasanya API tidak mengembalikan password
  form.community = it.community ?? "";
  form.is_active = to01(it.is_active);
}

async function fetchOneSmart(id) {
  const candidates = [
    `${BASE}/${id}`, // paling umum
    `${BASE}/detail/${id}`, // beberapa backend pakai /detail
    `${BASE}/show/${id}`, // fallback jika ada
  ];
  let lastErr = null;

  for (const url of candidates) {
    try {
      const { data } = await http.get(url);
      return data?.data ?? data ?? null;
    } catch (err) {
      lastErr = err;
      const code = err?.response?.status;
      if (code && code !== 404) throw err; // error selain 404 → hentikan
      // 404 → lanjut kandidat berikutnya
    }
  }
  // fallback terakhir: cari di cache list
  const cached =
    store.items.find((x) => String(x.uuid) === String(id)) ||
    store.items.find((x) => String(x.id) === String(id)) ||
    null;
  if (cached) return cached;

  // tidak ketemu sama sekali
  throw lastErr || new Error("Record not found");
}

async function load() {
  if (!uuid.value || uuid.value === "undefined" || uuid.value === "null") {
    errorMsg.value = "UUID tidak valid di URL.";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    const it = await fetchOneSmart(uuid.value);
    if (!it) throw new Error("Record not found");
    // simpan juga ke store.current agar konsisten dengan halaman lain
    store.current = it;
    hydrateForm(it);
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal memuat OLT";
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    const payload = { ...form };
    if (!payload.password) delete payload.password; // jangan timpa jika kosong
    await store.update(uuid.value, payload);
    router.push({ name: "olt-detail", params: { uuid: String(uuid.value) } });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal menyimpan perubahan";
  }
}

onMounted(load);

// jika navigasi dalam halaman (uuid berubah)
watch(
  () => route.params.uuid,
  (v) => {
    uuid.value = String(v ?? "");
    load();
  }
);
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex align-items-center justify-content-between"
    >
      <h2 class="card-title m-0">Edit OLT</h2>
      <div class="d-flex gap-2">
        <router-link
          :to="{ name: 'olt-detail', params: { uuid } }"
          class="btn btn-sm btn-outline-secondary"
        >
          Lihat Detail
        </router-link>
        <router-link
          :to="{ name: 'olt-list' }"
          class="btn btn-sm btn-secondary"
        >
          Kembali
        </router-link>
      </div>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted mb-2">Memuat…</div>
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form v-if="!loading && !errorMsg" @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Code</label
            ><input
              v-model.trim="form.code"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Brand</label
            ><input
              v-model.trim="form.brand"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Type</label
            ><input v-model.trim="form.type" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Mode</label
            ><input v-model.trim="form.mode" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Location</label
            ><input
              v-model.trim="form.location"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Latitude</label
            ><input
              v-model.trim="form.latitude"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Longitude</label
            ><input
              v-model.trim="form.longitude"
              type="text"
              class="form-control"
            />
          </div>

          <div class="mt-4 mb-2">
            <h5 class="card-title mb-0">Network & Credential</h5>
          </div>
          <div class="col-md-4">
            <label class="form-label">IP Address</label
            ><input
              v-model.trim="form.ip_address"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Username</label
            ><input
              v-model.trim="form.username"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Password</label
            ><input
              v-model="form.password"
              type="text"
              class="form-control"
              placeholder="(kosongkan jika tidak diubah)"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Community</label
            ><input
              v-model.trim="form.community"
              type="text"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-check form-switch mt-3">
          <input
            id="isActive"
            class="form-check-input"
            type="checkbox"
            :checked="form.is_active === 1"
            @change="form.is_active = $event.target.checked ? 1 : 0"
          />
          <label class="form-check-label" for="isActive">Aktif</label>
        </div>

        <div class="mt-3">
          <button
            class="btn btn-primary"
            type="submit"
            :disabled="store.saving"
          >
            <span
              v-if="store.saving"
              class="spinner-border spinner-border-sm me-1"
            ></span>
            Simpan Perubahan
          </button>
          <router-link
            :to="{ name: 'olt-detail', params: { uuid } }"
            class="btn btn-secondary ms-2"
            >Batal</router-link
          >
        </div>
      </form>
    </div>
  </section>
</template>
