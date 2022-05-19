const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const timeText = document.getElementById("time");
const dateText = document.getElementById("date");
const weekText = document.getElementById("week");
const breakSound = document.getElementById("breakSound");

const dateFormatted = (date) => `${weekday[date.getDay()]} - ${months[date.getMonth()]} ${date.getDate()}`;
const timeFormatted = (date) => `${date.getHours() < 10 ? "0" : ""}${date.getHours()}:${date.getMinutes() < 10 ? "0" : ""}${date.getMinutes()}:${date.getSeconds() < 10 ? "0" : ""}${date.getSeconds()}`;
const weekFormatted = (date) => {
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return `Week ${1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)}`;
}

let breakAlertPlayedOnce = false;

setInterval(async () => {
    fetch('/taktime').then(response => response.json())
    .then(schedule => {
        if (schedule.isBreak && !breakAlertPlayedOnce) {
            breakSound.play();
            breakAlertPlayedOnce = !breakAlertPlayedOnce;
        } else if (!schedule.isBreak && breakAlertPlayedOnce) {
            breakAlertPlayedOnce = !breakAlertPlayedOnce;
        }
    })
    .catch(reason => {
        console.log(reason);
    });
    const date = new Date;
    timeText.innerText = timeFormatted(date);
    dateText.innerText = dateFormatted(date);
    weekText.innerText = weekFormatted(date);
}, 1000);