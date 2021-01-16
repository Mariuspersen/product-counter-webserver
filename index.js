const express = require('express');
const bcrypt = require('bcrypt');
var readline = require('readline');
const fs = require('fs');
const app = express();
const port = 80;

const changeCounter = (product, op) => {
    let data = require('./count.json');
    let index = data.findIndex(x => x.name.toLocaleLowerCase() === product.toLocaleLowerCase());
    if (index > -1) {
        switch (op) {
            case 'increase':
                data[index].count++
                break;
            case 'decrease':
                data[index].count--
                break;
            case 'reset':
                data[index].count = 0;
                break;
            default:
                console.log("No valid selections entered")
                break;
        }
        fs.writeFileSync('./count.json', JSON.stringify(data));
    }
    else console.log(`${product} is not in count.json`)
};

app.use(express.static('public'));
app.use(express.static('private'));

app.get('/edit', function (req, res) {
    let productQuery = req.query;
    res.send(productQuery);
    changeCounter(productQuery.product, productQuery.op);
    console.log(productQuery);
});

app.get('/count', (req, res) => {
    let data = require('./count.json');
    console.log("sending data");
    res.json(data);
});

app.get('/password',async (req,res) => {
    let data = require('./password.json');
    let password = req.query.password;
    const correct =  await bcrypt.compare(password,data.hash);
    res.send(correct);
})

app.listen(port,async () => {
    try {

        await require('./count.json');
        console.log("count.json found");
    } catch (error) {
        console.log("count.js doesn't exist, creating one.\nProducts can be added by doing <hostname>/add")
        fs.writeFileSync('./count.json', JSON.stringify([{ name: "Sample", count: 0 }]));
    }
    console.log(`starting server on port ${port}`);
    try {
        require('./password.json')
        console.log("password.json found");
    } catch (error) {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("No password.json found, enter a admin password: ", function (answer) {
            fs.writeFileSync('./password.json', JSON.stringify({ hash:`${bcrypt.hashSync(answer, 10)}`}));
            rl.close();
        });
    }
});