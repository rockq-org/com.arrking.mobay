'use strict';
/* format string value with arguments */
String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

/* if a string ends with a given suffix */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/* if a string starts with a given prefix */
String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
};

function getDateString(dateString) {
	var date = dateString ? new Date(dateString) : new Date();
    var yyyy = date.getFullYear();
    var mm = date.getMonth() + 1; //January is 0!
    var dd = date.getDate();
    var hh = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();

    if (mm < 10) {
        mm = '0' + mm
    }
    if (dd < 10) {
        dd = '0' + dd
    }
    if (hh < 10) {
        hh = '0' + hh
    }
    if (min < 10) {
        min = '0' + min
    }
    if (sec < 10) {
        sec = '0' + sec
    }
    return '{0}/{1}/{2} {3}:{4}'.f(yyyy, mm, dd, hh, min);
}
