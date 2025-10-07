<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
header,
.header {
  position: sticky;
  top: 0;
  z-index: 9999 !important;
}
</style>
