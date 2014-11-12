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

/**
 * this code is ugly, but still not found better ways to make handleBlueMixNotification globally.
 * because it has to be global to support callback from IBMPush iOS Native Code.
 * use a timeout function can make backgroud-foreground works.
 * but close-foreground still does not work.
 * the message arrives, but when the app wake up, the cordova method does not called.
 */
function handleApplePushNotificationArrival(msg) {
	alert(JSON.stringify(msg));
}