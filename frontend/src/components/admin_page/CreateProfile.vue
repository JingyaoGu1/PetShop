<template>
    <div>
      <form @submit.prevent="createProfile">
        <div>
          <label for="pet_id">Pet ID</label>
          <input type="text" id="pet_id" v-model="formData.pet_id" />
        </div>
        <div>
          <label for="name">Name</label>
          <input type="text" id="name" v-model="formData.name" />
        </div>
        <div>
          <label for="sex">Sex</label>
          <select id = "sex" v-model="formData.sex">
            <option value = ''>Select a sex</option>
            <option value = 'male'>Male</option>
            <option value = 'female'>Female</option>
             </select>
        </div>
        <div>
          <label for="height">Height</label>
          <input type="text" id="height" v-model="formData.height" />
        </div>
        <div>
          <label for="weight">Weight</label>
          <input type="text" id="weight" v-model="formData.weight" />
        </div>
        <div>
          <label for="date_of_birth">DOB</label>
          <input type="text" id="date_of_birth" v-model="formData.date_of_birth" />
        </div>
        <div>
          <label for="color">Color</label>
          <input type="text" id="color" v-model="formData.color" />
        </div>
        <div>
          <label for="favorite_food">Favorite Food</label>
          <input type="text" id="favorite_food" v-model="formData.favorite_food" />
        </div>
        <div>
          <label for="description">Description</label>
          <input type="text" id="description" v-model="formData.description" />
        </div>
        <div>
          <label for="price">Price</label>
          <input type="text" id="price" v-model="formData.price" />
        </div>
        <div>
            <input type = 'checkbox' id = 'available' />
            <label for = "available">Is the pet available?</label>
        </div>
        <div>
          <label for="image_url">Image url</label>
          <input type="text" id="image_url" v-model="formData.image_url" />
        </div>
        <div>
          <label for="pet_shop_name">Pet Shop Name</label>
          <input type="text" id="pet_shop_name" v-model="formData.pet_shop_name" />
        </div>
        <div>
          <label for="breed_name">Breed Name</label>
          <input type="text" id="breed_name" v-model="formData.breed_name" />
        </div>
        <button>Create Profile</button>
      </form>
    </div>
  </template>

  <script>
  import axios from 'axios'
  export default {
    name: 'CreatePost',
    data() {
      return {
        formData: {
          pet_id: '',
          name: '',
          sex: '',
          height: '',
          weight: '',
          date_of_birth: '',
          color: '',
          favorite_food: '',
          description: '',
          price: '',
          available: true,
          image_url: '',
          pet_shop_name: '',
          breed_name: '',
        },
      }
    },
    methods: {
      createProfile() {
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
