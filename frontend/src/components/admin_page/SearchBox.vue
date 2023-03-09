<script setup>
import { ref } from 'vue';
import { tableColumns } from '../../db_schema';
import axios from 'axios'

const tableInput = ref('');
const columnInput = ref('');
const keywordInput = ref('');  // The input keyword.

function deleteAll(table, column, keyword) {
    console.log(`Got keyword ${keyword}`);

    let condition;
    if (tableColumns[table][column] === 'string') {
        condition = JSON.stringify({[column]: {$like: keyword}});
    }
    else {
        condition = JSON.stringify({[column]: keyword});
    }
    axios
          .post(encodeURI(`http://localhost:3000/api/database/delete/${table}/${condition}`))
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            console.log(error)
          })
}

function updateSex(table, column, keyword) {
    console.log(`Got keyword ${keyword}`);

    let condition;
    if (tableColumns[table][column] === 'string') {
        condition = JSON.stringify({[column]: {$like: keyword}});
    }
    else {
        condition = JSON.stringify({[column]: keyword});
    }

    axios
          .post(encodeURI(`http://localhost:3000/api/database/update/${table}/${condition}/{"sex":"female"}`))
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            console.log(error)
          })
}
function updateAvailability(table, column, keyword) {
    console.log(`Got keyword ${keyword}`);

    let condition;
    if (tableColumns[table][column] === 'string') {
        condition = JSON.stringify({[column]: {$like: keyword}});
    }
    else {
        condition = JSON.stringify({[column]: keyword});
    }

    axios
          .post(encodeURI(`http://localhost:3000/api/database/update/${table}/${condition}/{"available":0}`))
          .then((response) => {
            console.log(response)
          })
          .catch((error) => {
            console.log(error)
          })
}
</script>

<template>
    <div>
        <label>Search in: </label>
        <select v-model="tableInput">
            <template v-for="tableName in Object.keys(tableColumns)">
                <option v-bind:value="tableName">{{tableName}}</option>
            </template>
        </select>
    </div>
    <div>
        <label>Column: </label>
        <select v-model="columnInput">
            <template v-for="columnName in Object.keys(tableColumns[tableInput] || {})">
                <option v-bind:value="columnName">{{columnName}}</option>
            </template>
        </select>
    </div>
    <input
        type="text"
        @keyup.enter="$emit('searchButtonClicked', tableInput, columnInput, keywordInput)"
        v-model="keywordInput"
        placeholder="Input keywords here"
    />
    <button @click="deleteAll(tableInput, columnInput, keywordInput)">Delete All</button>
    <button @click="updateSex(tableInput, columnInput, keywordInput)">Update Sex</button>
    <button @click="updateAvailability(tableInput, columnInput, keywordInput)">Update Availability</button>
</template>
