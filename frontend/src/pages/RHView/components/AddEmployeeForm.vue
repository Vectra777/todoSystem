<template>
  <div class="bg-body rounded-4 p-4 shadow-sm">
    <h2 class="mb-3 text-center fs-5">Add Employee</h2>

    <form>
      <div class="row g-2 mb-3">
        <div class="col-md">
          <input type="text" class="form-control" placeholder="Last name" />
        </div>
        <div class="col-md">
          <input type="text" class="form-control" placeholder="First name" />
        </div>
        <div class="col-md">
          <input type="email" class="form-control" placeholder="Email" />
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md">
          <input type="text" class="form-control" placeholder="Role" />
        </div>
        <div class="col-md">
          <input type="text" class="form-control" placeholder="Team" />
        </div>
      </div>

      <div class="text-center">
        <button class="btn btn-success px-4" type="submit">Add new</button>
      </div>
    </form>
  </div>
</template>