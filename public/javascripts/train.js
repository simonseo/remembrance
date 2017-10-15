let nextTimeToCapture;
let numCaptured = 0;
const maxCaptures = 7;

let conceptName;
let conceptDetails;

const btnBack = document.getElementById('btnBack');
const btnCapture = document.getElementById('trainBtn');

$(btnBack).on('click', () => {
  window.location.href = "../";
});

$(btnCapture).on('click', () => {
  conceptName = document.getElementById('personName').value;
  conceptDetails = document.getElementById('personDetails').value;

  $('#infoModal').modal('hide');

  nextTimeToCapture = Date.now();
});

function init() {
  $('#infoModal').modal('show');
  $('#personName').focus();

  navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captured = document.getElementById('captured');
  const context = canvas.getContext('2d');
  const tracker = new tracking.ObjectTracker('face');

  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracking.track('#video', tracker, { camera: true });
  tracker.on('track', (event) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!nextTimeToCapture) {
      return;
    }

    const rect = event.data[0];

    if (!rect || !rect.x || !rect.y) { return; }

    writeNameOnCanvas(conceptName, context, rect);

    if (numCaptured > maxCaptures) {
      nextTimeToCapture = null;
      numCaptured = 0;
      document.getElementById('status').innerHTML = `${conceptName} successfully remembered!`;
    } else if (Date.now() >= nextTimeToCapture) {
      imageBase64 = captureImage(video, rect).toDataURL();
      captured.src = imageBase64;

      trainConcept(conceptName, conceptDetails, imageBase64, numCaptured);
      document.getElementById('status').innerHTML = `${numCaptured}/${maxCaptures} images trained...`;

      numCaptured++;
      nextTimeToCapture = Date.now() + 1500;
    }
  });
}

function trainConcept(name, details, imageBase64, num) {
  $.ajax({
    type: 'POST',
    url: `/train/base64/${name}`,
    dataType: 'json',
    data: { base64: imageBase64, details },
    success: () => {
      console.log(`Trained image ${num} for ${name}`);
    },
    error: (xhr) => {
      console.log(`Prediction error: ${xhr}`);
    },
  });
}

function writeNameOnCanvas(name, context, rect) {
  context.font = '20px Helvetica';
  context.fillStyle = '#fff';
  context.fillText(name, rect.x + rect.width / 2, rect.y);
}

function captureImage(video, rect) {
  flash();

  const w = rect.width;
  const h = rect.height;

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;

  const context = canvas.getContext('2d');
  context.drawImage(video, rect.x, rect.y, rect.width + 150, rect.height + 120, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function flash() {
  $('body').toggleClass('innerBorder');
  setTimeout(() => {
    $('body').toggleClass('innerBorder');
  }, 50);
}

window.onload = init;
