<script setup>
import { onMounted, onBeforeUnmount, nextTick } from 'vue'

let dataTableInstance = null

onMounted(async () => {
  await nextTick()
  const $ = window.jQuery

  if ($ && $.fn.dataTable) {
    // Hapus instance lama dulu
    if ( $.fn.DataTable.isDataTable('#datatable-default') ) {
      $('#datatable-default').DataTable().destroy()
    }

    // Init ulang
    dataTableInstance = $('#datatable-default').DataTable({
      paging: true,
      searching: true,
      responsive: true,
      autoWidth: false
    })
  }
})

// Supaya bersih kalau keluar dari halaman
onBeforeUnmount(() => {
  if (dataTableInstance) {
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
										<router-link :to="{ name: 'router-detail' }">
										<button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-primary"><i class="icons icon-notebook"></i></button>
										</router-link>
										<router-link :to="{ name: 'router-edit' }">
										<button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-warning"><i class="icons icon-note"></i></button>
										</router-link>
										<button type="button" class="mb-1 mt-1 me-1 btn btn-xs btn-default border border-danger"><i class="icons icon-trash"></i></button>
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
            </section>
        </div>
    </div>		
			
</template>

<style scoped>

</style>