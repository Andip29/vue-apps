<script setup>
import { reactive, ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useOltCardStore } from "../../../stores/oltCard";

const route = useRoute();
const router = useRouter();
const store = useOltCardStore();

const uuid = ref(String(route.params.uuid || ""));
const loading = ref(false);
const errorMsg = ref("");

// --- FORM STATE ---
const form = reactive({
  olt_uuid: "",
  code: "",
  slot_number: "",
  card_type: "",
  model: "",
  is_active: 1, // 1/0 (biar konsisten dgn store sanitizePayload)
  olt_pon_ports: [], // array of port objects
  _deleted_ports: new Set(), // internal tracker untuk deletes
});

function clonePort(p = {}) {
  return {
    uuid: p.uuid ?? null,
    code: p.code ?? "",
    is_active: p.is_active === true || p.is_active === 1 || p.is_active === "1",
    port_number: p.port_number ?? null,
    gpon_olt: p.gpon_olt ?? "",
    txdbm: p.txdbm ?? null, // boleh null/number
    endpoint: p.endpoint ?? "",
    latitude: p.latitude ?? "",
    longitude: p.longitude ?? "",
    oid_code: p.oid_code ?? "",
  };
}

function hydrate(it) {
  form.olt_uuid = it.olt_uuid ?? it.olt?.uuid ?? "";
  form.code = it.code ?? "";
  form.slot_number = it.slot_number ?? "";
  form.card_type = it.card_type ?? "";
  form.model = it.model ?? "";
  form.is_active =
    it.is_active === 1 || it.is_active === "1" || it.is_active === true ? 1 : 0;

  const ports = Array.isArray(it.olt_pon_ports) ? it.olt_pon_ports : [];
  form.olt_pon_ports = ports.map(clonePort);
  form._deleted_ports = new Set(); // reset tracker
}

function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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
      "Gagal memuat card";
  } finally {
    loading.value = false;
  }
}

// --- PORTS ACTIONS ---
function addPort() {
  form.olt_pon_ports.push(clonePort({ is_active: true, port_number: null }));
}
function removePortAt(idx) {
  const p = form.olt_pon_ports[idx];
  if (p?.uuid) {
    form._deleted_ports.add(String(p.uuid)); // tandai untuk deletes
  }
  form.olt_pon_ports.splice(idx, 1);
}
function togglePortActive(p, checked) {
  p.is_active = !!checked;
}

// --- SUBMIT ---
async function onSubmit() {
  errorMsg.value = "";
  try {
    const payload = {
      olt_uuid: String(form.olt_uuid || "").trim(),
      code: String(form.code || "").trim(),
      slot_number: toNumberOrNull(form.slot_number),
      card_type: String(form.card_type || "").trim(),
      model: String(form.model || "").trim(),
      is_active: form.is_active, // 1/0 (store sanitizePayload akan rapihkan)
      olt_pon_ports: form.olt_pon_ports.map((p) => ({
        uuid: p.uuid || undefined, // biar yang baru (tanpa uuid) tidak kirim null
        code: String(p.code || "").trim(),
        is_active: !!p.is_active, // boolean sesuai contoh Postman
        port_number: toNumberOrNull(p.port_number),
        gpon_olt: String(p.gpon_olt || "").trim(),
        txdbm: toNumberOrNull(p.txdbm), // boleh null
        endpoint: String(p.endpoint || "").trim() || null, // nullable
        latitude: String(p.latitude ?? ""), // string (sesuai Postman)
        longitude: String(p.longitude ?? ""), // string
        oid_code: String(p.oid_code || "").trim() || null, // nullable
      })),
    };

    if (form._deleted_ports.size) {
      payload.olt_pon_port_deletes = [...form._deleted_ports];
    }

    await store.update(uuid.value, payload);
    router.push({
      name: "olt-card-detail",
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
      <h2 class="card-title m-0">Edit OLT Card</h2>
    </header>

    <div class="card-body">
      <div v-if="loading" class="text-muted">Memuat…</div>
      <div v-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <form v-if="!loading && !errorMsg" @submit.prevent="onSubmit">
        <!-- Informasi Card -->
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">OLT UUID</label>
            <input
              v-model.trim="form.olt_uuid"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="col-md-6">
            <label class="form-label">Code</label>
            <input v-model.trim="form.code" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Slot Number</label>
            <input
              v-model.number="form.slot_number"
              type="number"
              class="form-control"
              min="0"
              step="1"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Card Type</label>
            <input
              v-model.trim="form.card_type"
              type="text"
              class="form-control"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Model</label>
            <input v-model.trim="form.model" type="text" class="form-control" />
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

        <!-- PON Ports -->
        <div class="mt-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="mb-0">PON Ports</h5>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              @click="addPort"
            >
              + Tambah Port
            </button>
          </div>

          <div class="table-responsive">
            <table class="table table-bordered table-striped mb-0">
              <thead>
                <tr>
                  <th style="width: 60px">#</th>
                  <th>Code</th>
                  <th style="width: 100px">Aktif</th>
                  <th style="width: 120px">Port #</th>
                  <th>GPON OLT</th>
                  <th style="width: 120px">TX dBm</th>
                  <th>Endpoint</th>
                  <th style="width: 120px">Latitude</th>
                  <th style="width: 120px">Longitude</th>
                  <th>OID Code</th>
                  <th style="width: 80px">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!form.olt_pon_ports.length">
                  <td colspan="11" class="text-muted">Belum ada port.</td>
                </tr>
                <tr v-for="(p, i) in form.olt_pon_ports" :key="p.uuid || i">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <input
                      v-model.trim="p.code"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      :checked="p.is_active"
                      @change="togglePortActive(p, $event.target.checked)"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="p.port_number"
                      type="number"
                      class="form-control form-control-sm"
                      min="0"
                      step="1"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.gpon_olt"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="p.txdbm"
                      type="number"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.endpoint"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.latitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.longitude"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td>
                    <input
                      v-model.trim="p.oid_code"
                      type="text"
                      class="form-control form-control-sm"
                    />
                  </td>
                  <td class="text-nowrap">
                    <button
                      type="button"
                      class="mb-1 mt-1 btn btn-xs btn-default border border-danger"
                      title="Hapus"
                      @click="removePortAt(i)"
                    >
                      <i class="icons icon-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- indikator deletes (debug/optional) -->
          <!-- <small class="text-muted">akan dihapus: {{ [...form._deleted_ports].join(', ') }}</small> -->
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
            :to="{ name: 'olt-card-detail', params: { uuid } }"
            class="btn btn-secondary ms-2"
          >
            Batal
          </router-link>
        </div>
      </form>
    </div>
  </section>
</template>
