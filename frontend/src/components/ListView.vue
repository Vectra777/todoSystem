<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>Title</th>
        <th>Label</th>
        <th>Status</th>
        <th>Start Date</th>
        <th>End Date</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="task in tasks" :key="task.id">
        <td>{{ task.title }}</td>
        <td>{{ task.label }}</td>
        <td>{{ task.status }}</td>
        <td>{{ task.start_date || '-' }}</td>
        <td>{{ task.end_date || '-' }}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" @click="$emit('edit-task', task)">Modify</button>
          <button class="btn btn-sm btn-outline-danger ms-2" @click="$emit('delete-task', task)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({ tasks: Array })
defineEmits(['edit-task', 'delete-task'])
</script>
