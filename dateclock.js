// Date Clock. (c) JP 2009 (concept), 2018 (code).

(function () {

    // Wait for DOM.
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        dateclock();
    } else {
        document.addEventListener('DOMContentLoaded', dateclock);
    }

    function dateclock () {
        // Define functions.
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
        function drawPipMonth () { // Draw 1 thru 12.
            var i, el, degs;
            for (i = 1; i <= 12; i++) {
                el = i % 3 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
                el.textContent = i;
                degs = (i - 1) / 12 * 360; // Subtract 1 for 1-index (natural count).
                el.style.transform = `rotate(${degs}deg)`;
                els.pipMonth.appendChild(el);
            }
        }
        function drawPipDay (datetime) { // Draw 1 thru 28, 29, 30, or 31.
            var daysInMonth = getDaysInMonth(datetime);
            var i, el, degs;
            els.pipDay.innerHTML = '';
            for (i = 1; i <= daysInMonth; i++) {
                el = i % 7 - 1 === 0 ? document.createElement('strong') : document.createElement('span');
                el.textContent = i;
                degs = (i - 1) / daysInMonth * 360; // Subtract 1 for 1-index (natural count).
                el.style.transform = `rotate(${degs}deg)`;
                els.pipDay.appendChild(el);
            }
            numberOfDayPips = daysInMonth;
        }
        function drawPipHour () { // Draw 0 thru 23.
            var i, el, degs;
            for (i = 0; i < 24; i++) {
                el = i % 3 === 0 ? document.createElement('strong') : document.createElement('span');
                el.textContent = i;
                degs = i / 24 * 360;
                el.style.transform = `rotate(${degs}deg)`;
                els.pipHour.appendChild(el);
            }
        }
        function drawPipMinute () { // Draw 0 thru 59.
            var i, el, degs;
            for (i = 0; i < 60; i++) {
                el = i % 5 === 0 ? document.createElement('strong') : document.createElement('span');
                el.textContent = i;
                degs = i / 60 * 360;
                el.style.transform = `rotate(${degs}deg)`;
                els.pipMinute.appendChild(el);
            }
        }
        function rotate (el, degs) {
            el.style.transform = `rotate(${degs}deg)`;
        }
        function getDaysInMonth (datetime) {
            return new Date(datetime.getFullYear(), datetime.getMonth() + 1, 0).getDate();
        }
        function getHoursInDst (datetime) {
            var januaryOffsetHours = new Date(datetime.getFullYear(), 0, 1).getTimezoneOffset() * -1 / 60;
            var julyOffsetHours = new Date(datetime.getFullYear(), 6, 1).getTimezoneOffset() * -1 / 60;
            return Math.abs(januaryOffsetHours - julyOffsetHours);
        }
        function doesLocaleObserveDstOnDate (datetime) {
            var januaryOffsetHours = new Date(datetime.getFullYear(), 0, 1).getTimezoneOffset() * -1 / 60; // -8 Los Angeles (ST). +1 Berlin (ST). +11 Sydney (DST). -3 Santiago (DST).
            var julyOffsetHours = new Date(datetime.getFullYear(), 6, 1).getTimezoneOffset() * -1 / 60; // -7 Los Angeles (DST). +2 Berlin (DST). +10 Sydney (ST). -4 Santiago (ST).
            var standardOffsetHours = Math.min(januaryOffsetHours, julyOffsetHours);
            var datetimeOffsetHours = datetime.getTimezoneOffset() * -1 / 60;
            return datetimeOffsetHours !== standardOffsetHours;
        }
        function updateClockOffset (datetime) {
            var offsetHours = datetime.getTimezoneOffset() * -1 / 60;
            if (doesLocaleObserveDstOnDate(datetime) && !els.toggleTime.checked) { // If locale is observing DST, but user does not want it...
                offsetHours -= hoursInDst;
            } else if (!doesLocaleObserveDstOnDate(datetime) && els.toggleTime.checked) { // If locale isn't observing DST, but user wants it...
                offsetHours += hoursInDst;
            }
            if (offsetHours < 0) {
                els.utcOffset.textContent = `UTC\u002d${Math.abs(offsetHours)}h`; // hyphen-minus sign
            } else if (offsetHours > 0) {
                els.utcOffset.textContent = `UTC\u002b${offsetHours}h`; // plus sign
            } else {
                els.utcOffset.textContent = `UTC\u00b10h`; // plus-minus sign
            }
        }
        function updateClockMonth (datetime) {
            var month = datetime.getMonth() + 1; // Add one month for natural counting.
            var day = datetime.getDate();
            var daysInMonth = getDaysInMonth(datetime);
            var degs = (month - 1 + (day - 1) / daysInMonth) / 12 * 360; // Subtract one month (and day) for zero indexing.
            rotate(els.handMonth, degs);
            els.digitMonth.textContent = month < 10 ? `0${month}` : month;
            if (daysInMonth !== numberOfDayPips) { // Update pips for days of month, if total days changes.
                drawPipDay(datetime);
            }
            updateClockOffset(datetime);
        }
        function updateClockDay (datetime) {
            var day = datetime.getDate();
            var hour = datetime.getHours();
            var daysInMonth = getDaysInMonth(datetime);
            var degs = (day - 1 + hour / 24) / daysInMonth * 360; // Subtract one day for zero indexing.
            rotate(els.handDay, degs);
            els.digitDay.textContent = day < 10 ? `0${day}` : day;
            updateClockMonth(datetime);
        }
        function updateClockHour (datetime) {
            var hour = datetime.getHours();
            var minute = datetime.getMinutes();
            var degs = (hour + minute / 60) / 24 * 360;
            rotate(els.handHour, degs);
            els.digitHour.textContent = hour < 10 ? `0${hour}` : hour;
            updateClockDay(datetime);
            prevUpdateClockHourDatetime = datetime;
        }
        function updateClockMinute (datetime) {
            var minute = datetime.getMinutes();
            var second = datetime.getSeconds();
            var degs = (minute + second / 60) / 60 * 360;
            rotate(els.handMinute, degs);
            els.digitMinute.textContent = minute < 10 ? `0${minute}` : minute;
            if (second === 0 || datetime - prevUpdateClockHourDatetime > 1000 * 60) { // Update hour (& day, month, offset) on whole minute or after one minute.
                updateClockHour(datetime);
            }
            prevUpdateClockMinuteDatetime = datetime;
        }
        function updateClock (datetime) { // Set seconds. Set larger units as needed.
            datetime = datetime || new Date(); // Invocations by setInterval use new Date objects.
            if (doesLocaleObserveDstOnDate(datetime) && !els.toggleTime.checked) { // If local is observing DST, but user does not want it...
                datetime = new Date(datetime.valueOf() - hoursInDst * 60 * 60 * 1000);
            } else if (!doesLocaleObserveDstOnDate(datetime) && els.toggleTime.checked) { // If local isn't observing DST, but user wants it...
                datetime = new Date(datetime.valueOf() + hoursInDst * 60 * 60 * 1000);
            }
            var second = datetime.getSeconds();
            var millisecond = datetime.getMilliseconds();
            var degs = (second + millisecond / 1000) / 60 * 360;
            rotate(els.handSecond, degs);
            els.digitSecond.textContent = second < 10 ? `0${second}` : second;
            if (millisecond === 0 || datetime - prevUpdateClockMinuteDatetime > 1000) { // Update minute on whole seconds or after one second.
                updateClockMinute(datetime);
            }
        }
        function resetClock () {
            // Clear possible timeouts (demo highlights, iOS A2HS prompt).
            timeoutIds.forEach(function (id) {
                window.clearTimeout(id);
            });
            timeoutIds = [];

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
        function getElements () {
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

            // Trigger datetime re-calculations when user toggles DST/ST.
            els.toggleLabelTime.addEventListener('click', function () {
                prevUpdateClockHourDatetime = 0;
                prevUpdateClockMinuteDatetime = 0;
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
            datetime = new Date();
            // datetime = new Date(1970, 10 - 1, 7, 9, 35, 18); // "Factory Display"

            prevUpdateClockHourDatetime = 0;
            prevUpdateClockMinuteDatetime = 0;

            numberOfDayPips = getDaysInMonth(datetime);
            hoursInDst = getHoursInDst(datetime) || 1; // Default one if no DST for locale.

            userHasClosedIosPrompt = null;
            userHasHighlighted = null;
            userPrefMonth = null;
            userPrefTime = null;
            userPrefOrientation = null;
            userPrefTheme = null;

            els = {};
            getElements();
            addEventListeners();

            drawPipMonth();
            drawPipDay(datetime);
            drawPipHour();
            drawPipMinute();

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
                els.toggleTime.checked = doesLocaleObserveDstOnDate(datetime); // Use locale's DST observation if no user pref stored.
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

            updateClock(datetime);
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
        // End function definitions.

        var datetime;
        var prevUpdateClockHourDatetime;
        var prevUpdateClockMinuteDatetime;
        var numberOfDayPips;
        var hoursInDst;
        var userHasClosedIosPrompt;
        var userHasHighlighted;
        var userPrefMonth;
        var userPrefTime;
        var userPrefOrientation;
        var userPrefTheme;
        var intervalId;

        var timeoutIds = [];
        var els = {};

        startClock();

    }

})();
