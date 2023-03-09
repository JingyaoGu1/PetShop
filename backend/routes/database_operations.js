const express = require('express');

const db = require('../database');

const dbRouter = express.Router();

// Insert a row into a table.
// Parameters:
//   table: string, the name of the table to insert the row.
//   row: dict, formatted as json, containing the keys and values of the row
//       to be inserted.
dbRouter.post('/insert/:table/:row', async (req, res) => {
    try {
        const table = req.params.table;
        const row = JSON.parse(req.params.row);

        await db.getTable(table).insert(row);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

// Find in a table for rows that contains a certain keyword.
// Parameters:
//   table: string, the name of the table where rows are searched.
//   condition: object, a mongo-like condition object.
//   returnColumns, list: the columns to return after the final projection.
//   start & end: int, the index of the rows to return after sorted, left
//       inclusive and right exclusive.
//   (optional) orderBy: dict, mapping from column names to +1 (ASC) or -1 (DESC).
dbRouter.post('/select/:table/:condition/:returnColumns/:start-:end/:orderBy?', async (req, res) => {
    try {
        const table = req.params.table;
        const condition = JSON.parse(req.params.condition);
        const returnColumns = JSON.parse(req.params.returnColumns);
        const start = Number(req.params.start);
        const end = Number(req.params.end);
        const orderBy = (req.params.orderBy === undefined)? undefined : JSON.parse(req.params.orderBy);

        const result = await db.getTable(table).select(
            condition, returnColumns, {
                offset: start,
                limit: end - start,
                orderBy: orderBy,
            },
        );
        console.log('result:');
        console.log(result);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

// Update a row of a table.
// Parameters:
//   table: string, the name of the table to delete the row.
//   condition: object, a mongo-like condition object. The filter to get the
//       rows to be updated.
//   new_values: object, mapping from keys to the new values.
dbRouter.post('/update/:table/:condition/:new_values', async (req, res) => {
    try {
        const table = req.params.table;
        const condition = JSON.parse(req.params.condition);
        const new_values = JSON.parse(req.params.new_values);

        await db.getTable(table).update(condition, new_values);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

// Delete a row from a table.
// Parameters:
//   table: string, the name of the table to delete the row.
//   condition: object, a mongo-like condition object. The filter to get the
//       rows to be deleted.
dbRouter.post('/delete/:table/:condition', async (req, res) => {
    try {
        const table = req.params.table;
        const condition = JSON.parse(req.params.condition);

        await db.getTable(table).delete(condition);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

// Complex query 1: find all the big breed dogs with average lifespan > 10 years.
dbRouter.post('/complex_query/1', async (req, res) => {
    try {
        const result = await db.executeSql('SELECT * FROM Pet JOIN Breed ON Pet.breed_name = Breed.name WHERE breed_name IN (SELECT `name` FROM Breed WHERE typical_age > 10 AND typical_height > (SELECT AVG(typical_height) FROM Breed)) LIMIT 15');
        console.log('result:');
        console.log(result);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

// Complex query 2: list the top 15 pet stores that sell dogs with the highest average rating in recent 2 years.
dbRouter.post('/complex_query/2', async (req, res) => {
    try {
        const result = await db.executeSql('SELECT PetShop.*, AVG(rating) AS avg_rating FROM PetShop JOIN Review ON PetShop.`name` = Review.pet_shop_name WHERE DATEDIFF(CURRENT_DATE(), Review.review_date) <= 2 * 365 GROUP BY Review.pet_shop_name ORDER BY avg_rating DESC LIMIT 15');
        console.log('result:');
        console.log(result);
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

dbRouter.post('/builtin/:func', async (req, res) => {
    try {
        const func = req.params.table;
        const result = await db.executeSql(`CALL ${func}`);
        res.json(result);
    } catch (error) {
        console.log(error);
    }
});

module.exports = dbRouter;
