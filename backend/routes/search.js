const express = require('express');

const db = require('../database');
const { searchColumns, searchOutputColumns, exactMatchColumns } = require('../search_schema');

const searchRouter = express.Router();

async function getAllRowsOfTable(table, outputColumns, postProcess) {
    return await table.select({}, outputColumns, postProcess);
}

async function columnSearchDatabase(keyword, table, outputColumns, postProcess) {
    let condition = {};
    if (exactMatchColumns[tableName]?.includes(column)) {
        // Exact match.
        condition = {[column]: keyword};
    }
    else {
        // keyword match.
        condition = {[column]: {$like: `%${keyword}%`}};
    }
    return await table.select(condition, outputColumns, postProcess);
}

async function multiColumnSearchDatabase(keyword, table, outputColumns, postProcess) {
    const keywordList = keyword.split(' ');

    // For each keyword in keywordList, we do an include search in all the columns.
    let andConditions = [];
    for (const key of keywordList) {
        let orConditions = [];
        for (const column of searchColumns[table.name]) {
            if (exactMatchColumns[table.name]?.includes(column)) {
                // Exact match
                orConditions.push({[column]: key});
            }
            else {
                // Search
                orConditions.push({[column]: {$like: `%${key}%`}});
            }
        }
        andConditions.push({$or: orConditions});
    }
    const condition = {$and: andConditions};

    return await table.select(condition, outputColumns, postProcess);
}

async function searchDatabase(keyword, tableName, column, limit) {
    console.log(`Searching '${keyword}' in table ${tableName}`);

    const table = db.getTable(tableName);
    const outputColumns = searchOutputColumns[tableName];
    const postProcess = limit !== undefined ? {$limit: limit} : {};

    if (keyword === '') {
        return await getAllRowsOfTable(table, outputColumns, postProcess);
    }

    if (column !== undefined) {
        return await columnSearchDatabase(keyword, table, outputColumns, postProcess);
    }
    else {
        return await multiColumnSearchDatabase(keyword, table, outputColumns, postProcess);
    }
}

/*
Search keywords in a certain table (or optionally, in a certain column).

Optional parameters:
    keyword: str. If not given, return all the rows of a table.
    table: str, the table name, default = 'Pet'.
        TODO: Add more `VIEW-like` tables.
    column: str, the table column, if not set, search in all the columns.
    limit: int, the number of rows to output at max.
    TODO: add sort and offset.

Note:
    This API use query-based API. Axios example:
    ```
    axios.post(
        'http://localhost:3000/api/search',
        {keyword: 'user input', table: 'Pet', limit: 10},
    )
    ```
    or you can directly post with arguments:
    ```
    axios.post('http://localhost:3000/api/search?keyword=user input&table=Pet&limit=10');
    ```
 */
searchRouter.post('/', async (req, res) => {
    try {
        const keyword = req.query.keyword ?? '';
        const table = req.query.table || 'Pet';
        const column = req.query.column;
        const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;

        if (!(table in searchColumns)) {
            throw new Error(`Cannot search in table ${table}`);
        }
        if (column !== undefined && !searchColumns[table].includes(column)) {
            throw new Error(`Invalid column ${column} of table ${table}`);
        }

        const result = await searchDatabase(keyword, table, column, limit);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

module.exports = searchRouter;
