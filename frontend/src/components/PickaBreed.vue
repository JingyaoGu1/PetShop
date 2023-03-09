<script>
import axios from 'axios'
export default {
  name: 'PickaBreed',
  data() {
    return {
      formData: {
        selected: '',
      },
      selected: 'Nothing Selected',
      options: [
        { text: 'Bulldog', value: 'Bulldog'},
        { text: 'Golden Retriever', value: 'Golden Retriever' },
        { text: 'German Shepherd', value: 'German Shepherd' }
      ]
    }
  },
  methods: {
    CustomerInfo() {
      axios
        .post(`http://localhost:3000/api/auth/insert/PickaBreed`, this.formData)
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

<template>
    <div>
      <h3>Please select a Dog Breed</h3>
    </div>
  <select v-model="selected">
    <option v-for="option in options" :value="option.value">
      {{ option.text }}
    </option>
  </select>

	<div>Selected: {{ selected }}</div>
</template>

