<template>
    <button @click="$emit('complexSearchButtonClicked', 1)">
        Complex search 1: Search for dogs with breed above average height and > 10y lifespan
    </button>

    <button @click="$emit('complexSearchButtonClicked', 2)">
        Complex search 2: Search for the top-rated pet shops in the past 2 years
    </button>
</template>
