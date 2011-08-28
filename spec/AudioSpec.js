require('jslash');

describe('Audio',function() {
  it("should be able to wrap an audio element",function() {
    var audio =  new jslash.Audio('audio');
    expect(audio._audio).toBeDefined();
  });

  it("should be able to load a resource on the HTMLAudioElement",function() {
    var audio = new jslash.Audio('audio');
    audio.load('somesong.ogg');
    expect(audio._audio.src.indexOf('somesong.ogg')).toBeGreaterThan(-1);
  });

  it("should create a new audio element if the constructor argument is not provided",function() {
    var audios = document.getElementsByTagName('audio').length;
    var audio = new jslash.Audio();
    var currents = document.getElementsByTagName('audio').length;
    expect(currents-audios).toEqual(1);
  });

  //TODO: play,pause,resume,stop,isPlaying, load - isReady interaction
});
