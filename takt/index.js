const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const timeText = document.getElementById("time");
const dateText = document.getElementById("date");
const weekText = document.getElementById("week");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const progress = document.getElementById("progress");
const textColor = document.getElementById("body");
const warningSound = document.getElementById("warningSound");
const breakSound = document.getElementById("breakSound");
const startSound = document.getElementById("startSound");
const style = document.querySelector(':root');

let warningAlertPlayedOnce = false;
let breakAlertPlayedOnce = false;
let startAlertPlayerOnce = false;

const timeFormatted = (date) => `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}:${date.getSeconds() < 10 ? "0" : ""}${date.getSeconds()}`;
const dateFormatted = (date) => `${weekday[date.getDay()]} - ${months[date.getMonth()]} ${date.getDate()}`;

const checkStart = (completion) => {
    if (completion < 5 && !startAlertPlayerOnce) {
        startSound.play();
        startAlertPlayerOnce = !startAlertPlayerOnce;
    } else if (completion > 5 && startAlertPlayerOnce) {
        startAlertPlayerOnce = !startAlertPlayerOnce;
    }
}

const checkBreak = (schedule) => {
    if (schedule.isBreak && !breakAlertPlayedOnce) {
        breakSound.play();
        breakAlertPlayedOnce = !breakAlertPlayedOnce;
    } else if (!schedule.isBreak && breakAlertPlayedOnce) {
        breakAlertPlayedOnce = !breakAlertPlayedOnce;
    }
}

const checkWarning = (completion) => {
    if (completion > 70.0 && !warningAlertPlayedOnce) {
        warningSound.play();
        warningAlertPlayedOnce = true;
    } else if (completion < 10 && warningAlertPlayedOnce) {
        warningAlertPlayedOnce = false;
    }
}

const weekFormatted = (date) => {
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return `Week ${1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)}`;
}

setInterval(async () => {
    let schedule
    try {
        schedule = await fetch('/taktime').then(response => response.json()).then(data => data);
    } catch (error) {
        progress.setAttribute("data-label", error);
        style.style.setProperty('--main-color', '#FF0000');
        style.style.setProperty('--secondary-color', '#660000');

        let date = new Date();
        startTime.innerText = "TBD";
        endTime.innerText = "TBD";
        timeText.innerText = timeFormatted(date);
        dateText.innerText = dateFormatted(date);
        weekText.innerText = weekFormatted(date);
        return;
    }
    
    let _startTime = new Date(schedule.startTime);
    let _endTime = new Date(schedule.endTime);
    let _currentTime = new Date(schedule.currentTime);
    let _nextbreakStart = new Date(schedule.nextBreak[0]);
    let _nextbreakEnd = new Date(schedule.nextBreak[1]);
    let completion = ((_currentTime - _startTime) / (_endTime - _startTime)) * 100;
    let breakInformation = schedule.isBreak ? `Break will end: ${timeFormatted(_nextbreakEnd)}` : `Next break: ${timeFormatted(_nextbreakStart)}`

    progress.setAttribute("value", `${completion}`);
    progress.setAttribute("data-label", breakInformation);

    if (schedule.isBreak == true) {
        style.style.setProperty('--main-color', '#FF0000');
        style.style.setProperty('--secondary-color', '#660000');
    } else {
        style.style.setProperty('--main-color', '#00FF00');
        style.style.setProperty('--secondary-color', '#006600');
    }

    startTime.innerText = timeFormatted(_startTime);
    endTime.innerText = timeFormatted(_endTime);
    timeText.innerText = timeFormatted(_currentTime);
    dateText.innerText = dateFormatted(_currentTime);
    weekText.innerText = weekFormatted(_currentTime);

    checkStart(completion);
    checkWarning(completion);
    checkBreak(schedule);



}, 1000);