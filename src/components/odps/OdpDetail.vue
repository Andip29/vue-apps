<script setup>
import { onMounted, onBeforeUnmount, nextTick } from "vue";

onMounted(async () => {
  await nextTick();
  window.Porto?.initPageUI();
});
</script>

<template>
  <div class="card card-modern">
    <div class="card-header">
      <h2 class="card-title">Addresses</h2>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-xl-auto me-xl-5 pe-xl-5 mb-4 mb-xl-0">
          <h3
            class="text-color-dark font-weight-bold text-4 line-height-1 mt-0 mb-3"
          >
            BILLING
          </h3>
          <ul class="list list-unstyled list-item-bottom-space-0">
            <li>Street Name Example</li>
            <li>1234</li>
            <li>Detroit</li>
            <li>Michigan</li>
            <li>93218</li>
            <li>USA</li>
          </ul>
          <strong class="d-block text-color-dark">Email address:</strong>
          <a href="mailto:johndoe@domain.com">johndoe@domain.com</a>
          <strong class="d-block text-color-dark mt-3">Phone:</strong>
          <a href="tel:+5551234" class="text-color-dark">555-1234</a>
        </div>
        <div class="col-xl-auto ps-xl-5">
          <h3
            class="font-weight-bold text-color-dark text-4 line-height-1 mt-0 mb-3"
          >
            SHIPPING
          </h3>
          <ul class="list list-unstyled list-item-bottom-space-0">
            <li>Street Name Example</li>
            <li>1234</li>
            <li>Detroit</li>
            <li>Michigan</li>
            <li>93218</li>
            <li>USA</li>
          </ul>
          <strong class="d-block text-color-dark">Email address:</strong>
          <a href="mailto:johndoe@domain.com">johndoe@domain.com</a>
          <strong class="d-block text-color-dark mt-3">Phone:</strong>
          <a href="tel:+5551234" class="text-color-dark">555-1234</a>
        </div>
      </div>
    </div>
  </div>

      <section class="card card-modern">
        <header class="card-header">
          <div class="card-actions">
            <a
              href="#"
              class="card-action card-action-toggle"
              data-card-toggle
            ></a>
            <a
              href="#"
              class="card-action card-action-dismiss"
              data-card-dismiss
            ></a>
          </div>

          <h2 class="card-title">Street View</h2>
        </header>
        <div class="card-body">
          <div id="gmap-street-view" style="height: 500px; width: 100%"></div>
        </div>
      </section>
</template>

<style scoped></style>
