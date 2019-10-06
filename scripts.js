'https://cdn.jsdelivr.net/gh/p5js/PitchDetection/PitchDetection_Game/model'

function setup() {
  const tuner = new Tuner();
  tuner.init();
}

class Tuner {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.audioContext = new AudioContext();
    this.amplitude = new p5.Amplitude();
    // this.osc = new p5.Oscillator();
    this.mic = new p5.AudioIn();

    this.pitch;
    this.model_url = "../crepe/";
    // this.model_url = "https://cdn.jsdelivr.net/gh/p5js/PitchDetection/PitchDetection_Game/model";
    this.currentFrequency;
    this.currentFrequencyBase;
    this.currentNote = "";
    this.level;
    this.scale = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B"
    ];
    this.needlePosition = 0;
    this.needleSpeed = 5;
  }

  init = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(mediaStream => {
      this.pitch = ml5.pitchDetection(
        this.model_url,
        this.audioContext,
        mediaStream,
        this.modelLoaded
      );
    });

    // this.osc.setType("sine");
    // this.osc.amp(0);
    // this.osc.start();
    this.mic.start();

    this.drawTuner();
  };

  modelLoaded = () => {
    this.getPitch();
    this.getLevel();
  };

  getPitch = () => {
    this.pitch.getPitch((err, frequency) => {
      this.currentFrequency = frequency;
      if (frequency) {
        let midiNum = freqToMidi(frequency);
        this.currentFrequencyBase = midiToFreq(midiNum);

        this.currentNote = this.scale[midiNum % 12];
        this.currentFrequency = frequency;
      }
      this.getPitch();
    });
  };

  getLevel = () => {
    var level = this.mic.getLevel();
    this.level = map(level, 0, 1, 0, 200);
    window.requestAnimationFrame(this.getLevel);
  };

  drawTuner = () => {
    window.requestAnimationFrame(this.drawTuner);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let diff = this.currentFrequencyBase - this.currentFrequency;

    this.ctx.font = "50px Open Sans";
    this.ctx.textAlign = "center";

    if (diff < -1.5 || diff > 1.5) {
      this.ctx.fillStyle = "RED";
    } else {
      this.ctx.fillStyle = "GREEN";
    }

    this.ctx.fillText(
      this.currentNote,
      this.canvas.width / 2,
      this.canvas.height * 0.9
    );

    this.ctx.beginPath();
    this.ctx.lineTo(this.canvas.width / 2, 0);
    this.ctx.lineTo(this.canvas.width / 2, 50);
    this.ctx.stroke();

    this.ctx.moveTo(this.canvas.width / 2, this.canvas.height * 0.75);
    this.ctx.beginPath();
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height * 0.75);

    this.needlePosition = this.canvas.width / 2 - diff * 45;
    this.ctx.fillStyle = "rgba(10, 200, 10, 0.3)";
    this.ctx.fillRect(
      0,
      this.canvas.height - this.canvas.height * (this.level / 100),
      this.canvas.width,
      this.canvas.height * (this.level / 100)
    );
    this.ctx.fillStyle = "BLACK";

    if (this.currentNote) {
      if (this.currentFrequency) {
        // this.osc.freq(this.currentFrequencyBase);
        // if (this.level > 5) {
        // this.osc.amp(0.7, 0.5);
        // }
        this.ctx.font = "16px Open Sans";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          Math.round(this.currentFrequencyBase) + "hz",
          this.canvas.width / 2,
          this.canvas.height * 0.97
        );

        this.ctx.lineTo(this.needlePosition, 0);
        // ...
        this.ctx.fillStyle = "BLACK";
        this.ctx.font = "16px Open Sans";
        this.ctx.textAlign = "center";
        this.ctx.fillText(
          -Math.floor(this.currentFrequencyBase - this.currentFrequency),
          this.canvas.width / 2,
          this.canvas.height * 0.8
        );
      } else {
        // this.osc.amp(0, 0.5);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height * 0.5);
      }

      this.ctx.fillStyle = "RED";
      this.ctx.fillRect(
        this.currentFrequencyBase,
        this.canvas.height - 3,
        1,
        3
      );

      this.ctx.stroke();
    }
  };
}
