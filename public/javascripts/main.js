const DETECTION_THRESHOLD = 50;
let rateLimitNext = Date.now();

class Person {
  constructor(name, details, position) {
    this.name = name;
    this.details = details;

    this.x = position.x;
    this.y = position.y;
  }

  updatePosition(newPosition) {
    this.x = newPosition.x;
    this.y = newPosition.y;
  }

  isSamePerson(newPosition) {
    const newX = newPosition.x;
    const newY = newPosition.y;

    if (Math.abs(newX - this.x) < DETECTION_THRESHOLD && Math.abs(newY - this.y) < DETECTION_THRESHOLD) {
      this.x = newX;
      this.y = newY;
      return true;
    }

    return false;
  }
}

function init() {
  navigator.getUserMedia = navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia;

  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captured = document.getElementById('captured');
  const context = canvas.getContext('2d');
  const tracker = new tracking.ObjectTracker('face');

  let people = {};

  // FOR EMERGENCIES ONLY
  $(document).keyup((e) => {
    if (e.keyCode == 27) {
      people = {};
    }
  });

  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  tracking.track('#video', tracker, { camera: true });
  tracker.on('track', (event) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    let position, imageBase64, person, rect;

    for (let i = 0; i < event.data.length; i++) {
      rect = event.data[i];

      position = { x: rect.x, y: rect.y };
      person = getTrackedPerson(people, position);

      if (person) {
        writeNameOnCanvas(person.name, person.details, context, rect);
      } else {
        imageBase64 = captureImage(video, rect).toDataURL();
        //captured.src = imageBase64;

        getNamePrediction(imageBase64)
          .then((concept) => {
            const name = concept.name;
            const details = concept.details;

            const newPerson = new Person(name, details, position);
            people[name] = newPerson;

            writeNameOnCanvas(name, details, context, rect);
          })
          .catch(console.log);
      }
    }
  });
}

function writeNameOnCanvas(name, details, context, rect) {
  context.font = '20px Helvetica';
  context.fillStyle = '#fff';
  context.fillText(name, rect.x + rect.width / 2, rect.y);

  document.getElementById('personName').value = name;
  document.getElementById('personDetails').value = details;
}

function getTrackedPerson(people, position) {
  let name, person;

  for (name in people) {
    person = people[name];

    if (person.isSamePerson(position)) {
      return person;
    }
  }

  return null;
}

function captureImage(video, rect) {
  const w = rect.width;
  const h = rect.height;

  const canvas = document.createElement('canvas');
  canvas.width  = w;
  canvas.height = h;

  const context = canvas.getContext('2d');
  context.drawImage(video, rect.x, rect.y, rect.width + 150, rect.height + 120, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function getNamePrediction(imageBase64) {
  if (!rateLimitNext || Date.now() < rateLimitNext) {
    return Promise.reject('Skip');
  }

  rateLimitNext = Date.now() + 1000;

  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: '/predict/base64',
      dataType: 'json',
      data: { base64: imageBase64 },
      success: (resp) => {
        const name = resp.name;
        const details = resp.details;

        console.log(`Matched name: ${name} - ${details}`);
        resolve({ name, details });
      },
      error: (xhr, resp) => {
        console.log(`Prediction error: ${resp}`);
        reject(resp);
      }
    });
  });
}

$('#trainNewPerson').on('click', () => {
  window.location.href = "/new";
})

window.onload = init;
