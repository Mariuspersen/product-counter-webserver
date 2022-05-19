const express = require('express');
const bcrypt = require('bcrypt');
const readline = require('readline');
const fs = require('fs');
const app = express();
const port = 80;

let date = new Date();
let dateFormatted;
let stopped = false;
let progressTime;
let timeAdjusted = false;

const timeFormatted = (date) => `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}:${date.getSeconds() < 10 ? "0" : ""}${date.getSeconds()}`;
const formattedTimestamp = () => `[${timeFormatted(new Date())}]: `;

let count = (() =>  {
    if (fs.existsSync('./count.json')) {
        console.log(formattedTimestamp() + "File found: \"count.json\"");
    } else {
        console.log(formattedTimestamp() + "count.json doesn't exist, creating one.\nProducts can be added by doing <hostname>/add or going to <hostname>/admin");
        fs.writeFileSync('./count.json', JSON.stringify([{ name: "Sample", count: 0, plan: 0 }]));
    }
    return require('./count.json');
})();

let takttime = (() =>{
    if (fs.existsSync('./takttime.json')) {
        console.log(formattedTimestamp() + "File found: \"takttime.json\"");
    } else {
        const takt = 25;
        const start = new Date();
        const end = new Date();
        end.setMinutes(start.getMinutes() + takt);
        console.log(formattedTimestamp() + "takttime.json not found, creating one with default parameters");
        fs.writeFileSync('./takttime.json', JSON.stringify({
            takt: takt,
            startTime: start,
            endTime: end,
            currentTime: new Date(),
            isBreak: false,
            nextBreak: "TBD",
            breaks: [[new Date('01 Jan 1970 00:00:00'), new Date('01 Jan 1970 08:00:00')],
                     [new Date('01 Jan 1970 08:55:00'), new Date('01 Jan 1970 09:10:00')],
                     [new Date('01 Jan 1970 10:55:00'), new Date('01 Jan 1970 11:25:00')],
                     [new Date('01 Jan 1970 13:45:00'), new Date('01 Jan 1970 14:00:00')],
                     [new Date('01 Jan 1970 15:25:00'), new Date('01 Jan 1970 23:59:59')]]
        }));
    }
    let temp = require("./takttime.json");
    temp.breaks = temp.breaks.map(x => x.map(y => new Date(y)));
    return temp;
})()

const password = (() => {
    if ( fs.existsSync('./password.json')) {
        console.log(formattedTimestamp() + "File found: \"password.json\"");
        return require('./password.json');
    } else {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question("No password.json found, enter a admin password: ", function (answer) {
            fs.writeFileSync('./password.json', JSON.stringify({ hash: `${bcrypt.hashSync(answer, 10)}` }));
            rl.close();
            return require('./password.json'); 
        }); 
    }   
})();

const changeCounter = (product, op) => {
    const index = count.findIndex(x => x.name.toLocaleLowerCase() === product.toLocaleLowerCase());
    if (index > -1) {
        switch (op) {
            case 'increase':
                count[index].count++
                break;
            case 'decrease':
                count[index].count--
                break;
            case 'reset':
                count[index].count = 0;
                break;
            default:
                console.log(formattedTimestamp() + "No valid selections entered")
                break;
        }
    }
    else console.log(formattedTimestamp() + `${product} is not in count.json`)
};

app.use(express.static('public'));
app.use('/view', express.static('view'));
app.use('/admin', express.static('admin'));
app.use('/clock', express.static('clock'));
app.use('/takt', express.static('takt'));

app.get('/edit', function (req, res) {
    let productQuery = req.query;
    res.send(productQuery);
    changeCounter(productQuery.product, productQuery.op);
    console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` + JSON.stringify(productQuery));
});

app.get('/plan', function (req, res) {
    let productQuery = req.query;
    res.send(productQuery);
    console.log(formattedTimestamp() + JSON.stringify(productQuery));
    let index = count.findIndex(x => x.name.toLocaleLowerCase() === productQuery.product.toLocaleLowerCase());
    if (index > -1) {
        count[index].plan = productQuery.plan;
    }
})

app.get('/toggleBreak', function (req, res) {
    if (req.query.isbreak === '') {
        res.send(stopped);
        console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` + "Paused: " + stopped)
    }
    else if (takttime.isBreak) {
        res.send(stopped);
        stopped = !stopped;
        console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` + "Paused: " + stopped)
    } else {
        res.send(stopped);
        stopped = !stopped;
        console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` + "Paused: " + stopped)
    }
})

