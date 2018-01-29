// Lunisolar Calendar-Clock. (c) JP 2009 (concept). (c) 2018 (code, in progress).

// 1hr Add copyright to markup.
// 3hr Info screen: Markup. Style. Set user-select-none elsewhere.
// 2hr Fix bug where minute+ updates late after screen in background.
// 2hr Toggle DST/ST.
// 2hr "Month/Day/Hour/Minute/Second" central title & outer glow on numer/hand on mouseover/touch.
// 8hr Add lunar calculations.
// 1hr Update favicon, OG image.
// 1hr Possible to go full screen on phone?
// 1hr Cookie settings.
// 1hr Troubleshoot older iOS.

document.addEventListener('DOMContentLoaded', function () {

    let els = {};

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

    function getDaysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    function rotate(el, degs) {
        el.style.transform = `rotate(${degs}deg)`;
    }
    function updateMonth () {
        let now = new Date();
        let month = now.getMonth() + 1; // Add one month for natural counting.
        let day = now.getDate();
        let daysInMonth = getDaysInMonth(now);
        let rotation = (month - 1 + (day - 1) / daysInMonth) / 12 * 360; // Subtract one month (and day) for zero indexing.
        rotate(els.handMonth, rotation);
        els.digitalMonth.textContent = month < 10 ? `0${month}` : month;
    }
    function updateDay () {
        let now = new Date();
        let day = now.getDate();
        let hour = now.getHours();
        let daysInMonth = getDaysInMonth(now);
        let rotation = (day - 1 + hour / 24) / daysInMonth * 360; // Subtract one day for zero indexing.
        rotate(els.handDay, rotation);
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
        rotate(els.handHour, rotation);
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
        rotate(els.handMinute, rotation);
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
        rotate(els.handSecond, rotation);
        els.digitalSecond.textContent = second < 10 ? `0${second}` : second;
        if (millisecond === 0) { // Update minute once per second.
            updateMinute();
        }
    }
    function updateOffset () {
        let offset = new Date().getTimezoneOffset() / 60;
        if (offset > 0) {
            els.digitalOffset.textContent = `\u002d${offset}`; // hyphen-minus sign
        } else if (offset < 0) {
            els.digitalOffset.textContent = `\u002b${offset}`; // plus sign
        } else {
            els.digitalOffset.textContent = `\u00b1${offset}`; // plus-minus sign
        }
    }
    function updateAll () {
        updateMonth();
        updateDay();
        updateHour();
        updateMinute();
        updateSecond();
        updateOffset();
    }
    function drawPipMonth () {
        els.pipMonth = document.getElementById('pip-month');
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
        els.pipDay = document.getElementById('pip-day');
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
        els.pipHour = document.getElementById('pip-hour');
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
        els.pipMinute = document.getElementById('pip-minute');
        let i, el, degs;
        for (i = 0; i < 60; i++) {
            el = i % 5 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = i;
            degs = i / 60 * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipMinute.appendChild(el);
        }
    }

    drawPipMonth();
    drawPipDay();
    drawPipHour();
    drawPipMinute();
    updateAll();
    // setInterval(updateSecond, 40); // Arbitray rate that looks good enough onscreen.

});
