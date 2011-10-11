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

  it("should return false on isReady when the audio element has no source",function() {
    var audio = new jslash.Audio();
    expect(audio.isReady()).toBeFalsy();
  });

  it("should be able to play a loaded source when the audio is ready",function() {
    var audio = new jslash.Audio();
    if (navigator.userAgent.indexOf("MSIE") < 0) {
      audio.load("audio/test.ogg");
    }
    else {
      audio.load("audio/clang.wav");
    }
    waitsFor(function() { return audio.isReady(); });
    runs(function() {
      spyOn(audio._audio,'play');
      audio.play();
      expect(audio._audio.play).toHaveBeenCalled();
    });
  });

  it("should stop the audio object when stop is called",function() {
    var fakeDomAudio = { pause : function(){}, currentTime: 100 };
    var audio = new jslash.Audio();
    audio._audio = fakeDomAudio;
    spyOn(fakeDomAudio,'pause');
    audio.stop();
    expect(fakeDomAudio.pause).toHaveBeenCalled();
    expect(fakeDomAudio.currentTime).toEqual(0);
  });

  it("isPlaying method should return the paused HTMLAudioElement property negated",function() {
    var fakeDomAudio = { paused : true };
    var audio = new jslash.Audio();
    audio._audio = fakeDomAudio;
    expect(audio.isPlaying()).toBeFalsy();
  });


  it("isPlaying method should return the paused HTMLAudioElement property negated 2",function() {
    var fakeDomAudio = { paused : false };
    var audio = new jslash.Audio();
    audio._audio = fakeDomAudio;
    expect(audio.isPlaying()).toBeTruthy();
  });

  it("should call the pause dom element method when its pause method is called",function() {
    var fakeDomAudio = { pause: function() {} };
    var audio =  new jslash.Audio();
    audio._audio = fakeDomAudio;
    spyOn(fakeDomAudio,'pause');
    audio.pause();
    expect(fakeDomAudio.pause).toHaveBeenCalled();
  });

  it("should not change the currentTime value when the object is paused",function() {
    var fakeDomAudio = { pause: function() {} , currentTime: 100};
    var audio =  new jslash.Audio();
    audio._audio = fakeDomAudio;
    audio.pause();
    expect(fakeDomAudio.currentTime).toEqual(100);
  });

  it("should be able to change the volume of the audio element",function() {
    var fake = { volume: 1 };
    var audio =  new jslash.Audio();
    audio._audio = fake;
    audio.volume(0.4);
    expect(fake.volume).toEqual(0.4);
  });

});
