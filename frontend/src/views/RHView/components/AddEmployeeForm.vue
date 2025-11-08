<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="mb-3 text-center fs-5">Add Employee</h2>

    <!-- Alert for success/error messages -->
    <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger', 'alert-dismissible', 'fade', 'show']" role="alert">
      {{ message }}
      <button type="button" class="btn-close" @click="message = ''" aria-label="Close"></button>
    </div>

    <form @submit.prevent="handleSubmit">
      <div class="row g-2 mb-3">
        <div class="col-md">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Last name" 
            v-model.trim="formData.lastname"
            required
          />
        </div>
        <div class="col-md">
          <input 
            type="text" 
            class="form-control" 
            placeholder="First name" 
            v-model.trim="formData.firstname"
            required
          />
        </div>
        <div class="col-md">
          <input 
            type="email" 
            class="form-control" 
            placeholder="Email" 
            v-model.trim="formData.email"
            required
          />
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md">
          <select class="form-select" v-model="formData.role" required>
            <option value="" disabled>Select Role</option>
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="col-md">
          <input 
            type="password" 
            class="form-control" 
            placeholder="Initial Password" 
            v-model.trim="formData.password"
            required
          />
        </div>
      </div>

      <div class="text-center">
        <button class="btn btn-success px-4" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
          {{ loading ? 'Adding...' : 'Add new' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useApiStore } from '../../../stores/api'

const apiStore = useApiStore()

const formData = ref({
  firstname: '',
  lastname: '',
  email: '',
  role: '',
  password: ''
})

const loading = ref(false)
const message = ref('')
const messageType = ref('success')

async function handleSubmit() {
  message.value = ''
  loading.value = true

  try {
    const employee = await apiStore.createEmployee(formData.value)
    message.value = `Employee ${employee.firstname} ${employee.lastname} created successfully!`
    messageType.value = 'success'
    
    // Reset form
    formData.value = {
      firstname: '',
      lastname: '',
      email: '',
      role: '',
      password: ''
    }
  } catch (error) {
    console.error('Error creating employee:', error)
    message.value = error.message || 'Failed to create employee'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>