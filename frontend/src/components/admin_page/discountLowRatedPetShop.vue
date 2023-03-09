<template>
    <button @click="discountLowRatedPetShop">Set discount for low-rated pets.</button>
</template>

<script setup>
import axios from 'axios';

function discountLowRatedPetShop() {
    axios
    .post('http://localhost:3000/api/database/builtin/discount')
    .then((result) => {
        alert('Success!');
    })
    .catch((result) => {
        alert('Execution failed!');
    });
}
</script>
