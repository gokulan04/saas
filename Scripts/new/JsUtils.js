var adminda = {};
adminda.util = {};
adminda.util.fn = {};
adminda.const = {};

/* this method called from ember adm-session-expired component */
adminda.util.fn.reloadPageForSessionExpired = function () {
  // alert('reloadPageForSessionExpired');
  location.reload();
};
adminda.util.fn.debounce = function (func, wait, immediate) {
  //src: https://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

adminda.util.fn.getUrlParams = function () {
  //src: http://stackoverflow.com/a/2880929
  var match,
    pl = /\+/g, // Regex for replacing addition symbol with a space
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) {
      return decodeURIComponent(s.replace(pl, " "));
    },
    query = window.location.search.substring(1),
    urlParams = {};
  while ((match = search.exec(query)))
    urlParams[decode(match[1])] = decode(match[2]);
  return urlParams;
};

adminda.util.fn.deepClone = function (sourceObject) {
  return $.extend(true, {}, sourceObject);
};

adminda.util.fn.deepDiff = function (original, modified) {
  var diff = {};
  _.each(original, function (value, key) {
    if (modified[key] === value) return;
    if (_.isObject(value)) {
      childObjDiff = adminda.util.fn.deepDiff(value, modified[key]);
      if (!_.isEmpty(childObjDiff)) diff[key] = childObjDiff;
    } else diff[key] = value;
  });
  return diff;
};

adminda.util.fn.percent = function (value, total, handleZero) {
  if (handleZero) {
    var result = ((value / total) * 100 || 0).toFixed(1);
    if ((result > 0 && result < 1) || (result < 100 && result > 99)) {
      return result;
    }
    return parseInt(result);
  }
  return parseInt((value / total) * 100) || 0;
};

adminda.util.fn.animateNumber = function (elementId, value, duration) {
  var $element = $("#" + elementId);
  if ($element.length == 0) return;
  $({ count: $element.text() })
    .stop(true, false)
    .animate(
      { count: value },
      {
        duration: duration,
        easing: "linear",
        step: function () {
          $element.text(Math.ceil(this.count));
        },
        complete: function () {
          $element.text(value);
        },
      }
    );
};

//src: http://stackoverflow.com/a/2534911
adminda.util.fn.stringFormat = function () {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
};

adminda.util.fn.getSiteUrl = function () {
  return (
    location.protocol +
    "//" +
    location.hostname +
    (location.port ? ":" + location.port : "")
  );
};

adminda.util.fn.addTimezoneOffset = function (isoDateString) {
  //note:depends on moment.js
  return new Date(
    moment.utc(isoDateString).toDate().getTime() +
      new Date().getTimezoneOffset() * 60000
  ).toISOString();
};

adminda.util.fn.track = function (category, action, value) {
  //    console.log('api', "/api/values/update?category=" + category + "&type=" + action + "&value=" + (value | 0));
  $.getJSON(
    "/api/values/update?category=" +
      category +
      "&type=" +
      action +
      "&value=" +
      (value | 0)
  );
};

adminda.const.oneKb = 1024;
adminda.const.oneMb = adminda.const.oneKb * 1024;
adminda.const.oneGb = adminda.const.oneMb * 1024;
adminda.const.oneTb = adminda.const.oneGb * 1024;
adminda.util.fn.formatMemoryUnit = function (bytes, precision) {
  precision |= 0;
  var asTb = (bytes / adminda.const.oneTb).toFixed(precision);
  if (asTb >= 1) return parseFloat(asTb) + " TB";
  var asGb = (bytes / adminda.const.oneGb).toFixed(precision);
  if (asGb >= 1) return parseFloat(asGb) + " GB";
  var asMb = (bytes / adminda.const.oneMb).toFixed(precision);
  if (asMb >= 1) return parseFloat(asMb) + " MB";
  var asKb = (bytes / adminda.const.oneKb).toFixed(precision);
  return parseFloat(asKb) + " KB"; /*if (asKb > 1) return asKb + " KB";
    return bytes + (bytes > 1? " Bytes":" Byte");*/
};

