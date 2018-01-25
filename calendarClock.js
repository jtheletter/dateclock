// Lunisolar Calendar-Clock. Work in progress. (c) JP 2009-2018.

document.addEventListener('DOMContentLoaded', function () {

    let els = {};

    els.analogMonth = document.getElementById('analog-month');
    els.analogDay = document.getElementById('analog-day');
    els.analogHour = document.getElementById('analog-hour');
    els.analogMinute = document.getElementById('analog-minute');
    els.analogSecond = document.getElementById('analog-second');
    els.analogOffset = document.getElementById('analog-offset');

    els.digitalYear = document.getElementById('digital-year');
    els.digitalMonth = document.getElementById('digital-month');
    els.digitalDay = document.getElementById('digital-day');
    els.digitalHour = document.getElementById('digital-hour');
    els.digitalMinute = document.getElementById('digital-minute');
    els.digitalSecond = document.getElementById('digital-second');
    els.digitalOffset = document.getElementById('digital-offset');

    function getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    function updateYear () {
        els.digitalYear.textContent = new Date().getFullYear();
    }
    function updateMonth () {
        let now = new Date();
        let month = now.getMonth() + 1; // Add one month for natural counting.
        let day = now.getDate();
        let daysInMonth = getDaysInMonth(now);
        let rotation = (month - 1 + (day - 1) / daysInMonth) / 12 * 360; // Subtract one month (and day) for zero indexing.
        els.analogMonth.style.transform = `rotate(${rotation}deg)`;
        els.digitalMonth.textContent = month < 10 ? `0${month}` : month;
        if (month === 1 && day === 1) { // Update year (which is digital only) on January 1st.
            updateYear();
        }
    }
    function updateDay () {
        let now = new Date();
        let day = now.getDate();
        let hour = now.getHours();
        let daysInMonth = getDaysInMonth(now);
        let rotation = (day - 1 + hour / 24) / daysInMonth * 360; // Subtract one day for zero indexing.
        els.analogDay.style.transform = `rotate(${rotation}deg)`;
        els.digitalDay.textContent = day < 10 ? `0${day}` : day;
        if (hour === 0) { // Update month once per day.
            updateMonth();
        }
    }
    function updateHour () {
        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let rotation = (hour + minute / 60) / 24 * 360;
        els.analogHour.style.transform = `rotate(${rotation}deg)`;
        els.digitalHour.textContent = hour < 10 ? `0${hour}` : hour;
        if (minute === 0) { // Update day once per hour.
            updateDay();
        }
    }
    function updateMinute () {
        let now = new Date();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let rotation = (minute + second / 60) / 60 * 360;
        els.analogMinute.style.transform = `rotate(${rotation}deg)`;
        els.digitalMinute.textContent = minute < 10 ? `0${minute}` : minute;
        if (second === 0) { // Update hour once per minute.
            updateHour();
        }
    }
    function updateSecond () {
        let now = new Date();
        let second = now.getSeconds();
        let millisecond = now.getMilliseconds();
        let rotation = (second + millisecond / 1000) / 60 * 360;
        els.analogSecond.style.transform = `rotate(${rotation}deg)`;
        els.digitalSecond.textContent = second < 10 ? `0${second}` : second;
        if (millisecond === 0) { // Update minute once per second.
            updateMinute();
        }
    }
    function updateOffset () {
        let offset = new Date().getTimezoneOffset() / 60;
        if (offset < 0) {
            els.digitalOffset.textContent = `\u002b${offset}`;
        } else if (offset > 0) {
            els.digitalOffset.textContent = `\u2212${offset}`;
        } else {
            els.digitalOffset.textContent = `\u00b1${offset}`;
        }
    }
    function updateAll () {
        updateYear();
        updateMonth();
        updateDay();
        updateHour();
        updateMinute();
        updateSecond();
        updateOffset();
    }

    updateAll();
    setInterval(updateSecond, 40); // Arbitray rate that looks good enough onscreen.

});
