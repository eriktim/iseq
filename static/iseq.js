(function() {

  var imageWidth = 2592;
  var imageHeight = 1944;
  var refPoints = [[1988, 509], [79, 766], [1206, 1778]];
  var detailWidth;
  var detailHeight;
  var detailZoom = 2;
  var detail = document.getElementById('detail');
  var currentWidth;
  var currentHeight;
  var currentTop;
  var current = document.getElementById('current');
  var x = 0.5;
  var y = 0.5;
  var ratio;
  var frameWidth;
  var frameHeight;
  var frame = document.getElementById('frame');

  var getSizes = function() {
    detailWidth = detail.offsetWidth;
    detailHeight = detail.offsetHeight;

    currentWidth = current.offsetWidth;
    currentHeight = current.offsetHeight;
    currentTop = current.offsetTop;

    var ratioX = currentWidth / (detailZoom * imageWidth);
    var ratioY = currentHeight / (detailZoom * imageHeight);
    var ratio = Math.min(ratioX, ratioY);
    frameWidth = detailWidth * ratio;
    frameHeight = detailHeight * ratio;

    setFrame();
  };

  var updateDetail = function() {
    detail.style.backgroundSize = (detailZoom * imageWidth) + 'px ' +
        (detailZoom * imageHeight) + 'px';
    detail.style.backgroundPositionX =
        -(detailZoom * imageWidth - detailWidth) * x + 'px';
    detail.style.backgroundPositionY =
        -(detailZoom * imageHeight - detailHeight) * y + 'px';
  };

  var setFrame = function(newX, newY) {
    x = newX || x;
    y = newY || y;
    frame.style.width = frameWidth + 'px';
    frame.style.height = frameHeight + 'px';
    frame.style.left = (x * currentWidth - frameWidth / 2) + 'px';
    frame.style.top = (currentTop + y * currentHeight - frameHeight / 2) + 'px';
    updateDetail();

    refPoints.forEach(function(point) {
    });
  };

  var createSequence = function(sequence) {
    var container = document.querySelector('.sequence');
    for (var i = 1, ii = sequence.length; i < ii; i++) {
      var frame = sequence[i];
      var img = document.createElement('img');
      img.src = frame.file;
      img.onclick = function() {
        selectFrame(frame);
      };
      if (frame.points.length == 3 && frame.refPoints.length == 3) {
        img.className = 'done';
      }
      container.appendChild(img);
    }
  };

  var selectFrame = function(frame, index) {
    var selectedImg = document.querySelector('.sequence img.active');
    if (selectedImg) {
      selectedImg.className = selectedImg.className.replace(' active', '');
    }
    var current = document.querySelector('.img_current');
    var reference = document.querySelector('.img_reference');
    var detail = document.querySelector('.img_detail');
    current.style.backgroundImage = 'url("' + frame.file + '")';
    reference.style.backgroundImage = 'url("' + frame.ref + '")';
    detail.style.backgroundImage = 'url("' + frame.file + '")';
    var img = document.querySelector(
        '.sequence img:nth-of-type(' + index + ')');
    img.className = (img.className || '') + ' active';
  };

  fetch(document.location.href + '/seq')
    .then(function(res) {
      if (!res.ok) {
        throw new Error('failed fetching configuration');
      }
      if (res.headers.get('content-type').indexOf('application/json') != 0) {
        throw new Error('configuration is not JSON');
      }
      return res.json();
    })
    .then(function(config) {
      var sequence = config.sequence;
      createSequence(sequence);
      getSizes();
      window.addEventListener('resize', getSizes);
      var index;
      for (var i = 1, ii = sequence.length; i < ii; i++) {
        var frame = sequence[i];
        if (frame.points.length < 3 || frame.refPoints.length < 3) {
          index = i;
          selectFrame(frame, i);
          break;
        }
      }
      window.onkeydown = function(event) {
        if (event.keyCode == 37) {
          index--;
          if (index < 0) {
            index = 0;
          }
        } else if (event.keyCode == 39) {
          index++;
          if (index >= sequence.length) {
            index = sequence.length - 1;
          }
        }
        selectFrame(sequence[index], index);
      };
    })
    .catch(function(reason) {
      console.error(reason);
    });

})();
