<template>
  <div class="main-layout"> 
    <Header />
    <Task />
    <Footer />
  </div>
</template>

<script setup>
import Header from '../../components/Header.vue';
import Footer from '../../components/Footer.vue';
import Task from './Task.vue';
</script>

<style>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}
</style>