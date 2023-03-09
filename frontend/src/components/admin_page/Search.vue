<!-- The searching parts, including search box and the searched result. -->
<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { tableColumns } from '../../db_schema';

import SearchBox from './SearchBox.vue';
import ComplexSearchButton from './ComplexSearchButton.vue';
import SearchResults from './SearchResults.vue';

const searchedRows = ref(null);

async function search(table, column, keyword) {
    console.log(`Got keyword ${keyword}`);

    // Process the query according to data types. If string, use LIKE, else use =.
    let condition;
    if (tableColumns[table][column] === 'string') {
        condition = JSON.stringify({[column]: {$like: `%${keyword}%`}});
    }
    else {
        condition = JSON.stringify({[column]: keyword});
    }

    try {
        const url = `http://localhost:3000/api/database/select/${table}/${condition}/[]/0-15`;
        console.log(`sending post request to ${url}`);

        const result = await axios.post(encodeURI(url));
        console.log(`Got ${JSON.stringify(result.data)} from backend`);
        searchedRows.value = result.data;
    } catch (error) {
        console.error(error);
        searchedRows.value = [];
    }
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
