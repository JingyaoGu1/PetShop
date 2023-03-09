<script setup>
const props = defineProps(['rows']);
</script>

<template>
    <div v-if="Array.isArray(rows) && rows.length === 0">
        <p>Nothing is found.</p>
    </div>
    <div v-if="Array.isArray(rows) && rows.length > 0">
        <table>
            <!-- Show the header row. -->
            <tr>
                <th v-for="columnName in Object.keys(rows[0])">
                    {{columnName}}
                </th>
            </tr>

            <!-- Show the data rows. -->
            <tr v-for="row in rows">
                <td v-for="value in row">{{value}}</td>
            </tr>
        </table>
    </div>
</template>
