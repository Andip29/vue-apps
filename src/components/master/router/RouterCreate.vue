<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useRouterStore } from "../../../stores/router";

const router = useRouter();
const store = useRouterStore();

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
  is_active: 1, // checkbox → 1/0 biar konsisten
});
const files = ref([]); // File[] untuk attachment
const errorMsg = ref("");

// terima multiple file
function onPickFiles(e) {
  const list = Array.from(e.target.files || []);
  // gabung, tapi hindari duplikat berdasarkan name+size
  const sig = (f) => `${f.name}-${f.size}`;
  const exist = new Set(files.value.map(sig));
  list.forEach((f) => {
    if (!exist.has(sig(f))) files.value.push(f);
  });
  // reset value input agar bisa pilih file yang sama lagi kalau dihapus
  e.target.value = "";
}
function removeFile(idx) {
  files.value.splice(idx, 1);
}

async function onSubmit() {
  errorMsg.value = "";
  try {
    // Kalau ada file → pakai FormData (key: file[0], file[1], …)
    let payload;
    if (files.value.length) {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "is_active") {
          fd.append(k, form.is_active ? 1 : 0);
        } else {
          fd.append(k, v ?? "");
        }
      });
      files.value.forEach((f, i) => fd.append(`file[${i}]`, f));
      payload = fd;
    } else {
      // tanpa file → kirim JSON biasa
      payload = {
        ...form,
        is_active: form.is_active ? 1 : 0,
      };
    }

    await store.create(payload);
    router.push({ name: "router-list" });
  } catch (e) {
    errorMsg.value =
      store.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Gagal membuat router";
  }
}
</script>

<template>
  <section class="card">
    <header
      class="card-header d-flex justify-content-between align-items-center"
    >
      <div>
        <h2 class="card-title mb-0">Tambah Router</h2>
        <p class="card-subtitle">Lengkapi data di bawah ini.</p>
      </div>
      <router-link
        class="btn btn-sm btn-secondary"
        :to="{ name: 'router-list' }"
      >
        ← Kembali
      </router-link>
    </header>

    <div class="card-body">
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form @submit.prevent="onSubmit">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label"
              >Code <span class="text-danger">*</span></label
            >
            <input
              v-model.trim="form.code"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Brand</label>
            <input v-model.trim="form.brand" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Location</label>
            <input
              v-model.trim="form.location"
              type="text"
              class="form-control"
              placeholder="Bandung location"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Latitude</label>
            <input
              v-model.trim="form.latitude"
              type="text"
              class="form-control"
              placeholder="-6.9173248"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Longitude</label>
            <input
              v-model.trim="form.longitude"
              type="text"
              class="form-control"
              placeholder="107.6068352"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label"
              >IP Address <span class="text-danger">*</span></label
            >
            <input
              v-model.trim="form.ip_address"
              type="text"
              class="form-control"
              placeholder="10.0.0.133"
              required
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Username</label>
            <input
              v-model.trim="form.username"
              type="text"
              class="form-control"
              placeholder="admin"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Password</label>
            <input
              v-model.trim="form.password"
              type="password"
              class="form-control"
              placeholder="••••••"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Community</label>
            <input
              v-model.trim="form.community"
              type="text"
              class="form-control"
              placeholder="public"
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
          <label for="isActive" class="form-check-label">Aktif</label>
        </div>

        <div class="mt-3">
          <label class="form-label d-block">Lampiran (opsional)</label>
          <input
            type="file"
            class="form-control"
            multiple
            @change="onPickFiles"
          />
          <small class="text-muted"
            >Anda dapat menambahkan beberapa file sekaligus.</small
          >

          <ul v-if="files.length" class="list-group mt-2">
            <li
              v-for="(f, i) in files"
              :key="i"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <span>{{ f.name }}</span>
              <button
                type="button"
                class="btn btn-xs btn-default border border-danger"
                @click="removeFile(i)"
              >
                <i class="icons icon-trash"></i>
              </button>
            </li>
          </ul>
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
            :to="{ name: 'router-list' }"
            class="btn btn-secondary ms-2"
            >Batal</router-link
          >
        </div>
      </form>
    </div>
  </section>
</template>
