<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="topo-overlay"></div>
    </div>

    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-pin">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="currentColor"
              />
              <circle cx="12" cy="9" r="2.5" fill="var(--bg-card)" />
            </svg>
          </div>
          <span class="logo-text">findr</span>
        </div>

        <div class="auth-header">
          <h1>Create account</h1>
          <p>Start discovering places around you</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="field-group" :class="{ error: errors.name }">
            <label>Full name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Ifeanyi Nwankwo"
              autocomplete="name"
              @input="clearError('name')"
            />
            <span class="field-error" v-if="errors.name">{{
              errors.name
            }}</span>
          </div>

          <div class="field-group" :class="{ error: errors.email }">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              @input="clearError('email')"
            />
            <span class="field-error" v-if="errors.email">{{
              errors.email
            }}</span>
          </div>

          <div class="field-group" :class="{ error: errors.password }">
            <label>Password</label>
            <div class="input-wrapper">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Min. 6 characters"
                autocomplete="new-password"
                @input="clearError('password')"
              />
              <button
                type="button"
                class="toggle-pw"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <span class="field-error" v-if="errors.password">{{
              errors.password
            }}</span>
          </div>

          <!-- Password strength indicator -->
          <div class="pw-strength" v-if="form.password">
            <div class="pw-bars">
              <span :class="['bar', strength >= 1 ? 'active' : '']"></span>
              <span :class="['bar', strength >= 2 ? 'active' : '']"></span>
              <span :class="['bar', strength >= 3 ? 'active' : '']"></span>
            </div>
            <span class="pw-label">{{ strengthLabel }}</span>
          </div>

          <div class="form-error" v-if="formError">{{ formError }}</div>

          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">Create account</span>
            <span v-else class="btn-loading">
              <span></span><span></span><span></span>
            </span>
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Already have an account?
            <RouterLink to="/login">Sign in</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const isLoading = ref(false);
const showPassword = ref(false);
const formError = ref("");

const form = reactive({ name: "", email: "", password: "" });
const errors = reactive({ name: "", email: "", password: "" });

function clearError(field) {
  errors[field] = "";
}

const strength = computed(() => {
  const p = form.password;
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) s++;
  return s;
});

const strengthLabel = computed(() => {
  return ["", "Weak", "Good", "Strong"][strength.value];
});

function validate() {
  let valid = true;
  if (!form.name.trim()) {
    errors.name = "Name is required";
    valid = false;
  }
  if (!form.email) {
    errors.email = "Email is required";
    valid = false;
  }
  if (!form.password) {
    errors.password = "Password is required";
    valid = false;
  }
  if (form.password && form.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
    valid = false;
  }
  return valid;
}

async function handleRegister() {
  formError.value = "";
  if (!validate()) return;

  isLoading.value = true;
  try {
    await auth.register(form.name, form.email, form.password);
    router.push("/home");
  } catch (err) {
    formError.value =
      err.response?.data?.error || "Registration failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Reuse same styles as LoginView */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-base);
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      ellipse 80% 60% at 50% 0%,
      rgba(0, 210, 190, 0.12) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse 60% 40% at 80% 80%,
      rgba(0, 150, 255, 0.08) 0%,
      transparent 60%
    );
}

.topo-overlay {
  position: absolute;
  inset: 0;
  opacity: 0.03;
  background-image: repeating-radial-gradient(
      circle at 20% 30%,
      transparent 0,
      transparent 40px,
      rgba(0, 210, 190, 0.8) 41px
    ),
    repeating-radial-gradient(
      circle at 70% 60%,
      transparent 0,
      transparent 60px,
      rgba(0, 210, 190, 0.5) 61px
    );
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 1.5rem;
  animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 0 0 1px rgba(0, 210, 190, 0.05), 0 32px 64px rgba(0, 0, 0, 0.4);
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.logo-pin {
  width: 32px;
  height: 32px;
  color: var(--accent);
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--text-primary);
}

.auth-header {
  margin-bottom: 2rem;
}

.auth-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 0.4rem;
}

.auth-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.field-group input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0, 210, 190, 0.12);
}

.field-group.error input {
  border-color: var(--error);
}
.field-error {
  font-size: 0.78rem;
  color: var(--error);
}

.input-wrapper {
  position: relative;
}
.input-wrapper input {
  padding-right: 3rem;
}

.toggle-pw {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
}

.toggle-pw svg {
  width: 18px;
  height: 18px;
}
.toggle-pw:hover {
  color: var(--text-primary);
}

.pw-strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pw-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.bar {
  height: 3px;
  flex: 1;
  background: var(--border);
  border-radius: 2px;
  transition: background 0.3s;
}

.bar.active {
  background: var(--accent);
}

.pw-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  min-width: 40px;
}

.form-error {
  background: rgba(255, 80, 80, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.85rem;
  color: var(--error);
}

.btn-primary {
  width: 100%;
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 0.85rem;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  margin-top: 0.4rem;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-primary:active:not(:disabled) {
  transform: scale(0.99);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-loading span {
  width: 6px;
  height: 6px;
  background: #000;
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;
}

.btn-loading span:nth-child(2) {
  animation-delay: 0.15s;
}
.btn-loading span:nth-child(3) {
  animation-delay: 0.3s;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
}
.auth-footer p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}
.auth-footer a {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
}
.auth-footer a:hover {
  text-decoration: underline;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-6px);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
}
</style>