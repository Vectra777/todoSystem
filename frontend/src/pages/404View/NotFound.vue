<template>
    <div class="nf-root d-flex flex-column min-vh-100" :class="{ 'dark-mode': isDark }">
        <Header />

        <main class="flex-grow-1 d-flex align-items-center py-5">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-10">
                        <div class="card border-0 shadow-lg overflow-hidden">
                            <div class="row g-0">
                                <div class="col-12 col-md-6 d-flex align-items-center justify-content-center p-4 p-md-5 order-2 order-md-1">
                                    <div class="text-center text-md-start">
                                        <h1 class="display-5 fw-bold mb-2">Lost in space?</h1>
                                        <p class="text-muted mb-4">The page you’re looking for might have been moved, renamed, or never existed.</p>
                                        <div class="d-flex gap-2 flex-wrap justify-content-center justify-content-md-start">
                                            <button class="btn btn-primary" @click="goHome">
                                                <i class="bi bi-house-door me-2"></i>Go Home
                                            </button>
                                            <button class="btn btn-outline-secondary" @click="goBack">
                                                <i class="bi bi-arrow-left me-2"></i>Go Back
                                            </button>
                                            <button v-if="isAuthenticated" class="btn btn-outline-primary" @click="goDashboard">
                                                <i class="bi bi-speedometer2 me-2"></i>My Dashboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12 col-md-6 d-flex align-items-center justify-content-center p-5 gradient-side order-1 order-md-2">
                                    <div class="nf-figure text-center">
                                        <div class="nf-404" aria-hidden="true">
                                            <span class="nf-digit">4</span>
                                            <span class="nf-digit">0</span>
                                            <span class="nf-digit">4</span>
                                        </div>
                                        <div class="nf-sparkles" aria-hidden="true"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <Footer class= "bg-body"/>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { useThemeStore } from '../../stores/theme'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()

const isDark = computed(() => themeStore.isDark)
const isAuthenticated = computed(() => userStore.isAuthenticated)

function goHome() {
    router.push('/')
}

function goBack() {
    router.back()
}

function goDashboard() {
    router.push('/dashboard')
}
</script>

<style scoped>
.nf-root {
    background: radial-gradient(circle at 70% 15%, rgba(0, 180, 255, 0.6), transparent 60%),
                            radial-gradient(circle at 30% 65%, rgba(255, 0, 120, 0.5), transparent 60%),
                            #000;
}

.gradient-side {
    background: linear-gradient(135deg, rgba(0, 180, 255, 0.8), rgba(255, 0, 120, 0.7));
    position: relative;
    min-height: 260px;
}

.dark-mode .card {
    background-color: #2b2b2b;
    color: #eaeaea;
}

.nf-404 {
    display: inline-flex;
    gap: 10px;
    align-items: baseline;
}

.nf-digit {
    font-weight: 800;
    font-size: 84px;
    line-height: 1;
    display: inline-block;
    background: linear-gradient(45deg, #00b4ff, #ff0078, #59c4ad);
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    animation: gradientShift 5s ease infinite;
}

@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.nf-sparkles::before,
.nf-sparkles::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(8px);
    opacity: 0.6;
}

.nf-sparkles::before {
    width: 120px;
    height: 120px;
    background: rgba(255, 255, 255, 0.5);
    top: 20%;
    left: 15%;
}

.nf-sparkles::after {
    width: 160px;
    height: 160px;
    background: rgba(255, 255, 255, 0.35);
    bottom: 15%;
    right: 10%;
}
</style>