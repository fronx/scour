var Scour = function (url, element) {
  function loadSound (url, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      context.decodeAudioData(
        request.response,
        callback,
        function (response) { console.log(response); }
      );
    };
    request.send();
  }

  function ready () {
    return track.source.buffer != undefined;
  }

  function activate (element) {
    element.addEventListener('mousedown', startScrub);
    document.addEventListener('mouseup', stopScrub);
    element.addEventListener('mousemove', function (ev) {
      if (scrubbing == true) {
        scrub(track, takeTime(ev));
      };
    });
    element.classList.add('scour');
  }

  function startScrub (ev) {
    scrubbing = true;
    seek(track, posToSec(relativePos(ev)), true);
    element.classList.add("scour-scrubbing");
  }

  function stopScrub (ev) { // track, element
    scrubbing = false;
    seek(track, posToSec(relativePos(ev)), playing);
    element.classList.remove("scour-scrubbing");
  }

  function seek (track, targetPos, doPlay) {
    stop(track);
    initSource(track);
    track.timedPos = createTimedPos(targetPos);
    if (doPlay == true) {
      playing = true;
      resetPlaybackRate(track);
      track.source.noteGrainOn(0, targetPos, track.duration - targetPos);
    }
  }

  function play (track) {
    seek(track, 0, true);
  }

  function stop (track) {
    playing = false;
    track.source.noteOff(0);
    resetPlaybackRate(track);
  }

  function resetPlaybackRate (track) {
    return track.source.playbackRate.exponentialRampToValueAtTime(1.0, context.currentTime + 0.3);
  }

  function getPlaybackRate(timedPosA, timedPosB) {
    var r = (timedPosB.pos - timedPosA.pos) / (timedPosB.takenAt - timedPosA.takenAt);
    // console.log('playback rate: ' + r);
    return r;
  }

  function scrub (track, targetTimedPos) {
    var speedUp = getPlaybackRate(track.timedPos, targetTimedPos);
    window.clearTimeout(scrubTimeout);
    // console.log('playing again @ ' + track.timedPos.pos);
    if (speedUp <= 0) {
      seek(track, targetTimedPos.pos, true);
    } else {
      if (playing == false) {
        seek(track, targetTimedPos.pos, true);
      }
      track.source.playbackRate.exponentialRampToValueAtTime(speedUp, context.currentTime + 0.1 / speedUp);
      // console.log('takenAt diff: ' + (targetTimedPos.takenAt - track.timedPos.takenAt));
      scrubTimeout = window.setTimeout(function () {
        track.timedPos = targetTimedPos;
        stop(track);
      }, 1000 * (targetTimedPos.takenAt - track.timedPos.takenAt));
    };
  }

  function initSource (track) {
    track.source = context.createBufferSource();
    track.source.buffer = track.buffer;
    track.source.connect(context.destination);
  }

  function createTrack (url, onLoad) {
    var track = {};
    loadSound(url, function (buffer) {
      track.buffer = buffer;
      track.length = buffer.length;
      track.duration = buffer.duration;
      track.timedPos = createTimedPos(0);
      initSource(track);
      onLoad(track);
    });
    // track.source.onaudioprocess = function (ev) {
    //   track.pos = ev.playbackTime;
    //   console.log("onaudioprocess: " + ev.playbackTime);
    // };
    return track;
  }

  function createTimedPos (pos) {
    return { pos: pos, takenAt: context.currentTime };
  }

  function posToSec (relativePos) {
    return relativePos * track.duration;
  }

  function relativePos(ev) {
    return (ev.clientX - element.offsetLeft) / element.offsetWidth;
  }

  function takeTime (ev) { // element, track
    return createTimedPos(
      posToSec(relativePos(ev))
    );
  }

// -----------------------
  var context = new webkitAudioContext();
  var playing = false;
  var scrubbing = false;
  var scrubTimeout;
  var track = createTrack(url, function (track) {
    activate(element);
  });
// -----------------------

  return {
    ready: ready
  , play: function () { play(track); }
  , stop: function () { stop(track); }
  , seek: function (pos) { seek(track, pos, true); }
  , track : track
  };
};
