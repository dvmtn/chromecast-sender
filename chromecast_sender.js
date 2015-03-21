(function() {var chrome = window.chrome || {};
 chrome.cast = chrome.cast || {};
 chrome.cast.media = chrome.cast.media || {};
 chrome.cast.ApiBootstrap_ = function() {
 };
 chrome.cast.ApiBootstrap_.EXTENSION_IDS = ["boadgeojelhgndaghljhdicfkmllpafd", "dliochdbjfkdbacpmhlcpmleaejidimm", "hfaagokkkhdbgiakmmlclaapfelnkoah", "fmfcbgogabcbclcofgocippekhfcmgfj", "enhhojjnijigcajfphajepfemndkmdlo"];
 chrome.cast.ApiBootstrap_.findInstalledExtension_ = function(callback) {
   chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_(0, callback);
 };
 chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_ = function(index, callback) {
   index == chrome.cast.ApiBootstrap_.EXTENSION_IDS.length ? callback(null) : chrome.cast.ApiBootstrap_.isExtensionInstalled_(chrome.cast.ApiBootstrap_.EXTENSION_IDS[index], function(installed) {
     installed ? callback(chrome.cast.ApiBootstrap_.EXTENSION_IDS[index]) : chrome.cast.ApiBootstrap_.findInstalledExtensionHelper_(index + 1, callback);
   });
 };
 chrome.cast.ApiBootstrap_.getCastSenderUrl_ = function(extensionId) {
   return "chrome-extension://" + extensionId + "/cast_sender.js";
 };
 chrome.cast.ApiBootstrap_.isExtensionInstalled_ = function(extensionId, callback) {
   var xmlhttp = new XMLHttpRequest;
   xmlhttp.onreadystatechange = function() {
     4 == xmlhttp.readyState && 200 == xmlhttp.status && callback(!0);
   };
   xmlhttp.onerror = function() {
     callback(!1);
   };
   xmlhttp.open("GET", chrome.cast.ApiBootstrap_.getCastSenderUrl_(extensionId), !0);
   xmlhttp.send();
 };
 chrome.cast.ApiBootstrap_.findInstalledExtension_(function(extensionId) {
   if (extensionId) {
     console.log("Found cast extension: " + extensionId);
     chrome.cast.extensionId = extensionId;
     var apiScript = document.createElement("script");
     apiScript.src = chrome.cast.ApiBootstrap_.getCastSenderUrl_(extensionId);
     (document.head || document.documentElement).appendChild(apiScript);
   } else {
     var msg = "No cast extension found";
     console.log(msg);
     var callback = window.__onGCastApiAvailable;
     callback && "function" == typeof callback && callback(!1, msg);
   }
 });
})();

/* This file is included after libraries and before your src code */

var applicationID = '51F2093F';
var namespace = 'urn:x-cast:com.devmountain.helloworld';
var session = null;

window.__onGCastApiAvailable = function(loaded, errorInfo) {
  if (loaded) {
    initializeCastApi();
  } else {
    console.log(errorInfo);
  }
};

function initializeCastApi() {
  var sessionRequest = new chrome.cast.SessionRequest(applicationID);
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                                            sessionListener,
                                            receiverListener);

  chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function onInitSuccess() {
  appendMessage("onInitSuccess");
}

function onError(message) {
  appendMessage("onError: "+JSON.stringify(message));
}

function onSuccess(message) {
  appendMessage("onSuccess: "+message);
}

function onStopAppSuccess() {
  appendMessage('onStopAppSuccess');
}

function sessionListener(e) {
  appendMessage('New session ID:' + e.sessionId);
  session = e;
  session.addUpdateListener(sessionUpdateListener);
  session.addMessageListener(namespace, receiverMessage);
}

function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  message += ': ' + session.sessionId;
  appendMessage(message);
  if (!isAlive) {
    session = null;
  }
}

function receiverMessage(namespace, message) {
  appendMessage("receiverMessage: "+namespace+", "+message);
}

function receiverListener(e) {
  if( e === 'available' ) {
    appendMessage("receiver found");
  }
  else {
    console.log(e);
    appendMessage("receiver list empty");
  }
}

function stopApp() {
  session.stop(onStopAppSuccess, onError);
}

function sendMessage(message) {
  if (session !== null) {
    session.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
  }
  else {
    chrome.cast.requestSession(function(e) {
      session = e;
      session.sendMessage(namespace, message, onSuccess.bind(this, "Message sent: " + message), onError);
    }, onError);
  }
}

function appendMessage(message) {
  var dw = document.getElementById("debugmessage");
  dw.innerHTML += '\n' + JSON.stringify(message);
}

function update() {
  sendMessage(document.getElementById("input").value);
}

function transcribe(words) {
  sendMessage(words);
}
window.addEventListener('load', function(){
  window.addEventListener('keydown', function(event){
    switch (event.which) {

      case 37:
        sendMessage('left');
        break;

      case 38:
        sendMessage('up');
        break;

      case 39:
        sendMessage('right');
        break;

      case 40:
        sendMessage('down');
        break;

    }
  });
});

/* This file is included after your src code */
