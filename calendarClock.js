// Lunisolar Calendar-Clock. (c) JP 2009 (concept). (c) 2018 (code, in progress).

// 2hr Toggle DST/ST.
// 2hr "Month/Day/Hour/Minute/Second" central title & outer glow on numer/hand on mouseover/touch.
// 1hr Set user-select-none on most elements.
// 1hr Update favicon, OG image.
// 1hr Cookie settings.
// 8hr Add lunar calculations.
// 2hr Audit performance.
// 1hr Troubleshoot older iOS.
// 3hr Info screen?

document.addEventListener('DOMContentLoaded', function () {

    function drawPipMonth () {
        let i, el, degs;
        for (i = 1; i <= 12; i++) {
            el = i % 3 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = i;
            degs = (i - 1) / 12 * 360; // Subtract 1 for 1-index (natural count).
            el.style.transform = `rotate(${degs}deg)`;
            els.pipMonth.appendChild(el);
        }
    }
    function drawPipDay () {
        let daysInMonth = getDaysInMonth(new Date());
        let i, el, degs;
        for (i = 1; i <= daysInMonth; i++) {
            el = i % 7 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = i;
            degs = (i - 1) / daysInMonth * 360; // Subtract 1 for 1-index (natural count).
            el.style.transform = `rotate(${degs}deg)`;
            els.pipDay.appendChild(el);
        }
    }
    function drawPipHour () {
        let i, el, degs;
        for (i = 0; i < 24; i++) {
            el = i % 3 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = i;
            degs = i / 24 * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipHour.appendChild(el);
        }
    }
    function drawPipMinute () {
        let i, el, degs;
        for (i = 0; i < 60; i++) {
            el = i % 5 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = i;
            degs = i / 60 * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipMinute.appendChild(el);
        }
    }

    function rotate(el, degs) {
        el.style.transform = `rotate(${degs}deg)`;
    }
    function getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    function setOffset (datetime = new Date()) {
        let offset = new Date().getTimezoneOffset() / 60;
        if (offset > 0) {
            els.digitalOffset.textContent = `\u002d${offset}`; // hyphen-minus sign
        } else if (offset < 0) {
            els.digitalOffset.textContent = `\u002b${offset}`; // plus sign
        } else {
            els.digitalOffset.textContent = `\u00b1${offset}`; // plus-minus sign
        }
    }
    function setMonth (datetime = new Date()) {
        let month = datetime.getMonth() + 1; // Add one month for natural counting.
        let day = datetime.getDate();
        let daysInMonth = getDaysInMonth(datetime);
        let degs = (month - 1 + (day - 1) / daysInMonth) / 12 * 360; // Subtract one month (and day) for zero indexing.
        rotate(els.handMonth, degs);
        els.digitalMonth.textContent = month < 10 ? `0${month}` : month;
    }
    function setDay (datetime = new Date()) {
        let day = datetime.getDate();
        let hour = datetime.getHours();
        let daysInMonth = getDaysInMonth(datetime);
        let degs = (day - 1 + hour / 24) / daysInMonth * 360; // Subtract one day for zero indexing.
        rotate(els.handDay, degs);
        els.digitalDay.textContent = day < 10 ? `0${day}` : day;
        prevSetDay = datetime;
    }
    function setHour (datetime = new Date()) {
        let hour = datetime.getHours();
        let minute = datetime.getMinutes();
        let degs = (hour + minute / 60) / 24 * 360;
        rotate(els.handHour, degs);
        els.digitalHour.textContent = hour < 10 ? `0${hour}` : hour;
        if (minute === 0 || datetime - prevSetDay > 1000 * 60 * 60) { // Update day, month, & offset each hour.
            setDay(datetime);
            setMonth(datetime);
            setOffset(datetime);
        }
        prevSetHour = datetime;
    }
    function setMinute (datetime = new Date()) {
        let minute = datetime.getMinutes();
        let second = datetime.getSeconds();
        let degs = (minute + second / 60) / 60 * 360;
        rotate(els.handMinute, degs);
        els.digitalMinute.textContent = minute < 10 ? `0${minute}` : minute;
        if (second === 0 || datetime - prevSetHour > 1000 * 60) { // Update hour each minute.
            setHour(datetime);
        }
        prevSetMinute = datetime;
    }
    function setTime (datetime = new Date()) {
        let second = datetime.getSeconds();
        let millisecond = datetime.getMilliseconds();
        let degs = (second + millisecond / 1000) / 60 * 360;
        rotate(els.handSecond, degs);
        els.digitalSecond.textContent = second < 10 ? `0${second}` : second;
        if (millisecond === 0 || datetime - prevSetMinute > 1000) { // Update minute each second.
            setMinute(datetime);
        }
    }

    let els = {};
    let prevSetDay = 0;
    let prevSetHour = 0;
    let prevSetMinute = 0;

    els.pipMonth = document.getElementById('pip-month');
    els.pipDay = document.getElementById('pip-day');
    els.pipHour = document.getElementById('pip-hour');
    els.pipMinute = document.getElementById('pip-minute');

    els.handMonth = document.getElementById('hand-month');
    els.handDay = document.getElementById('hand-day');
    els.handHour = document.getElementById('hand-hour');
    els.handMinute = document.getElementById('hand-minute');
    els.handSecond = document.getElementById('hand-second');
    els.handOffset = document.getElementById('hand-offset');

    els.digitalMonth = document.getElementById('digit-month');
    els.digitalDay = document.getElementById('digit-day');
    els.digitalHour = document.getElementById('digit-hour');
    els.digitalMinute = document.getElementById('digit-minute');
    els.digitalSecond = document.getElementById('digit-second');
    els.digitalOffset = document.getElementById('digit-offset');

    drawPipMonth();
    drawPipDay();
    drawPipHour();
    drawPipMinute();

    // setTime(new Date(1970, 3 - 1, 25, 9, 35, 42.5)); // "Factory Display"
    setInterval(setTime, 40); // Arbitray rate that looks good enough onscreen.

});
