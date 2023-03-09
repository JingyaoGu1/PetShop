<script setup>
import { ref } from 'vue';
import { searchColumns } from '../../db_schema';
const keywordInput = ref('');  // The input keyword.
</script>

<template>
    <input
        type="text"
        @keyup.enter="$emit('searchButtonClicked', tableInput, keywordInput, null)"
        v-model="keywordInput"
        placeholder="Input keywords here"
    />
    <button @click="$emit('searchButtonClicked', tableInput, keywordInput, null)">Search</button>

    <input type="radio" id="Pet" value="Pet" v-model="picked" checked
    @click="$emit('searchButtonClicked', 'Pet', keywordInput, null)" />
    <label for="Pet">Pet</label>

    <input type="radio" id="Petshop" value="Petshop" v-model="picked"
    @click="$emit('searchButtonClicked', 'PetShop', keywordInput, null)" />
    <label for="Petshop">Petshop</label>

    <input type="radio" id="Review" value="Review" v-model="picked"
    @click="$emit('searchButtonClicked', 'Review', keywordInput, null)" />
    <label for="Review">Review</label>
</template>

<script>
export default {
  data() {
    return {
      picked: ''
    }
  }
}
</script>