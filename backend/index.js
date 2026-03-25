const express = require('express')
const mongoose = require('mongoose');
const app = express()
const port = process.env.PORT || 5000



main()
    .then(() => console.log("Mongodb is successfully connected."))
    .catch((err) => console.log(err))

async function main() {
    await mongoose.connect('mongodb+srv://kalenga10:kalenga10@lebaba.mjtycpz.mongodb.net/lebaba_new_version?appName=lebaba');

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
