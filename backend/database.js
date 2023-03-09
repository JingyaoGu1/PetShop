const mysql = require('mysql2/promise');

function sanitizeStr(str) {
    return JSON.stringify(str);
}

function sanitizeColumn(str) {
    return `\`${str}\``;
}

function sanitizeValue(val) {
    return (typeof val === 'string') ? sanitizeStr(val) : val;
}

function sanitizedKeys(object) {
    return Object.keys(object).map(sanitizeColumn);
}

function sanitizedValues(object) {
    return Object.values(object).map(sanitizeValue);
}

function sanitizeTableName(tableName, isJoined) {
    if (isJoined) {
        return tableName;
    }
    else {
        return sanitizeColumn(tableName);
    }
}

function addBrackets(str) {
    return `(${str})`;
}

class Table {
    constructor(name, database, isJoined=false) {
        this.name = name;
        this.database = database;
        this.isJoined = isJoined;
    }

    // Join a table with another based on certain condition.
    // TODO: currently support only equality conditions.
    // E.g. to get the table A JOIN B ON A.a = B.b, use:
    // db.getTable('A').join(db.getTable('B'), {'A': 'a', 'B': 'b'})
    // If condition is 'natural', then do natural join instead.
    join(table, condition) {
        if (condition === 'natural') {
            return this.naturalJoin(table);
        }
        if (typeof condition !== 'object' || Object.keys(condition) !== 2) {
            throw new Error(`Invalid condition ${condition}`);
        }

        const [key1, key2] = Object.keys(condition);
        const [sanitizedKey1, sanitizedKey2] = [key1, key2].map(sanitizeColumn);
        const [sanitizedValue1, sanitizedValue2] = [Object[key1], Object[key2]].map(sanitizeColumn);
        const newTableName = `${sanitizeTableName(this.name, this.isJoined)} JOIN ${sanitizeTableName(table.name, table.isJoined)} ON ${sanitizedKey1}.${sanitizedValue1} = ${sanitizedKey2}.${sanitizedValue2}`;
        return new Table(newTableName, this.db, True);
    }

    naturalJoin(table) {
        const newTableName = `${sanitizeTableName(this.name, this.isJoined)} NATURAL JOIN ${sanitizeTableName(table.name, table.isJoined)}`;
        return new Table(newTableName, this.db, True);
    }

    // Insert a row into this table.
    // Parameters:
    //    row: dict, mapping from column names to values.
    async insert(row) {
        if (this.isJoined) {
            throw new Error('Cannot insert data into a joined table!');
        }
        const keys = sanitizedKeys(row);
        const values = sanitizedValues(row);
        const sql = `INSERT INTO ${sanitizeTableName(this.name, this.isJoined)}(${keys.join(', ')}) VALUES (${values.join(', ')})`;
        return await this.database.executeSql(sql);
    }

    // Select some rows according to a condition.
    // Parameters:
    //   condition: dict, a mongo-like condition. See `this.translateCondition`
    //       for more details.
    //   cols: list, the columns to be returned. If not given, return all the
    //       columns.
    //   postProcess: dict, the post process operations. See
    //   `this.translatePostProcess` for more details.
    async select(condition = {}, cols = [], postProcess = {}) {
        let selectedCols;
        if (cols.length === 0) {
            selectedCols = ['*'];
        }
        else {
            selectedCols = cols.map(sanitizeColumn);
        }
        const selectedColsStr = selectedCols.join(', ');

        const conditionStr = this.translateCondition(condition);
        const postProcessStr = this.translatePostProcess(postProcess);

        const sql = `SELECT ${selectedColsStr} FROM ${sanitizeTableName(this.name, this.isJoined)} ${conditionStr} ${postProcessStr}`;
        return await this.database.executeSql(sql);
    }

    // Update some rows according to a condition.
    //   condition: dict, a mongo-like condition. See `this.translateCondition`
    //       for more details.
    //   updates: dict, mapping from the column names to the new values.
    async update(condition, updates) {
        if (this.isJoined) {
            throw new Error('Cannot update data of a joined table!');
        }

        const keys = sanitizedKeys(updates);
        const values = sanitizedValues(updates);
        const updateParts = [];
        for (let i = 0; i < keys.length; i++) {
            updateParts.push(`${keys[i]} = ${values[i]}`);
        }
        const updateStr = updateParts.join(", ");

        const conditionStr = this.translateCondition(condition);

        const sql = `UPDATE ${sanitizeTableName(this.name, this.isJoined)} SET ${updateStr} ${conditionStr}`;
        return await this.database.executeSql(sql);
    }

