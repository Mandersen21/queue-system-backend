const express = require('express');

const app = express();
app.use(express.json());

console.log("Node program started!s")

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listeling on port ' + port))