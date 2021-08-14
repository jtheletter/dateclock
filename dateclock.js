// Date Clock. (c) JP 2009 (concept), 2018 (code).

var dateclock = (function () {

    // Define functions.
    function getDateAdjustedByOffset (date) {
        // Copy date and add offset, to assure moon-number and moon-day-number only update at local midnight.
        return new Date(date.valueOf() + getOffsetHours(date) * MILLISECONDS_PER_HOUR);
    }
    function getEndOfDateAdjustedByOffset (date) {
        // Copy date, push to last minute of day, adjust for offset.
        // In deciding moon-day numbers, if there's a new moon even at the end of the day,
        // we want to start counting that day as number 1.
        var endOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
        return getDateAdjustedByOffset(endOfDate);
    }
    function getMillisecondsSinceNewMoon (date) {
        if (date < KNOWN_NEW_MOON) {
            console.error('Date for lunar must not be earlier than ' + KNOWN_NEW_MOON.toISOString() + '. Received:', date.toISOString());
        }
        return (date - KNOWN_NEW_MOON) % AVG_MILLISECONDS_PER_LUNAR_MONTH;
    }
    function getDayOfMoon (date) {
        // Get last minute of day (adjusted by offset).
        var adjEndOfDate = getEndOfDateAdjustedByOffset(date);
        // Get milliseconds from new moon to then, convert to days, round up for int 1 thru 30.
        return Math.ceil(getMillisecondsSinceNewMoon(adjEndOfDate) / MILLISECONDS_PER_DAY);
    }
    function getDaysInMoon (date) {
        var testDate;
        for (var testDay = 1; testDay <= 30; testDay++) {
            // testDate = date plus an increasing number of days.
            testDate = new Date(Date.UTC(
                date.getUTCFullYear(),
                date.getUTCMonth(),
                date.getUTCDate() + testDay,
                date.getUTCHours(),
                date.getUTCMinutes(),
                date.getUTCSeconds()
            ));
            // If moon-day of testDate is 1... testDate is now the first day of the next moon.
            if (getDayOfMoon(testDate) === 1) {
                break;
            }
        }
        // Return the moon-day number of the day before the next new moon.
        return getDayOfMoon(new Date(testDate.valueOf() - MILLISECONDS_PER_DAY)); // Return 29 or 30.
    }
    function getFullMoon (date) {
        // Get adjusted end of date, minus time since new moon, plus half a moon.
        var adjEndOfDate = getEndOfDateAdjustedByOffset(date);
        return new Date(
            adjEndOfDate.valueOf() -
            getMillisecondsSinceNewMoon(adjEndOfDate) +
            AVG_MILLISECONDS_PER_LUNAR_MONTH / 2
        );
    }
    function getNextDecSolstice (date) {
        if (date < KNOWN_DEC_SOLSTICE) {
            console.error('Date for lunar must not be earlier than ' + KNOWN_DEC_SOLSTICE.toISOString() + '. Received:', date.toISOString());
        }
        var adjDate = getDateAdjustedByOffset(date);
        var nextDecSolsticeYear;
        // If adjDate is in Dec and on or after day of standardized solstice...
        // ...then the Greg year of the next Dec solstice is the Greg year after adjDate.
        // ...else it's the same Greg year.
        if (
            adjDate.getUTCMonth() === KNOWN_DEC_SOLSTICE.getUTCMonth() &&
            adjDate.getUTCDate() >= KNOWN_DEC_SOLSTICE.getUTCDate()
        ) {
            nextDecSolsticeYear = adjDate.getUTCFullYear() + 1;
        } else {
            nextDecSolsticeYear = adjDate.getUTCFullYear();
        }
        return new Date(Date.UTC(
            nextDecSolsticeYear,
            KNOWN_DEC_SOLSTICE.getUTCMonth(),
            KNOWN_DEC_SOLSTICE.getUTCDate(),
            KNOWN_DEC_SOLSTICE.getUTCHours(),
            KNOWN_DEC_SOLSTICE.getUTCMinutes(),
            KNOWN_DEC_SOLSTICE.getUTCSeconds()
        ));
    }
    function getMoonNumber (date) {
        // Calculate standardized lunations between nearest full moon and next December solstice.
        var nextDecSolstice = getNextDecSolstice(date);
        var fullMoon = getFullMoon(date);
        var diff = (nextDecSolstice.valueOf() - fullMoon.valueOf()) / AVG_MILLISECONDS_PER_LUNAR_MONTH;
        if (diff <= 0) {
            return 0; // Leap moon.
        }
        return 13 - Math.ceil(diff);
    }
    function getMoonsInLunarYear (date) {
        // If current moon is leap moon, or if Greg year starts with leap moon...
        // ...then lunar year has 13 moons, otherwise 12.
        var jan1st = new Date(Date.UTC(date.getUTCFullYear(), 1 - 1, 1, 0, 0, 0));
        if (getMoonNumber(date) === 0 || getMoonNumber(jan1st) === 0) {
            return 13;
        } else {
            return 12;
        }
    }
    function getDaysInMonth (date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
    function getHoursInDst (date) {
        var januaryOffsetHours = getOffsetHours(new Date(date.getFullYear(), 0, 1));
        var julyOffsetHours = getOffsetHours(new Date(date.getFullYear(), 6, 1));
        return Math.abs(januaryOffsetHours - julyOffsetHours);
    }
    function getOffsetHours (date) {
        return date.getTimezoneOffset() * -1 / 60;
    }
    function updateHighlightFlag () {
        if (userHasHighlighted) {
            return;
        }
        userHasHighlighted = true;
        try {
            localStorage.setItem('userHasHighlighted', true);
        } catch (err) {
            console.error(err);
        }
    }
    function focusMonth () {
        els.handMonth.classList.add('focus');
        els.supertitleMonth.classList.add('focus');
        els.digitMonth.classList.add('focus');
    }
    function blurMonth () {
        els.handMonth.classList.remove('focus');
        els.supertitleMonth.classList.remove('focus');
        els.digitMonth.classList.remove('focus');
    }
    function focusDay () {
        els.handDay.classList.add('focus');
        els.supertitleDay.classList.add('focus');
        els.digitDay.classList.add('focus');
    }
    function blurDay () {
        els.handDay.classList.remove('focus');
        els.supertitleDay.classList.remove('focus');
        els.digitDay.classList.remove('focus');
    }
    function focusHour () {
        els.handHour.classList.add('focus');
        els.supertitleHour.classList.add('focus');
        els.digitHour.classList.add('focus');
    }
    function blurHour () {
        els.handHour.classList.remove('focus');
        els.supertitleHour.classList.remove('focus');
        els.digitHour.classList.remove('focus');
    }
    function focusMinute () {
        els.handMinute.classList.add('focus');
        els.supertitleMinute.classList.add('focus');
        els.digitMinute.classList.add('focus');
    }
    function blurMinute () {
        els.handMinute.classList.remove('focus');
        els.supertitleMinute.classList.remove('focus');
        els.digitMinute.classList.remove('focus');
    }
    function focusSecond () {
        els.handSecond.classList.add('focus');
        els.supertitleSecond.classList.add('focus');
        els.digitSecond.classList.add('focus');
    }
    function blurSecond () {
        els.handSecond.classList.remove('focus');
        els.supertitleSecond.classList.remove('focus');
        els.digitSecond.classList.remove('focus');
    }
    function drawPipsForMonths (date) { // Draw 1 thru 12, or 0 thru 12.
        var total = els.toggleMonth.checked ? 12 : getMoonsInLunarYear(date);
        var number = total === 12 ? 1 : 0;
        var index = 0;
        var el, degs;
        els.pipMonth.innerHTML = ''; // Clear previous drawing.
        for (index; index < total; index++, number++) {
            el = number === 0 || number % 3 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = number;
            degs = index / total * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipMonth.appendChild(el);
        }
        numberOfMonthPips = total;
    }
    function drawPipsForDays (date) { // Draw 1 thru 28, 29, 30, or 31.
        var total = els.toggleMonth.checked ? getDaysInMonth(date) : getDaysInMoon(date);
        var number = 1;
        var index = 0;
        var el, degs;
        els.pipDay.innerHTML = ''; // Clear previous drawing.
        for (index; index < total; index++, number++) {
            el = number % 7 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = number;
            degs = index / total * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipDay.appendChild(el);
        }
        numberOfDayPips = total;
    }
    function drawPipsForHours () { // Draw 0 thru 23.
        var number, el, degs;
        for (number = 0; number < 24; number++) {
            el = number % 3 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = number;
            degs = number / 24 * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipHour.appendChild(el);
        }
    }
    function drawPipsForMinutes () { // Draw 0 thru 59.
        var number, el, degs;
        for (number = 0; number < 60; number++) {
            el = number % 5 === 0 ? document.createElement('strong') : document.createElement('span');
            el.textContent = number;
            degs = number / 60 * 360;
            el.style.transform = `rotate(${degs}deg)`;
            els.pipMinute.appendChild(el);
        }
    }
    function rotate (el, degs) {
        el.style.transform = `rotate(${degs}deg)`;
    }
    function doesLocaleObserveDstOnDate (date) {
        var januaryOffsetHours = getOffsetHours(new Date(date.getFullYear(), 0, 1));
        var julyOffsetHours = getOffsetHours(new Date(date.getFullYear(), 6, 1));
        var standardOffsetHours = Math.min(januaryOffsetHours, julyOffsetHours);
        var dateOffsetHours = getOffsetHours(date);
        return dateOffsetHours !== standardOffsetHours;
    }
    function updateClockOffset (date) {
        var offsetHours = getOffsetHours(date);

        if (doesLocaleObserveDstOnDate(date) && !els.toggleTime.checked) { // If locale is observing DST, but user does not want it...
            offsetHours -= hoursInDst;
        } else if (!doesLocaleObserveDstOnDate(date) && els.toggleTime.checked) { // If locale isn't observing DST, but user wants it...
            offsetHours += hoursInDst;
        }

        var offsetText;
        if (offsetHours === 0) {
            offsetText = ''; // For UTC.
        } else if (offsetHours % 1 === 0) {
            offsetText = offsetHours; // For UTC+1, UTC+2... UTC-1, UTC-2...
        } else { // For UTC+1:30, UTC-2:15...
            offsetText = `${Math.trunc(offsetHours)}:${(Math.round(Math.abs(offsetHours) % 1 * 60).toString().padStart(2, '0'))}`;
        }
        if (offsetHours > 0) {
            offsetText = '\u002b' + offsetText; // Prepend plus sign.
        }

        els.utcOffset.textContent = offsetText;
    }
    function updateClockMonth (date) {
        var month, day, daysInMonth, monthsInYear, degs;
        if (els.toggleMonth.checked) {
            month = date.getMonth() + 1; // Add one month for natural counting.
            day = date.getDate();
            daysInMonth = getDaysInMonth(date);
            monthsInYear = 12;
        } else {
            month = getMoonNumber(date);
            day = getDayOfMoon(date);
            daysInMonth = getDaysInMoon(date);
            monthsInYear = getMoonsInLunarYear(date);
        }
        if (monthsInYear === 12) {
            degs = (month - 1 + (day - 1) / daysInMonth) / 12 * 360; // Subtract one month and one day for zero indexing of each.
        } else { // Leap year has 13 moons.
            degs = (month + (day - 1) / daysInMonth) / 13 * 360; // Subtract one day for zero indexing.
        }
        rotate(els.handMonth, degs);
        els.digitMonth.textContent = month < 10 ? `0${month}` : month;
        if (monthsInYear !== numberOfMonthPips) { // Update pips for months, if total months changes.
            drawPipsForMonths(date);
        }
        if (daysInMonth !== numberOfDayPips) { // Update pips for days, if total days changes.
            drawPipsForDays(date);
        }
        updateClockOffset(date);
    }
    function updateClockDay (date) {
        var day = els.toggleMonth.checked ? date.getDate() : getDayOfMoon(date);
        var hour = date.getHours();
        var daysInMonth = els.toggleMonth.checked ? getDaysInMonth(date) : getDaysInMoon(date);
        var degs = (day - 1 + hour / 24) / daysInMonth * 360; // Subtract one day for zero indexing.
        rotate(els.handDay, degs);
        els.digitDay.textContent = day < 10 ? `0${day}` : day;
        updateClockMonth(date);
    }
    function updateClockHour (date) {
        var hour = date.getHours();
        var minute = date.getMinutes();
        var degs = (hour + minute / 60) / 24 * 360;
        rotate(els.handHour, degs);
        els.digitHour.textContent = hour < 10 ? `0${hour}` : hour;
        updateClockDay(date);
        prevUpdateClockHour = date;
    }
    function updateClockMinute (date) {
        var minute = date.getMinutes();
        var second = date.getSeconds();
        var degs = (minute + second / 60) / 60 * 360;
        rotate(els.handMinute, degs);
        els.digitMinute.textContent = minute < 10 ? `0${minute}` : minute;
        if (second === 0 || date - prevUpdateClockHour > MILLISECONDS_PER_MINUTE) { // Update hour (& day, month, offset) on whole minute or after one minute.
            updateClockHour(date);
        }
        prevUpdateClockMinute = date;
    }
    function updateClock (date) { // Set seconds. Set larger units as needed.
        date = date || new Date(); // Invocations by setInterval use new Date objects.
        if (doesLocaleObserveDstOnDate(date) && !els.toggleTime.checked) { // If locale is observing DST, but user does not want it...
            date = new Date(date.valueOf() - hoursInDst * MILLISECONDS_PER_HOUR); // ...then subtract DST.
        } else if (!doesLocaleObserveDstOnDate(date) && els.toggleTime.checked) { // If locale isn't observing DST, but user wants it...
            date = new Date(date.valueOf() + hoursInDst * MILLISECONDS_PER_HOUR); // ...then add DST.
        }
        var second = date.getSeconds();
        var millisecond = date.getMilliseconds();
        var degs = (second + millisecond / 1000) / 60 * 360;
        rotate(els.handSecond, degs);
        els.digitSecond.textContent = second < 10 ? `0${second}` : second;
        if (millisecond === 0 || date - prevUpdateClockMinute > 1000) { // Update minute on whole seconds or after one second.
            updateClockMinute(date);
        }
    }
    function resetClock () {
        // Clear possible timeouts (demo highlights, iOS A2HS prompt).
        timeoutIds.forEach(function (id) {
            window.clearTimeout(id);
        });

        // Clear interval (clock update).
        window.clearInterval(intervalId);
        intervalId = undefined;

        // Ensure no demo highlights.
        blurMonth();
        blurDay();
        blurHour();
        blurMinute();
        blurSecond();

        // Ensure iOS prompt is closed.
        els.iosPrompt.classList.remove('open');

        // Reset panel toggle label's title text.
        els.toggleLabelPanel.title = 'View Info';

        // Clear saved prefs.
        try {
            localStorage.clear();
        } catch (err) {
            console.error(err);
        }

        // Add grey curtain, rotate clock to 90 degrees (neither "clock" nor "sundial" orientation).
        els.fg.classList.add('upfront');

        // Allow time for above clock rotation before closing panel and resetting toggles.
        window.setTimeout(function () {
            els.togglePanel.checked = false;
            els.toggleMonth.checked = false;
            els.toggleTime.checked = false;
            els.toggleOrientation.checked = false;
            els.toggleTheme.checked = false;

            // Wait for toggles to animate before restarting clock.
            window.setTimeout(function () {
                startClock();
            }, 250);
        }, 250);
    }
    function queryDom () {
        els = {};
        els.togglePanel = document.getElementById('toggle-panel');
        els.toggleMonth = document.getElementById('toggle-month');
        els.toggleTime = document.getElementById('toggle-time');
        els.toggleOrientation = document.getElementById('toggle-orientation');
        els.toggleTheme = document.getElementById('toggle-theme');
        els.fg = document.getElementById('fg');
        els.panel = document.getElementById('panel');
        els.resetButton = document.getElementById('reset-button');
        els.supertitleMonth = document.getElementById('supertitle-month');
        els.supertitleDay = document.getElementById('supertitle-day');
        els.supertitleHour = document.getElementById('supertitle-hour');
        els.supertitleMinute = document.getElementById('supertitle-minute');
        els.supertitleSecond = document.getElementById('supertitle-second');
        els.utcOffset = document.getElementById('utc-offset');
        els.pipMonth = document.getElementById('pip-month');
        els.pipDay = document.getElementById('pip-day');
        els.pipHour = document.getElementById('pip-hour');
        els.pipMinute = document.getElementById('pip-minute');
        els.handMonth = document.getElementById('hand-month');
        els.handDay = document.getElementById('hand-day');
        els.handHour = document.getElementById('hand-hour');
        els.handMinute = document.getElementById('hand-minute');
        els.handSecond = document.getElementById('hand-second');
        els.digitMonth = document.getElementById('digit-month');
        els.digitDay = document.getElementById('digit-day');
        els.digitHour = document.getElementById('digit-hour');
        els.digitMinute = document.getElementById('digit-minute');
        els.digitSecond = document.getElementById('digit-second');
        els.toggleLabelMonth = document.getElementById('toggle-label-month');
        els.toggleLabelTime = document.getElementById('toggle-label-time');
        els.toggleLabelPanel = document.getElementById('toggle-label-panel');
        els.iosPrompt = document.getElementById('ios-prompt');
        els.iosPromptClose = document.getElementById('ios-prompt-close');
    }
    function addEventListeners () {
        // Add highlight listeners.
        els.handMonth.addEventListener('touchstart', focusMonth);
        els.handMonth.addEventListener('mouseenter', focusMonth);
        els.handMonth.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.handMonth.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.handMonth.addEventListener('touchend', blurMonth);
        els.handMonth.addEventListener('mouseleave', blurMonth);
        els.digitMonth.addEventListener('touchstart', focusMonth);
        els.digitMonth.addEventListener('mouseenter', focusMonth);
        els.digitMonth.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.digitMonth.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.digitMonth.addEventListener('touchend', blurMonth);
        els.digitMonth.addEventListener('mouseleave', blurMonth);
        els.handDay.addEventListener('touchstart', focusDay);
        els.handDay.addEventListener('mouseenter', focusDay);
        els.handDay.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.handDay.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.handDay.addEventListener('touchend', blurDay);
        els.handDay.addEventListener('mouseleave', blurDay);
        els.digitDay.addEventListener('touchstart', focusDay);
        els.digitDay.addEventListener('mouseenter', focusDay);
        els.digitDay.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.digitDay.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.digitDay.addEventListener('touchend', blurDay);
        els.digitDay.addEventListener('mouseleave', blurDay);
        els.handHour.addEventListener('touchstart', focusHour);
        els.handHour.addEventListener('mouseenter', focusHour);
        els.handHour.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.handHour.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.handHour.addEventListener('touchend', blurHour);
        els.handHour.addEventListener('mouseleave', blurHour);
        els.digitHour.addEventListener('touchstart', focusHour);
        els.digitHour.addEventListener('mouseenter', focusHour);
        els.digitHour.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.digitHour.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.digitHour.addEventListener('touchend', blurHour);
        els.digitHour.addEventListener('mouseleave', blurHour);
        els.handMinute.addEventListener('touchstart', focusMinute);
        els.handMinute.addEventListener('mouseenter', focusMinute);
        els.handMinute.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.handMinute.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.handMinute.addEventListener('touchend', blurMinute);
        els.handMinute.addEventListener('mouseleave', blurMinute);
        els.digitMinute.addEventListener('touchstart', focusMinute);
        els.digitMinute.addEventListener('mouseenter', focusMinute);
        els.digitMinute.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.digitMinute.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.digitMinute.addEventListener('touchend', blurMinute);
        els.digitMinute.addEventListener('mouseleave', blurMinute);
        els.handSecond.addEventListener('touchstart', focusSecond);
        els.handSecond.addEventListener('mouseenter', focusSecond);
        els.handSecond.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.handSecond.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.handSecond.addEventListener('touchend', blurSecond);
        els.handSecond.addEventListener('mouseleave', blurSecond);
        els.digitSecond.addEventListener('touchstart', focusSecond);
        els.digitSecond.addEventListener('mouseenter', focusSecond);
        els.digitSecond.addEventListener('touchstart', updateHighlightFlag, { once: true });
        els.digitSecond.addEventListener('mouseenter', updateHighlightFlag, { once: true });
        els.digitSecond.addEventListener('touchend', blurSecond);
        els.digitSecond.addEventListener('mouseleave', blurSecond);

        // Trigger date re-calculations when user toggles Gregorian/lunar.
        // Update supertitle.
        els.toggleLabelMonth.addEventListener('click', function () {
            prevUpdateClockHour = 0;
            prevUpdateClockMinute = 0;
            els.supertitleMonth.textContent = els.toggleMonth.checked ? 'Moon' : 'Month';
        });

        // Trigger date re-calculations when user toggles DST/ST.
        els.toggleLabelTime.addEventListener('click', function () {
            prevUpdateClockHour = 0;
            prevUpdateClockMinute = 0;
        });

        // Save user prefs for all toggles to local storage.
        els.toggleMonth.addEventListener('change', function () {
            try {
                localStorage.setItem('month', els.toggleMonth.checked);
            } catch (err) {
                console.error(err);
            }
        });
        els.toggleTime.addEventListener('change', function () {
            try {
                localStorage.setItem('time', els.toggleTime.checked);
            } catch (err) {
                console.error(err);
            }
        });
        els.toggleOrientation.addEventListener('change', function () {
            try {
                localStorage.setItem('orientation', els.toggleOrientation.checked);
            } catch (err) {
                console.error(err);
            }
        });
        els.toggleTheme.addEventListener('change', function () {
            try {
                localStorage.setItem('theme', els.toggleTheme.checked);
            } catch (err) {
                console.error(err);
            }
        });

        // Scroll panel to top on open or close.
        els.toggleLabelPanel.addEventListener('click', function () {
            els.panel.scrollTop = 0;
            els.toggleLabelPanel.title = els.togglePanel.checked ? 'View Info' : 'Close Info';
        });

        // Reset button.
        els.resetButton.addEventListener('click', resetClock);

        // Close iOS prompt, remove focus, save flag.
        els.iosPromptClose.addEventListener('click', function () {
            els.iosPrompt.classList.remove('open');
            els.iosPromptClose.blur();
            userHasClosedIosPrompt = true;
            try {
                localStorage.setItem('userHasClosedIosPrompt', true);
            } catch (err) {
                console.error(err);
            }
        });
    }
    function demoHighlights () {
        timeoutIds.push(window.setTimeout(function () { if (!userHasHighlighted) { focusMonth(); } }, 1000));
        timeoutIds.push(window.setTimeout(blurMonth, 2000));
        timeoutIds.push(window.setTimeout(function () { if (!userHasHighlighted) { focusDay(); } }, 2000));
        timeoutIds.push(window.setTimeout(blurDay, 3000));
        timeoutIds.push(window.setTimeout(function () { if (!userHasHighlighted) { focusHour(); } }, 3000));
        timeoutIds.push(window.setTimeout(blurHour, 4000));
        timeoutIds.push(window.setTimeout(function () { if (!userHasHighlighted) { focusMinute(); } }, 4000));
        timeoutIds.push(window.setTimeout(blurMinute, 5000));
        timeoutIds.push(window.setTimeout(function () { if (!userHasHighlighted) { focusSecond(); } }, 5000));
        timeoutIds.push(window.setTimeout(blurSecond, 6000));
    }
    function registerServiceWorker () { // Register service worker for Chrome add-to-home-screen.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').then(function (registration) {
                console.log('ServiceWorker registration successful with scope:', registration.scope);
            }, function (err) {
                console.error('ServiceWorker registration failed:', err);
            });
        } else {
            console.error('ServiceWorker not found in navigator:', navigator);
        }
    }
    function startClock () {
        userHasClosedIosPrompt = null;
        userHasHighlighted = null;
        userPrefMonth = null;
        userPrefTime = null;
        userPrefOrientation = null;
        userPrefTheme = null;

        prevUpdateClockHour = 0;
        prevUpdateClockMinute = 0;

        timeoutIds = [];

        date = new Date();

        numberOfMonthPips = els.toggleMonth.checked ? 12 : getMoonsInLunarYear(date);
        numberOfDayPips = els.toggleMonth.checked ? getDaysInMonth(date) : getDaysInMoon(date);
        hoursInDst = getHoursInDst(date) || 1; // Default one if no DST for locale.

        drawPipsForMonths(date);
        drawPipsForDays(date);
        drawPipsForHours();
        drawPipsForMinutes();

        // Get user prefs from local storage.
        try {
            userHasClosedIosPrompt = localStorage.getItem('userHasClosedIosPrompt') === 'true' ? true : localStorage.getItem('userHasClosedIosPrompt') === 'false' ? false : null;
            userHasHighlighted = localStorage.getItem('userHasHighlighted') === 'true' ? true : localStorage.getItem('userHasHighlighted') === 'false' ? false : null;
            userPrefMonth = localStorage.getItem('month') === 'true' ? true : localStorage.getItem('month') === 'false' ? false : null;
            userPrefTime = localStorage.getItem('time') === 'true' ? true : localStorage.getItem('time') === 'false' ? false : null;
            userPrefOrientation = localStorage.getItem('orientation') === 'true' ? true : localStorage.getItem('orientation') === 'false' ? false : null;
            userPrefTheme = localStorage.getItem('theme') === 'true' ? true : localStorage.getItem('theme') === 'false' ? false : null;
        } catch (err) { // Local storage blocked by user.
            console.error(err);
        }

        // Set el prefs to saved user prefs.
        if (userPrefMonth !== null) {
            els.toggleMonth.checked = userPrefMonth;
        } else {
            els.toggleMonth.checked = true;
        }
        if (userPrefTime !== null) {
            els.toggleTime.checked = userPrefTime;
        } else {
            els.toggleTime.checked = doesLocaleObserveDstOnDate(date); // Use locale's DST observation if no user pref stored.
        }
        if (userPrefOrientation !== null) {
            els.toggleOrientation.checked = userPrefOrientation;
        } else {
            els.toggleOrientation.checked = true;
        }
        if (userPrefTheme !== null) {
            els.toggleTheme.checked = userPrefTheme;
        } else {
            els.toggleTheme.checked = true;
        }

        // Update month supertitle.
        els.supertitleMonth.textContent = els.toggleMonth.checked ? 'Month' : 'Moon';

        updateClock(date);
        els.fg.classList.remove('upfront');
        intervalId = window.setInterval(updateClock, 40); // Arbitray rate that looks good enough onscreen.

        // Demo highlights for new user.
        if (!userHasHighlighted) {
            demoHighlights();
        }

        // Show iOS Add-to-Home-Screen prompt.
        if (!userHasClosedIosPrompt && navigator.userAgent.indexOf('Safari') !== -1 && ['iPhone', 'iPad', 'iPod'].includes(navigator.platform) && !navigator.standalone) {
            timeoutIds.push(window.setTimeout(function () {
                els.iosPrompt.classList.add('open');
            }, 20000));
            timeoutIds.push(window.setTimeout(function () {
                els.iosPrompt.classList.remove('open');
            }, 40000));
        }

        registerServiceWorker();
    }
    function initClock () {
        queryDom();
        addEventListeners();
        startClock();
    }
    // End function definitions.

    // Define constants.
    var FACTORY_DISPLAY = new Date(1970, 10 - 1, 7, 9, 35, 18);
    var KNOWN_DEC_SOLSTICE = new Date(Date.UTC(1969, 12 - 1, 22, 0, 44, 2)); // 1969-12-22T00:44:02.000Z
    var KNOWN_NEW_MOON = new Date(Date.UTC(1970, 1 - 1, 7, 20, 35, 0)); // 1970-01-07T20:35:00.000Z
    var AVG_DAYS_PER_LUNAR_MONTH = 29.530588; // In 2000 Gregorian CE.
    // var AVG_DAYS_PER_SOLAR_YEAR = 365.2422; // In 2000 Gregorian CE.
    var MILLISECONDS_PER_SECOND = 1000;
    var MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * 60;
    var MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60;
    var MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24;
    var AVG_MILLISECONDS_PER_LUNAR_MONTH = AVG_DAYS_PER_LUNAR_MONTH * MILLISECONDS_PER_DAY; // In 2000 Gregorian CE.

    // Declare variables.
    var date;
    var els;
    var hoursInDst;
    var intervalId;
    var numberOfDayPips;
    var numberOfMonthPips;
    var prevUpdateClockHour;
    var prevUpdateClockMinute;
    var timeoutIds;
    var userHasClosedIosPrompt;
    var userHasHighlighted;
    var userPrefMonth;
    var userPrefOrientation;
    var userPrefTheme;
    var userPrefTime;

    // Wait for DOM.
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        initClock();
    } else {
        document.addEventListener('DOMContentLoaded', initClock);
    }

    return {
        reset: resetClock,
        set: function (date) {
            if (typeof date === 'undefined') {
                date = FACTORY_DISPLAY;
                console.log('No date provided; using factory display.');
            } else if (typeof date !== 'object' ||
                date instanceof Date !== true ||
                isNaN(date.valueOf())
            ) {
                console.error('Cannot set invalid date.');
                return;
            }
            this.stop();
            prevUpdateClockMinute = 0;
            prevUpdateClockHour = 0;
            updateClock(date);
        },
        stop: function () {
            window.clearInterval(intervalId);
            intervalId = undefined;
        }
    };

})();
