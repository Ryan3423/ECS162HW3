db = db.getSiblingDB('mydatabase');  // Switch to the 'mydatabase' database

// Check if the users collection exists, and if not, insert the static user
db.createCollection('comments');
db.users.find().count() === 0 && db.users.insertOne({
    email: 'james@example.com',
    hash: '$2a$10$CwTycUXWue0Thq9StjUM0uJ8DPLKXt1FYlwYpQW2G3cAwjKoh2WZK',  // hashed password
    username: 'hello',
    userID: '300',
});
db.comments.insertOne({
    email: 'ahsdfkajsd;flakjds@example.com'
})