<!-- The searching parts, including search box and the searched result. -->
<script setup>
import { ref } from 'vue';
import axios from 'axios';

import SearchBox from './SearchBox.vue';
import ComplexSearchButton from './ComplexSearchButton.vue';
import SearchResults from './SearchResults.vue';

const searchedRows = ref(null);

async function search(table, keyword, column) {
    let queryParams = {};

    if (table != null) {
        queryParams.table = table;
    }
    if (keyword != null) {
        queryParams.keyword = keyword;
    }
    if (column != null) {
        queryParams.column = column;
    }

    console.log(queryParams);
    const result = await axios.post(`http://localhost:3000/api/search`, null, {
        params: queryParams,
    });
    searchedRows.value = result.data;
}

async function complexSearch(type) {
    if (type === 1 || type === 2) {
        const result = await axios.post(`http://localhost:3000/api/database/complex_query/${type}`);
        searchedRows.value = result.data;
    }
    else {
        throw Error('Internal error: Invalid complex search type.');
    }
}
</script>

<template>
    <SearchBox @searchButtonClicked="search"/>
    <ComplexSearchButton @complexSearchButtonClicked="complexSearch"/>
    <SearchResults :rows="searchedRows"/>
</template>