app.get('/update', function (req, res) {
    let productQuery = req.query;
    let index = count.findIndex(x => x.name.toLowerCase() === productQuery.product.toLowerCase());
    switch (productQuery.option) {
        case 'delete':
            if (index != -1) count = count.filter(x => x.name.toLowerCase() !== productQuery.product.toLowerCase());
            break;
        case 'add':
            if (index == -1) count.push({ name: productQuery.product, count: 0, plan: 0 });
            break;
        default:
            break;
    }
    res.send(count);
    console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` + JSON.stringify(count));
});

app.get('/count', (req, res) => {
    res.json(count);
});

app.get('/password', (req, res) => {
    const local_password = password.hash;
    const remote_password = req.query.password;
    bcrypt.compare(remote_password, local_password).then(correct => {
        console.log(formattedTimestamp() + `(${req.socket.remoteAddress})` +  "Admin password was %s",correct ? "correct" : "incorrect")
        res.send(correct);
    }); 
})

app.get('/taktime', (req, res) => {
    res.json(takttime);
});

app.listen(port, () => {
    console.log(formattedTimestamp() + `Starting server on port ${port}`);
});

setInterval(() => {
    date = new Date();
    let _startTime = new Date(takttime.startTime);
    let _endTime = new Date(takttime.endTime);
    //Formats the date so it can be compared with the breaks in const breaks
    dateFormatted = new Date(`01 Jan 1970 ${timeFormatted(date)}`);
    takttime.currentTime = date;
    //Checks if currently a break
    if(stopped) {
        takttime.isBreak = true
    } else {
        takttime.isBreak = takttime.breaks.map(x => dateFormatted >= x[0] && x[1] >= dateFormatted).reduce((a, y) => a == true ? true : y ? true : false);
    }
    //Finds the next break
    takttime.nextBreak = takttime.breaks.find(x => x[1] > dateFormatted);
    //If The current time is higher than the endtime reset the progressbar back to the beginning with new endtime
    if(stopped || takttime.isBreak === true) {
        if(!timeAdjusted) {
          progressTime = date - _startTime;
          timeAdjusted = true;
        }
        //Shuffles the end and starting times forward during the break
        _endTime = new Date();
        _endTime.setTime(date.getTime() + takttime.takt*60*1000);
        _startTime = new Date();
        _startTime.setTime(_startTime.getTime() - progressTime)
        takttime.startTime = _startTime;
        takttime.endTime = _endTime;
      } else {
        timeAdjusted = false;
      }
      
    if ((date > _endTime)&&(takttime.isBreak !== true|| !stopped)) {
        takttime.startTime = new Date(date);
        _endTime = new Date(date);
        _endTime.setMinutes(date.getMinutes() + takttime.takt) 
        takttime.endTime = _endTime;
    }
}, 1000)

let once = false;
const exitHandler = () => {
    if(!once) {
        once = !once;
        const count_saved = fs.promises.writeFile('./count.json',JSON.stringify(count))
        .then(() => console.log(formattedTimestamp()+"Saving file: \"count.json\""));

        const takttime_saved = fs.promises.writeFile('./takttime.json',JSON.stringify(takttime))
        .then(() => console.log(formattedTimestamp()+"Saving file: \"takttime.json\""));

        const password_saved = fs.promises.writeFile('./password.json',JSON.stringify(password))
        .then(() => console.log(formattedTimestamp()+"Saving file: \"password.json\""));
        
        Promise.all([count_saved,takttime_saved,password_saved]).then(() => {
            console.log(`${formattedTimestamp()}Exiting`);
            process.exit(0);
        });
    }  
}
process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);
