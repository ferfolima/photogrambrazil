function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

var    keys = [];
window.executeHotkeyTest = function(callback,keyValues){
    if(typeof callback !== "function")
        throw new TypeError("Expected callback as first argument");
    if(typeof keyValues !== "object" && (!Array.isArray || Array.isArray(keyValues)))
        throw new TypeError("Expected array as second argument");
    
    var allKeysValid = true;
    
    for(var i = 0; i < keyValues.length; ++i)
        allKeysValid = allKeysValid && keys[keyValues[i]];

    if(allKeysValid)
        callback();
};

window.addGlobalHotkey = function(callback,keyValues){
    if(typeof keyValues === "number")
        keyValues = [keyValues];
    
    var fnc = function(cb,val){
        return function(e){
            keys[e.keyCode] = true;
            executeHotkeyTest(cb,val);
        };        
    }(callback,keyValues);
    window.addEventListener('keydown',fnc);
    return fnc;
};

window.addEventListener('keyup',function(e){
    keys[e.keyCode] = false;
});

addGlobalHotkey(function(){
    toggleFullScreen();
},[13,17]);