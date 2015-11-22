(function() {

  var index;
  var imageWidth = 2592;
  var imageHeight = 1944;
  var pointToReference = function() {};
  var pointToCurrent = function() {};
  var pointToDetail = function() {};
  var currentToDetail = function() {};
  var referenceToDetail = function() {};
  var detailToPoint = function() {};
  var detailZoom = 2;

  var setConversionFunctions = function() {
    var detail = document.getElementById('detail');
    var detailWidth = detail.offsetWidth;
    var detailHeight = detail.offsetHeight;

    var current = document.getElementById('current');
    var currentWidth = current.offsetWidth;
    var currentHeight = current.offsetHeight;
    var currentTop = current.offsetTop;

    var frame = document.getElementById('frame');
    var ratioX = currentWidth / (detailZoom * imageWidth);
    var ratioY = currentHeight / (detailZoom * imageHeight);
    var ratio = Math.min(ratioX, ratioY);

    var frameWidth = detailWidth * ratio;
    var frameHeight = detailHeight * ratio;

    var r = ratio * detailZoom;
    var offsetX = (currentWidth - imageWidth * r) / 2;
    var offsetY = (currentHeight - imageHeight * r) / 2;
    pointToReference = function(point) {
      return [point[0] * r + offsetX, point[1] * r + offsetY];
    };

    pointToCurrent = function(point) {
      return [point[0] * r + offsetX, currentTop + point[1] * r + offsetY];
    };

    //setFrame();
  };

  /*var updateDetail = function() {
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
  };*/

  var createSequence = function(sequence) {
    var container = document.querySelector('.sequence');
    for (var i = 1, ii = sequence.length; i < ii; i++) {
      var frame = sequence[i];
      var img = document.createElement('img');
      img.src = frame.file;
      var createClickHandler = function(i) {
        return function() {
          index = i;
          selectFrame(sequence[i]);
        };
      };
      img.onclick = createClickHandler(i);
      if (frame.points.length == 3 && frame.refPoints.length == 3) {
        img.className = 'done';
      }
      container.appendChild(img);
    }
  };

  var selectFrame = function(frame) {
    // set sequence
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

    // set reference
    var refPointDivs = document.querySelectorAll('.img_reference .point');
    (frame.refPoints || []).forEach(function(point, i) {
      if (point[0] > 0 && point[1] > 0) {
        var div = refPointDivs[i];
        var p = pointToReference(point);
        div.style.left = p[0] + 'px';
        div.style.top = p[1] + 'px';
      }
    });

    // set current
    var pointDivs = document.querySelectorAll('.img_current .point');
    (frame.points || []).forEach(function(point, i) {
      if (point[0] > 0 && point[1] > 0) {
        var div = pointDivs[i];
        var p = pointToCurrent(point);
        div.style.left = p[0] + 'px';
        div.style.top = p[1] + 'px';
      }
    });
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
      setConversionFunctions();
      window.addEventListener('resize', setConversionFunctions);
      for (var i = 1, ii = sequence.length; i < ii; i++) {
        var frame = sequence[i];
        if (frame.points.length < 3 || frame.refPoints.length < 3) {
          index = i;
          selectFrame(frame);
          break;
        }
      }
      window.onkeydown = function(event) {
        if (event.keyCode == 37) {
          index--;
          if (index < 1) {
            index = 1;
          }
        } else if (event.keyCode == 39) {
          index++;
          if (index >= sequence.length) {
            index = sequence.length - 1;
          }
        }
        selectFrame(sequence[index]);
      };
    })
    .catch(function(reason) {
      console.error(reason);
    });

})();
