if (typeof office365 == "undefined") office365 = {};
office365.util = {};
office365.util.fn = {};
office365.directoryReadRequestURL =
  "office365/authorize/requestUrl/directoryRead";
office365.directoryWriteRequestURL = "office365/authorize/requestUrl/dirWrite";
office365.mailSendRequestURL = "office365/authorize/requestUrl/mailSend";
office365.firstApp = office365.directoryWriteRequestURL;

office365.util.fn.getAuthorization = function (returnUrl, reqObj) {
  /*    returnUrl = window.location.origin+"/{hash}/1/{tenantId}/dashboards/overall";
    reqObj = { advancedReporting: true };*/
  var requestUrl = office365.firstApp;
  if (returnUrl != undefined) requestUrl += "?returnUrl=" + returnUrl;
  else requestUrl += "?returnUrl=";
  if (reqObj != undefined) requestUrl += "&obj=" + JSON.stringify(reqObj);
  $.get(requestUrl, function (url) {
    //ToDo: preFetch url
    console.log(url);
    window.location = url;
  });
};

office365.util.fn.getAuthorizationForMailSend = function () {
  $.get(office365.mailSendRequestURL, function (url) {
    //ToDo: preFetch url
    console.log(url);
    window.location = url;
  });
};

office365.util.fn.getAuthorizationForMgmtData = function () {
  var redirectUrl =
    adminda.util.fn.getSiteUrl() + "/dashboard.html?src=mgmtdata";
  var param = $.param({ returnUrl: redirectUrl });
  $.get("office365/authorize/requestUrl/mgmtData?" + param, function (url) {
    //ToDo: preFetch url
    console.log(url);
    window.location = url;
  });
};

office365.util.fn.getAuthorizationForDirWrite = function (redirectUrl) {
  if (redirectUrl == undefined)
    redirectUrl = "/#/exchange/dashboards/mailboxconnections";
  //redirectUrl = adminda.util.fn.getSiteUrl() + "/#/exchange/dashboards/mailboxconnections";
  var param = $.param({ returnUrl: redirectUrl });
  $.get(office365.directoryWriteRequestURL + "?" + param, function (url) {
    //ToDo: preFetch url
    console.log(url);
    window.location = url;
  });
};

office365.util.fn.getAuditData = function () {
  $.getJSON(
    "/office365/admincenter/auditStats?tenantId=1&type=1&datePeriod=4",
    function (data) {
      console.log(data);
      var top = {};
      var i, item, prev;
      for (i = 0; i < data.top.length; i++) {
        item = data.top[i];
        if (top[item[0]] == undefined) top[item[0]] = [];
        //var name = auditEvents_byId[item[1]].friendlyName;
        var name = item[1];
        top[item[0]].push([name, item[2], { id: item[1] }]);
      }
      console.log("top", top);
      var trend = {};
      for (i = 0; i < data.trend.length; i++) {
        item = data.trend[i];
        if (trend[item[0]] == undefined) {
          trend[item[0]] = { count: 0, items: { x: [], y: [] } };
          if (data.duration[0] == item[1]) prev = null;
          else {
            prev = data.duration[0];
            trend[item[0]].items.x.push(data.duration[0]);
            trend[item[0]].items.y.push(0);
          }
        }
        trend[item[0]].count += item[2];
        console.log("x", prev);
        if (prev != null) {
          var prevDate = moment(prev).add(1, "days").toDate();
          var currentDate = moment(item[1]).toDate();
          console.log(
            prev,
            prevDate,
            currentDate,
            prevDate.getTime() != currentDate.getTime()
          );
          var j = 1;
          while (prevDate.getTime() != currentDate.getTime()) {
            prevDate = moment.utc(prev).add(j, "days").toDate().toISOString();
            j++;
            trend[item[0]].items.x.push(prevDate);
            trend[item[0]].items.y.push(0);
            console.log(prev, prevDate, currentDate, j);
            prevDate = moment(prev).add(j, "days").toDate();
            console.log(prev, prevDate, currentDate, j);
          }
        }
        trend[item[0]].items.x.push(item[1]);
        trend[item[0]].items.y.push(item[2]);
        prev = item[1];
      }
      console.log("trend", trend);
    }
  );
};

var dateFiller = function (prevDate, currentDate, trend) {};
