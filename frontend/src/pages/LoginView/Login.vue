<template>
  <Header />
  <div class="login-wrapper d-flex flex-column min-vh-100">
    <div class="flex-grow-1 d-flex justify-content-center align-items-center px-3">
      <div class="card login-card p-4 text-center">
        <h2 class="mb-4">Login</h2>

        <!-- Bootstrap alert -->
        <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
          {{ errorMessage }}
          <button type="button" class="btn-close" aria-label="Close" @click="errorMessage = ''"></button>
        </div>

        <form @submit.prevent="login">
          <!-- Email -->
          <div class="mb-3 text-start">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model.trim="email" class="form-control" placeholder="Enter your email" />
          </div>

          <!-- Password -->
          <div class="mb-3 text-start">
            <label for="password" class="form-label">Password</label>
            <input type="password" id="password" v-model.trim="password" class="form-control"
              placeholder="Enter your password" />
          </div>

          <!-- Submit -->
          <button type="submit" class="btn btn-primary w-100 py-2" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            Log in
          </button>
        </form>

      </div>
    </div>
  </div>
  <Footer />
</template>

<script>
import { ref } from "vue";
import router from "../../router";
import Header from "../../components/Header.vue";
import Footer from "../../components/Footer.vue";

export default {
  name: "Login",
  components: { Header, Footer },
  setup() {
    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref("");

    async function login() {
      errorMessage.value = "";

      if (!email.value || !password.value) {
        errorMessage.value = "Please fill in all fields.";
        return;
      }

      loading.value = true;
      try {
        router.push("/home");
      } catch (err) {
        console.error(err);
        errorMessage.value = err?.message || "An error occurred during login.";
      } finally {
        loading.value = false;
      }
    }

    return { email, password, loading, errorMessage, login };
  },
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
    radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
    #000;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 1rem;
  padding: 2.5rem 2rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.text-start {
  text-align: left;
}
</style>
