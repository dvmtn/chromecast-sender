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
