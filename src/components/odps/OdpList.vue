<script setup>
import { onMounted, onBeforeUnmount, nextTick } from 'vue'

let dataTableInstance = null

onMounted(async () => {
  await nextTick()
  const $ = window.jQuery
  if (!($ && $.fn.dataTable)) return

  // Destroy jika sudah ada instance
  if ($.fn.DataTable.isDataTable('#datatable-default')) {
    $('#datatable-default').DataTable().destroy()
  }

  // Hitung kolom & tentukan kolom yang disembunyikan per-breakpoint
  const totalCols = document.querySelectorAll('#datatable-default thead th').length
  const LAST = totalCols - 1

  // PHONE (≤575.98): tampil 2 kolom pertama + kolom terakhir
  const KEEP_PHONE  = [0, 1, LAST]
  const HIDE_PHONE  = Array.from({ length: totalCols }, (_, i) => i).filter(i => !KEEP_PHONE.includes(i))

  // TABLET (576–1366.98): tampil 4 kolom pertama + kolom terakhir
  const KEEP_TABLET = [0, 1, 2, 3, LAST]; // bukan [0,1,2,3,4,LAST]
  const HIDE_TABLET = Array.from({ length: totalCols }, (_, i) => i).filter(i => !KEEP_TABLET.includes(i))

  dataTableInstance = $('#datatable-default').DataTable({
    paging: true,
    searching: true,
    responsive: { details: false }, // set true jika ingin row detail (+)
    autoWidth: false,

    // Tempel kelas ke TD sesuai breakpoint
    columnDefs: [
  {
    targets: HIDE_PHONE,
    className: 'hide-phone',
    createdCell: (td) => td.classList.add('hide-phone')   // <— pastikan setiap TD kebagian
  },
  {
    targets: HIDE_TABLET,
    className: 'hide-tablet',
    createdCell: (td) => td.classList.add('hide-tablet') // <— pastikan setiap TD kebagian
  }
],
headerCallback: function () {
  const api = this.api()
  HIDE_PHONE.forEach(i  => $(api.column(i).header()).addClass('hide-phone'))
  HIDE_TABLET.forEach(i => $(api.column(i).header()).addClass('hide-tablet'))
}
  })

  // Reflow kolom saat viewport berubah
  const onResize = () => dataTableInstance?.columns.adjust()
  window.addEventListener('resize', onResize)
  dataTableInstance._onResize = onResize
})

onBeforeUnmount(() => {
  if (dataTableInstance) {
    if (dataTableInstance._onResize) {
      window.removeEventListener('resize', dataTableInstance._onResize)
    }
    dataTableInstance.destroy()
    dataTableInstance = null
  }
})
</script>

<template>
  <div class="row">
    <div class="col">
      <section class="card">
        <header class="card-header">
          <div class="card-actions">
            <a href="#" class="card-action card-action-toggle" data-card-toggle></a>
            <a href="#" class="card-action card-action-dismiss" data-card-dismiss></a>
          </div>
          <h2 class="card-title">Basic</h2>
        </header>

        <div class="card-body">
          <!-- wrapper responsive yang benar -->
          <div class="table-responsive">
            <table class="table table-bordered table-striped mb-0" id="datatable-default">
              <thead>
                <tr>
                  <th>ID PELANGGAN</th>
                  <th>NAMA PELANGGAN</th>
                  <th>NAMA ALIAS</th>
                  <th>PROVIDER</th>
                  <th>MODE</th>
                  <th>ODP</th>
                  <th>TYPE</th>
                  <th>REDAMAN</th>
                  <th>STATUS PELANGGAN</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Trident</td>
                  <td>Internet Explorer 4.0</td>
                  <td>Win 95+</td>
                  <td>4</td>
                  <td>X</td>
                  <td>Trident</td>
                  <td>Internet Explorer 4.0</td>
                  <td>Win 95+</td>
                  <td>4</td>
                  <td>
                    <router-link :to="{ name: 'odp-detail' }">
                      <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary">
                        <i class="icons icon-notebook"></i>
                      </button>
                    </router-link>
                    <router-link :to="{ name: 'odp-edit' }">
                      <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning">
                        <i class="icons icon-note"></i>
                      </button>
                    </router-link>
                    <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger">
                      <i class="icons icon-trash"></i>
                    </button>
                  </td>
                </tr>

                <tr>
                  <td>Trident</td>
                  <td>Internet Explorer 5.0</td>
                  <td>Win 95+</td>
                  <td>5</td>
                  <td>C</td>
                  <td>Trident</td>
                  <td>Internet Explorer 5.0</td>
                  <td>Win 95+</td>
                  <td>5</td>
                  <td>
                    <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"><i class="icons icon-notebook"></i></button>
                    <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"><i class="icons icon-note"></i></button>
                    <button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger"><i class="icons icon-trash"></i></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </section>
    </div>
  </div>
</template>

<style scoped>

</style>


