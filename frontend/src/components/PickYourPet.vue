<script>
import axios from 'axios'
export default {
  name: 'PickYourPet',
  data() {
    return {
      formData: {
        selected: '',
      },
      selected: 'nothing selected',
      options: [
        { text: 'Dog', value: 'Dog' },
        { text: 'Cat', value: 'Cat' },
        { text: 'Hamster', value: 'Hamster' },
        { text: 'Other', value: 'Other' },
        
      ]
    }
  },
  methods: {
    CustomerInfo() {
      axios
        .post(`http://localhost:3000/api/auth/insert/PickYourPet`, this.formData)
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
      <h3>Please select a Pet</h3>
    </div>
  <select v-model="selected">
    <option v-for="option in options" :value="option.value">
      {{ option.text }}
    </option>
  </select>

	<div>Selected: {{ selected }}</div>
</template>