'use strict';
angular.module('mobay.filters', ['config'])

/**
 * A simple relative timestamp filter
 * http://codepen.io/Samurais/pen/PwwLPK
 * https://gist.github.com/Samurais/0c9e81eb18c3d60db46c
 */
.filter('relativets', function() {

    // ms units
    var second = 1000;
    var minute = 60000;
    var hour = 3600000;
    var day = 86400000;
    var year = 31536000000;
    var month = 2592000000;

    function _formatDateString(val) {
        var date = new Date(val);
        var yyyy = date.getFullYear();
        var mm = date.getMonth() + 1; //January is 0!
        var dd = date.getDate();
        var hh = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();

        if (mm < 10) {
            mm = '0' + mm;
        }
        if (dd < 10) {
            dd = '0' + dd;
        }
        if (hh < 10) {
            hh = '0' + hh;
        }
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        return '{0}/{1}/{2} {3}:{4}'.f(yyyy, mm, dd, hh, min);
    };

    return function(value) {
        var diff = new Date() - new Date(value);
        var unit = day;
        var unitStr = '分钟前';
        if (diff > year || diff > month || diff > day) {
            // big gap, just return the absolute time
            return _formatDateString(value);
        } else if (diff > hour) {
            unit = hour;
            unitStr = '小时前';
        } else if (diff > minute) {
            unit = minute;
            unitStr = '分钟前';
        } else {
            unit = second;
            unitStr = '秒前';
        }

        var amt = Math.ceil(diff / unit);
        return amt + '' + unitStr;
    };
})

.filter('orderStatus', function () {

	var statusMap = {
		'0': {
			text: '未成功',
			color: 'statble'
		},
		'1': {
			text: '未支付',
			color: 'assertive'
		},
		'2': {
			text: '已支付',
			color: 'positive'
		},
		'3': {
			text: '成功',
			color: 'balanced'
		}
	};

	return function (statusCode, isColor) {
		return statusMap[statusCode][isColor ? 'color' : 'text'];
	};
});