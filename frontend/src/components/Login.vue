<template>
    <form @submit.prevent="Login">
    <div>
      <h3>Please log in</h3>
    </div>
    <div>
          <label for="email">Email</label>
          <input type="text" id="email" v-model="formData.email" />
    </div>
    <div>
          <label for="password">Password</label>
          <input type="text" id="password" v-model="formData.password"/>
    </div>
    <button>Log In</button>
</form>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Login',
  data() {
    return {
      formData: {
        email: '',
        password: '',
      },
    }
  },
  methods: {
    Login() {
      axios
        .post(`http://localhost:3000/api/auth/insert/login`, this.formData)
        .then((response) => {
          console.log(response)
        })
        .catch((error) => {
          console.log(error)
        })
    },
  },
}
</script>

<style scoped>
</style>