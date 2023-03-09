<template>
    <div class="NotFound">
      <h1>{{ msg }}</h1>
      <h3>Not Found!</h3>
    </div>
</template>

<script>
export default {
  name: 'NotFound',
  props: {
    msg: String
  }
}
</script>