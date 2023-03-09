const express = require('express');
const cors = require('cors');
const session = require('express-session');
const qs = require('qs');

const dbRouter = require('./routes/database_operations');
const searchRouter = require('./routes/search');
const authRouter = require('./routes/auth');

const port = 3000;
const app = express();
app.use(cors());
app.use(session({secret: "secret key", resave: true, saveUninitialized: true}));

app.use('/api/database', dbRouter);
app.use('/api/search', searchRouter);
app.use('/api/auth', authRouter);

// Reference: https://github.com/expressjs/express/issues/3453#issuecomment-337984406
app.set('query parser', function (str) {
    return qs.parse(str, { decode: function (s) { return decodeURIComponent(s); } });
});

app.get('/', (req, res) => { res.send("Hello world!"); })

app.listen(port, () => {
    console.log(`backend listening on port ${port}`);
});

module.exports = app;