    // Delete some rows according to a condition.
    //   condition: dict, a mongo-like condition. See `this.translateCondition`
    //       for more details.
    async delete(condition) {
        if (this.isJoined) {
            throw new Error('Cannot delete data from a joined table!');
        }

        const conditionStr = this.translateCondition(condition);
        const sql = `DELETE FROM ${sanitizeTableName(this.name, this.isJoined)} ${conditionStr}`;
        return await this.database.executeSql(sql);
    }

    // Translates the condition object to the constraints in SQL.
    // Parameters:
    //   condition: dict, having (optionally) one of the following keys:
    //     $or: array, OR operation on a list of conditions.
    //     $and: array, AND operation on a list of conditions.
    // If all the above keys are missing, assume that that AND is joining
    // all the conditions formulated as `key translateConditionalValues(val)`.
    translateCondition(condition) {
        const conditionStr = this._translateCondition(condition);
        if (conditionStr !== '') {
            return 'WHERE ' + conditionStr;
        }
        else {
            return '';
        }
    }

    _translateCondition(condition) {
        const isAndCondition = ('$and' in condition);
        const isOrCondition = ('$or' in condition);
        if (isAndCondition || isOrCondition) {
            if (Object.keys(condition).length > 1) {
                throw new Error('Cannot parse a condition that contains keys other than $and or $or.');
            }

            if (isAndCondition) {
                return condition['$and']
                    .map((cond) => { return this._translateCondition(cond); })
                    .map(addBrackets)
                    .join(' AND ');
            }
            else {
                return condition['$or']
                    .map((cond) => { return this._translateCondition(cond); })
                    .map(addBrackets)
                    .join(' OR ');
            }
        }

        if (Object.keys(condition).length === 0) {
            return '';
        }

        // A single part, join these condition with AND.
        const parts = [];
        for (const [key, value] of Object.entries(condition)) {
            const operatorAndRhs = this.translateConditionValues(value);
            parts.push(`${sanitizeColumn(key)} ${operatorAndRhs}`);
        }

        if (parts.length === 1) {
            return parts[0];
        }
        else {  // parts.length > 1
            return parts.map(addBrackets).join(' AND ');
        }
    }

    // Parameters:
    //   condition is either a number, a string (equal implied), or a dict with
    //   one of the keys, and the corresponding value is the right hand side:
    //     $like, translated into LIKE statement.
    //     $ne, translated into !=.
    //     $lt, translated into <.
    //     $gt, translated into >.
    //     $lte, translated into <=.
    //     $gte, translated into >=.
    //
    // TODO: Support non-scalar value right hand sides.
    translateConditionValues(condition) {
        if (typeof condition === 'number' || typeof condition === 'string') {
            return '= ' + JSON.stringify(condition);
        }
        else {  // an operand + right hand side.
            const keys = Object.keys(condition);
            if (keys.length != 1) {
                throw new Error(f`Invalid condition value: ${condition}`);
            }

            const key = keys[0];
            const value = sanitizeValue(condition[key]);
            switch (key) {
                case "$like": return `LIKE ${value}`;
                case "$ne": return `!= ${value}`;
                case "$lt": return `< ${value}`;
                case "$gt": return `> ${value}`;
                case "$lte": return `<= ${value}`;
                case "$gte": return `>= ${value}`;
                default: throw new Error(`Invalid operator ${key}`);
            }
        }
    }

    // Optional keys:
    // $sort: dict mapping from column name to +1 (ASC) or -1 (DESC).
    // $limit: int
    // $offset: int
    // Currently only support order by a single column (not expressions).
    translatePostProcess(postProcessArgs) {
        const { $limit: limit, $offset: offset, $sort: orderBy } = postProcessArgs;
        const parts = [];
        if (orderBy !== undefined) {
            const columnNames = sanitizedKeys(orderBy);
            const orderNames = Object.values(orderBy).map((val) => { return val === 1 ? 'ASC' : 'DESC'; });

            if (columnNames.length !== 0) {
                const orderByParts = [];
                for (let i = 0; i < columnNames.length; i++) {
                    orderByParts.push(columnNames[i], orderNames[i]);
                }
                parts.push('ORDER BY');
                parts.push(orderByParts.join(' '));
            }
        }
        if (limit !== undefined) {
            parts.push(`LIMIT ${limit}`);
        }
        if (offset !== undefined) {
            parts.push(`OFFSET ${offset}`);
        }
        return parts.join(' ');
    }
};

class Database {
    constructor(connectionConfig) {
        this.connectionPool = mysql.createPool(connectionConfig);
    }

    getTable(name) {
        return new Table(name, this);
    }

    async executeSql(sql) {
        console.log(`executing SQL: ${sql}`);
        const [rows, fields] = await this.connectionPool.execute(sql);
        return rows;
    }

    
};

db = new Database({
    user: 'root',
    host: '34.69.102.167',
    password: 'petshop111',
    database: 'PetShopDatabase',
});

module.exports = db;
