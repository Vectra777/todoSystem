<template>
  <div class="shadow-sm position-relative">
    <input
      type="text"
      placeholder="Type employee/team name"
      class="form-control form-control-lg rounded-pill"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <ul
      v-if="suggestions.length > 0"
      class="list-group position-absolute mt-1 bg-light shadow search-suggestions"
      style="z-index: 1000"
    >
      <li
        v-for="item in suggestions"
        :key="item.id"
        class="list-group-item list-group-item-action"
        style="cursor: pointer"
        @click="selectItem(item)"
      >
        {{ item.name }} ({{ item.teams.join(', ') }})
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  suggestions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'item-selected'])

function selectItem(item) {
  emit('update:modelValue', item.name)
  emit('item-selected', item)
}
</script>

<style scoped>


/* Targets the <li> items in dark mode.
  This is the part that was missing.
*/
:global([data-bs-theme='dark'] .search-suggestions .list-group-item-action) {
  background-color: #424242 !important;
  color: var(--bs-light-color) !important; /* Makes text light */
  border-bottom-color: #2a2a2a !important; /* Adds a subtle separator */
}

/* Adds a hover effect for dark mode
*/
:global([data-bs-theme='dark'] .search-suggestions .list-group-item-action:hover) {
  background-color: #2a2a2a !important; /* A slightly lighter dark color */
}
</style>