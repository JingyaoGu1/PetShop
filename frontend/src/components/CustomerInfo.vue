

<template>
    <form @submit.prevent="createCustomer">
    <div>
      <h3>Please enter your information</h3>
    </div>
    <div>
          <label for="email">Email</label>
          <input type="text" id="email" v-model="formData.email" />
    </div>
    <div>
          <label for="username">Username</label>
          <input type="text" id="username" v-model="formData.username" />
    </div>
    <div>
          <label for="password">Password</label>
          <input type="text" id="password" v-model="formData.password"/>
    </div>
    <button>Create Customer</button>
</form>
</template>

<script>
import axios from 'axios'
export default {
  name: 'CreateCustomer',
  data() {
    return {
      formData: {
        email: '',
        username: '',
        password: '',
      },
    }
  },
  methods: {
    CustomerInfo() {
      axios
        .post(`http://localhost:3000/api/auth/insert/signup`, this.formData)
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