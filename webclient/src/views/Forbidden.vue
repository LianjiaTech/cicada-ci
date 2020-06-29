<template>
  <div class="page-403">
    <header>
      <h1>403</h1>
      <h2>You don't have permission to access page {{$route.query.path}}.</h2>
    </header>
  </div>
</template>

<style scoped>
.page-403 {
  height: 80vh;
  padding: 20px;
}
h1 {
  font-size: 80px;
}
</style>
