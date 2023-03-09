// Warning: this file is not tested.

const pbkdf2 = require('pbkdf2');
const express = require('express');

const db = require('../database');

const authRouter = express.Router();

// Reference: https://stackoverflow.com/a/1349426
function makeSalt(length=16) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Parameters:
//   email: string
//   username: string
//   password: string
authRouter.post('/signup', async (req, res) => {
    try {
        const email = req.query.email;
        const password = req.query.password;
        const username = req.query.username;

        const userInfos = await db.getTable('Customer').select({email: email});
        if (userInfos.length > 0) {
            throw new Error(`User already exists`);
        }

        const salt = makeSalt();
        const encryptedPassword = pbkdf2.pbkdf2Sync(password, salt, 1000, 64);
        await db.getTable('Customer').insert({
            email: email,
            username: username,
            salt: salt,
            encrypted_password: encryptedPassword,
        });
        res.sendStatus(200);
    } catch(error) {
        console.error(error);
        res.status(400).send(error.toString());
    }
});

// Parameters:
//   email: string
//   password: string
authRouter.post('/login', async (req, res) => {
    try {
        const email = req.query.email;
        const password = req.query.password;

        const userInfos = await db.getTable('Customer').select({email: email});
        if (userInfos.length === 0) {
            throw new Error(`User with email = ${email} does not exist`);
        }

        // Since email is the primary key, if we found any user, then it has to
        // be the only one user.
        const userInfo = userInfos[0];
        console.log(userInfo);

        const encryptedPassword = pbkdf2.pbkdf2Sync(password, userInfo.salt, 1000, 64);
        if (encryptedPassword.equals(userInfo.encrypted_password)) {
            req.session.user = {email: email};
            res.json({username: userInfo.username, email: email});
        }
        else {
            throw new Error('Password not correct!');
        }
    } catch(error) {
        console.error(error);
        res.status(400).send(error.toString());
    }
});

authRouter.post('/logout', (req, res) => {
    try {
        req.session.user = null;
    } catch(error) {
        console.error(error);
        res.status(400).send(error.toString());
    }
});

module.exports = authRouter;
