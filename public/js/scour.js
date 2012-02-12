var Scour = function(url, element) {
  var context = new webkitAudioContext();
  var source = context.createBufferSource();

  function loadSound(url, source, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      context.decodeAudioData(
        request.response,
        function (buffer) {
          source.buffer = buffer;
          audioLength = buffer.length; // remember audio length?
          console.log(audioLength);
          callback();
        },
        function (response) { console.log(response); }
      );
    };

    request.send();
  }

  function ready() {
    return source.buffer != undefined;
  }

  function getAudioPos(clientX, element, audioLength) {
    var x = clientX - element.offsetLeft;
    var relativePos = x / element.offsetWidth;
    return audioLength * relativePos;
  }

  function setPos(ev) {
    audioPos = getAudioPos(ev.clientX, element, audioLength);
    console.log(audioPos);
  }

  function activate(element) {
    element.addEventListener('mousedown', function () { scrubbing = true; });
    document.addEventListener('mouseup',  function () { scrubbing = false; });
    element.addEventListener('mousemove', setPos);
  };

  function seek(pos) {

  };

  // -----------------------
  var audioPos = 0;
  var audioLength;
  var scrubbing = false;

  loadSound(url, source, function() {
    activate(element);
  });
  // -----------------------

  return {
    ready: ready,
    seek: seek
  };
};