adminda.util.fn.timeDurationChecker = function (duration, date) {
  var today = new Date();
  var thisMonth = today.getMonth();
  var checkDate = new Date(date);
  var monthToCheck = checkDate.getMonth();
  /*if (thisMonth == 1)
        thisMonth = 12 + thisMonth;*/
  if (duration == "LastMonth") {
    if (thisMonth - 1 == monthToCheck) return duration;
    if (thisMonth - 2 == monthToCheck) return "ThisMonth";
  } else if (duration == "ThisMonth")
    if (thisMonth == monthToCheck) return duration;
    else if (monthToCheck < thisMonth) return "NextMonth";
  var weekToCheck = new Date(date).getDate();
  if (duration == "LastWeek") {
    var lastWeek = moment().startOf("isoWeek").add(-7, "d");
    if (
      lastWeek._d.getDate() == weekToCheck &&
      lastWeek._d.getMonth() == monthToCheck
    ) {
      return "LastWeek";
    } else {
      lastWeek = moment().startOf("isoWeek").add(-14, "d");
      if (
        lastWeek._d.getDate() == weekToCheck &&
        lastWeek._d.getMonth() == monthToCheck
      )
        return "ThisWeek";
    }
  } else if (duration == "ThisWeek") {
    var thisWeekDate = moment().startOf("isoWeek")._d.getDate();
    var thisWeekMonth = moment().startOf("isoWeek")._d.getMonth();
    if (thisWeekDate == weekToCheck && thisWeekMonth == monthToCheck)
      return duration;
  } else if (
    duration == "Yesterday" &&
    checkDate.getDate() == today.getDate() - 1
  )
    return duration;
  return duration;
};

adminda.util.fn.trackBrowser = function (category) {
  $.getJSON("/api/values/update?category=" + category + "&type=PageLoaded");
  if (bowser) {
    var namePlusVersion = bowser.name + "-" + bowser.version;
    $.getJSON(
      "/api/values/update?category=Browser-" +
        category +
        "&type=" +
        namePlusVersion +
        "&isUserEvent=true"
    );
  } else {
    $.getJSON(
      "/api/values/update?category=Browser-" +
        category +
        "&type=bowser is not defined" +
        "&isUserEvent=true"
    );
  }
  isRetina = (function () {
    var mediaQuery =
      "(-webkit-min-device-pixel-ratio: 1.5),\
            (min--moz-device-pixel-ratio: 1.5),\
            (-o-min-device-pixel-ratio: 3/2),\
            (min-resolution: 1.5dppx)";
    if (window.devicePixelRatio > 1) return true;
    if (window.matchMedia && window.matchMedia(mediaQuery).matches) return true;
    return false;
  })();
  var isRetinaSettings = isRetina ? "true" : "false";
  $.getJSON(
    "/api/values/update?category=Browser-Retina" +
      "&type=" +
      category +
      "-" +
      isRetinaSettings +
      "&isUserEvent=true"
  );
};

adminda.util.fn.getRandomGuid = function () {
  //src: https://stackoverflow.com/a/105074/6761976
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
};

//below code need to be moved to separate file
function Enum() {
  //var obj = {};
  for (var index in arguments) {
    this[arguments[index]] = index;
  }

  this.privateScope = {};
  this.privateScope.args = arguments;
}
Enum.prototype.Get = function (id) {
  if (id < args.length && id >= 0) return args[id];
  return null;
};

function FlagedEnum() {
  for (var index in arguments) {
    this[arguments[index]] = 1 << index;
  }

  this.privateScope = {};
  this.privateScope.args = arguments;
}
FlagedEnum.prototype.GetMaskByName = function () {
  var maskValue = 0;
  for (var index in arguments) {
    var name = arguments[index];
    if (this.hasOwnProperty(name)) maskValue |= this[name];
  }
  return maskValue;
};
FlagedEnum.prototype.GetMaskById = function () {
  var maskValue = 0;
  for (var index in arguments) {
    var id = arguments[index];
    if (id < args.length && id >= 0) maskValue |= 1 << id;
  }
  return maskValue;
};
