<template>
  <div class="d-flex gap-2">
    <select
      class="form-select"
      v-model="localStatus"
    >
      <option value="">All status</option>
      <option value="to do">To Do</option>
      <option value="doing">Doing</option>
      <option value="finished">Finished</option>
    </select>

    <input
      type="text"
      class="form-control"
      v-model="localLabel"
      placeholder="Filter by label"
    />
    <input
      type="text"
      class="form-control"
      v-model="localTitle"
      placeholder="Filter by Title"
    />
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  selectedStatus: String,
  selectedLabel: String,
  selectedTitle: String
})

const emit = defineEmits(['update:status', 'update:label', 'update:title'])


const localStatus = ref(props.selectedStatus)
const localLabel = ref(props.selectedLabel)
const localTitle = ref(props.selectedTitle)

watch(localStatus, (val) => emit('update:status', val))
watch(localLabel, (val) => emit('update:label', val))
watch(localTitle, (val) => emit('update:title', val))


watch(
  () => props.selectedStatus,
  (val) => (localStatus.value = val)
)
watch(
  () => props.selectedLabel,
  (val) => (localLabel.value = val)
)
</script>
