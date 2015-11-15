(function() {

	var image_width = 2592;
	var image_height = 1944;
    var ref_points = [[1988, 509], [79, 766], [1206, 1778]];
	var detail_width, detail_height;
	var detail_zoom = 2;
	var detail = document.getElementById('detail');
	var current_width, current_height, current_top;
	var current = document.getElementById('current');
	var x = 0.5, y = 0.5, ratio;
	var frame_width, frame_height;
	var frame = document.getElementById('frame');

	var getSizes = function() {
		detail_width = detail.offsetWidth;
		detail_height = detail.offsetHeight;

		current_width = current.offsetWidth;
		current_height = current.offsetHeight;
		current_top = current.offsetTop;
		
		var ratio_x = current_width / (detail_zoom * image_width);
		var ratio_y = current_height / (detail_zoom * image_height);
		var ratio = Math.min(ratio_x, ratio_y);
		frame_width = detail_width * ratio;
		frame_height = detail_height * ratio;

		setFrame();
	};
	
	var updateDetail = function() {
		detail.style.backgroundSize = (detail_zoom * image_width) + 'px ' +  (detail_zoom * image_height) + 'px';
		detail.style.backgroundPositionX = -(detail_zoom * image_width - detail_width) * x + 'px';
		detail.style.backgroundPositionY = -(detail_zoom * image_height - detail_height) * y + 'px';
	};
	
	var setFrame = function(newX, newY) {
		x = newX || x;
		y = newY || y;
		frame.style.width = frame_width + 'px';
		frame.style.height = frame_height + 'px';
		frame.style.left = (x * current_width - frame_width / 2) + 'px';
		frame.style.top = (current_top + y * current_height - frame_height / 2) + 'px';
		updateDetail();

        ref_points.forEach(function(point) {
            
        });
	};
	
	getSizes();
	window.addEventListener('resize', getSizes);

})();
