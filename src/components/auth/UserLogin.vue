<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const user = ref("");
const password = ref("");
const errorMsg = ref("");
const logoutNotice = ref("");

onMounted(() => {
  if (route.query.logout) {
    logoutNotice.value =
      route.query.logout === "ok"
        ? "Anda telah keluar."
        : "Logout gagal di server. Anda telah keluar dari perangkat ini.";
    const q = { ...route.query };
    delete q.logout;
    router.replace({ query: q }); // hapus flag dari URL
  }
});

const onSubmit = async () => {
  errorMsg.value = "";
  try {
    await auth.login({ user: user.value.trim(), password: password.value });
    router.push("/dashboard");
  } catch (e) {
    errorMsg.value =
      auth.error || e?.response?.data?.message || e?.message || "Login gagal";
  }
};
</script>

<template>
  <div class="center-sign">
    <a href="/" class="logo float-start">
      <img src="/img/logo.png" height="70" alt="Porto Admin" />
    </a>

    <div class="panel card-sign">
      <div class="card-title-sign mt-3 text-end">
        <h2 class="title text-uppercase font-weight-bold m-0">
          <i class="bx bx-user-circle me-1 text-6 position-relative top-5"></i>
          Sign In
        </h2>
      </div>
      <div class="card-body">
        <form @submit.prevent="onSubmit">
          <div v-if="logoutNotice" class="alert alert-info mt-2">
            {{ logoutNotice }}
          </div>
          <div class="form-group mb-3">
            <label>Username</label>
            <div class="input-group">
              <input
                name="username"
                type="text"
                class="form-control form-control-lg"
                v-model="user"
                placeholder="Username / Email / Phone"
              />
              <span class="input-group-text">
                <i class="bx bx-user text-4"></i>
              </span>
            </div>
          </div>
          <div v-if="errorMsg" class="alert alert-danger mt-2">
            {{ errorMsg }}
          </div>
          <div class="form-group mb-3">
            <div class="clearfix">
              <label class="float-start">Password</label>
              <a href="pages-recover-password.html" class="float-end"
                >Lost Password?</a
              >
            </div>
            <div class="input-group">
              <input
                name="pwd"
                type="password"
                class="form-control form-control-lg"
                v-model="password"
                placeholder="Password"
              />
              <span class="input-group-text">
                <i class="bx bx-lock text-4"></i>
              </span>
            </div>
          </div>

          <div v-if="errorMsg" class="alert alert-danger mt-2">
            {{ errorMsg }}
          </div>
          <div class="row">
            <div class="col-sm-8">
              <div class="checkbox-custom checkbox-default">
                <input id="RememberMe" name="rememberme" type="checkbox" />
                <label for="RememberMe">Remember Me</label>
              </div>
            </div>
            <div class="col-sm-4 text-end">
              <button
                type="submit"
                class="btn btn-primary mt-2"
                :disabled="auth.loading"
              >
                <span
                  v-if="auth.loading"
                  class="spinner-border spinner-border-sm me-1"
                ></span>
                Sign In
              </button>
            </div>
          </div>

          <span class="mt-3 mb-3 line-thru text-center text-uppercase">
            <span>or</span>
          </span>

          <div class="mb-1 text-center">
            <a class="btn btn-facebook mb-3 ms-1 me-1" href="#"
              >Connect with <i class="fab fa-facebook-f"></i
            ></a>
          </div>

          <p class="text-center">
            Don't have an account yet?
            <router-link to="register">Sign Up!</router-link>
          </p>
        </form>
      </div>
    </div>

    <p class="text-center text-muted mt-3 mb-3">
      &copy; Copyright 2023. All Rights Reserved.
    </p>
  </div>
</template>
