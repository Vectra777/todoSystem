<template>
  <div class="d-flex flex-wrap justify-content-center gap-2">
    <select class="form-select w-auto">
      <option value="all">All status</option>
      <option value="in-progress">In progress</option>
      <option value="completed">Completed</option>   
    </select>
    <select class="form-select w-auto">
      <option>Sort</option>
    </select>
    <input type="text" class="form-control w-auto" placeholder="Filter by label" />
    <input type="text" class="form-control w-auto" placeholder="Filter by title" />
    <button class="btn btn-success px-4">Add new</button>
  </div>
</template>
