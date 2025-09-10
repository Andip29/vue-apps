<script setup></script>

<template>
  <div class="col-lg-12">
    <section class="card">
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

        <h2 class="card-title">Multi-Column Form</h2>
        <p class="card-subtitle">
          This is an example of form with multiple block columns.
        </p>
      </header>
      <div class="card-body">
        <div class="row form-group pb-3">
          <div class="col-lg-4">
            <div class="form-group">
              <label class="col-form-label" for="formGroupExampleInput"
                >NAMA PELANGGAN</label
              >
              <input
                type="text"
                class="form-control"
                id="formGroupExampleInput"
                placeholder=""
              />
            </div>
          </div>
          <div class="col-lg-4">
            <div class="form-group">
              <label class="col-form-label" for="formGroupExampleInput"
                >NAMA ALIAS</label
              >
              <input
                type="text"
                class="form-control"
                id="formGroupExampleInput"
                placeholder=""
              />
            </div>
          </div>
          <div class="col-lg-4">
            <div class="form-group">
              <label class="col-form-label" for="formGroupExampleInput"
                >REDAMAN</label
              >
              <input
                type="text"
                class="form-control"
                id="formGroupExampleInput"
                placeholder=""
              />
            </div>
          </div>
        </div>
        <div class="row form-group pb-3">
          <div class="col-lg-6">
            <label class="col-form-label control-label text-sm-end pt-2"
              >PROVIDER</label
            >
            <select
              id="company"
              class="form-control"
              title="Please select at least one company"
              required
            >
              <option value="">Choose a Provider</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>
          <div class="col-lg-6">
            <label class="col-form-label control-label text-sm-end pt-2"
              >MODE</label
            >
            <select
              id="company"
              class="form-control"
              title="Please select at least one company"
              required
            >
              <option value="">Choose a Provider</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>
        </div>
        <div class="row form-group pb-3">
          <div class="col-lg-6">
            <label class="col-form-label control-label text-sm-end pt-2"
              >ODP</label
            >
            <select
              id="company"
              class="form-control"
              title="Please select at least one company"
              required
            >
              <option value="">Choose a Provider</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>
          <div class="col-lg-6">
            <label class="col-form-label control-label text-sm-end pt-2"
              >TYPE</label
            >
            <select
              id="company"
              class="form-control"
              title="Please select at least one company"
              required
            >
              <option value="">Choose a Provider</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>
        </div>
        <div class="form-group row pb-3">
          <div class="col-lg-6">
            <label class="col-form-label control-label text-sm-end pt-2"
              >STATUS PELANGGAN</label
            >
            <select
              id="company"
              class="form-control"
              title="Please select at least one company"
              required
            >
              <option value="">Choose a Provider</option>
              <option value="apple">Apple</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="yahoo">Yahoo</option>
            </select>
          </div>
        </div>
      </div>
      <footer class="card-footer text-end">
        <button class="btn btn-primary">Submit Card</button>
      </footer>
    </section>
  </div>
</template>

<style scoped></style>
