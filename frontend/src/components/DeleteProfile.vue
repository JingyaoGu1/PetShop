<template>
    <div>
      <form @submit.prevent="deleteProfile">
        <button>Delete Profile</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  export default {
    name: 'DeletePost',
    data() {
      return {
        formData: {
          
        },
      }
    },
    methods: {
      deleteProfile() {
        axios
          .post(`http://localhost:3000/api/database/insert/Pet/${JSON.stringify(this.formData)}`)
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