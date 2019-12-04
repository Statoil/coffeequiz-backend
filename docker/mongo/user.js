db.createUser(
    {
        user: "coffeequiz",
        pwd: '<add user password>',
        roles: [{ role: "readWrite", db: "stime" }]
    }
);
