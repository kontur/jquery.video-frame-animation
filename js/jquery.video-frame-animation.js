/**
 *
 * jquery.video-frame-animation.js
 * ===============================
 * jQuery plugin for animating a video frame sequence based on scroll position
 *
 *
 * Copyright 2013 Johannes "kontur" Neumeier
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * @author Johannes "kontur" Neumeier
 * @version 0.0.1
 *
 * 
 * TODO's / Feature wish list
 * - limited img elements in the DOM, buffering only x frames ahead
 *   (currently the plugin just creates a <img> element for every frame
 *   supplied)
 * - decoupling from window scroll event -> implementing custom function
 *   listener that can define the 0-100% frames animation range in any
 *   way
 * - methods for playing the animation (back and forth) programmatically
 * - proper preloading / forced or dynamic preloading switch
 * - smoother transition to high resolution images
 * - implement events for: preloading, scrolling, scrolling finished, 
 *   high resolution image loaded, etc.
 * - dynamic prefetching of high resolution images when low resolution
 *   images are all loaded
 *
 * Fractal demo video clip from archive.org:
 * http://ia600401.us.archive.org/14/items/fractalswithsound/102304.mpeg
 *
 */
(function ($) {

	// variable settings object generated from defaults and
	// user supplied init object
	var settings = {};

	var defaults = {
		'imgFormat'		 : '.jpg',
		'upgradeHighRes' : false,
		'imgDirBig' 	 : '',
		'requestAnimationFramePolyfill' : true
	};

	// some required init object attributes
	var required = [
		'numImages', 
		'imgDir', 
		'imgName'
	];


	// internal
	var currentImg 	   = 1,
		imgStrLen 	   = 1,
	    animating      = false,
	    lastCurrentImg = 1,
	    $this 		   = {},
	    checkForScrollAfter = 250,
	    checkForScrollTimeout = {};


	/**
	 * setup the plugin on the supplied selectors
	 */
	var init = function (options) {

		console.log('Anim.init()');
		console.log(options);

		$this = $(this);

		// confirm init setup:

		// confirm that there is init options
		if (typeof options !== 'object') {
			throw('frameAnimation: Required settings not supplied');
		}

		// confirm that all required init options are supplied
		$.each(required, function (i) {
			if (!options[required[i]]) {
				throw('frameAnimation: Required setting ' + required[i] + ' not supplied');
			}
		});

		if (options['upgradeHighRes'] === true && !options['imgDirBig']) {
			throw('frameAnimation: Setting upgradeHighRes set to true, but no imgDirBig supplied');
		}


		// combine settings and overwrite defaults where supplied
		settings = $.extend(defaults, options);

		if (settings.requestAnimationFramePolyfill) {
			injectRequestAnimationFolyfill();
		}

		imgStrLen = String(settings.numImages).length;


		// setup animation:

		// append frames as img objects
		for (i = 1; i <= settings.numImages; i++) {
			$this.append('<img src="' + settings.imgDir + settings.imgName + 
				numWithLeadingZeros(i) + settings.imgFormat +'" data-frame="' + i + 
				'" style="display: none;" />');
		}

		// show current frame
		currentImg = calculateCurrent();
		showFrame(currentImg);
		upgradeFrame(currentImg);

		$(window).on('scroll', scroll);

		// return this object to maintain chainability
		return this.each(function () { return $(this); });

	}


	var scroll = function () {
		if (!animating) {
			animating = true;
			lastCurrentImg = currentImg;
			animate();
		}
		clearTimeout(checkForScrollTimeout);
		checkForScrollTimeout = setTimeout(checkForScroll, checkForScrollAfter);
	}


	var checkForScroll = function () {
		if (lastCurrentImg == currentImg) {
			animating = false;
		} 
		if (settings.upgradeHighRes) {
			upgradeFrame(currentImg);
		}
	}


	/**
	 * calculate current image based on document scroll position
	 *
	 * @return int: current frame number based on scroll position
	 */
	var calculateCurrent = function () {
		currentPercent = $(document).scrollTop() / ($(document).height() - $(window).height());
		return Math.max(1, Math.ceil(settings.numImages * currentPercent));
	}


	/**
	 * helper function to generate a string of the current image
	 * number with leading zeros 
	 */
	var numWithLeadingZeros = function (num) {
		var numStr = String(num);
		while (numStr.length < imgStrLen) {
			numStr = '0' + numStr;
		}
		return numStr;
	}


	/**
	 * start and run the animation loop as long as the 
	 * "animating" flag stays true 
	 */
	var animate = function () {
		if (animating) {
			// only update the currently visible frame if it changed
			var cur = calculateCurrent();
			if (cur != currentImg) {
				currentImg = cur;
				showFrame(currentImg);
				
			}
			requestAnimationFrame(animate);
		}
	}


	/**
	 * show the image containing the supplied frame
	 */
	var showFrame = function (frame) {
		$this.children().hide();
		$this.children('img[data-frame="' + frame + '"]').show();
	}


	/**
	 * upgrade the current frame's image to a higher resolution version
	 */
	var upgradeFrame = function (frame) {
		$frame = $this.children('img[data-frame="' + frame + '"]');
		if ($frame.data('upgraded') != '1') {
			$frame
				.attr('src', settings.imgDirBig + settings.imgName + 
					numWithLeadingZeros(frame) + settings.imgFormat)
				.data('upgraded', '1');
		}
	}


	/**
	 * helper function that polyfills and unifies the "requestAnimationFrame" 
	 * function for older or inconsistent implementations
	 */
	var injectRequestAnimationFolyfill = function () {

		// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
		// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

		// requestAnimationFrame polyfill by Erik Möller
		// fixes from Paul Irish and Tino Zijdel

		(function() {
		    var lastTime = 0;
		    var vendors = ['ms', 'moz', 'webkit', 'o'];
		    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
		                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
		    }
		 
		    if (!window.requestAnimationFrame)
		        window.requestAnimationFrame = function(callback, element) {
		            var currTime = new Date().getTime();
		            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
		            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
		              timeToCall);
		            lastTime = currTime + timeToCall;
		            return id;
		        };
		 
		    if (!window.cancelAnimationFrame)
		        window.cancelAnimationFrame = function(id) {
		            clearTimeout(id);
		        };
		}());

		// end polyfill code

	}


	/**
	 * publicly exposed methods
	 */
	var methods = {
		showFrame: showFrame,
		upgradeFrame: upgradeFrame
	};


	/**
	 * define the jquery plugin and delegate calls to it
	 */
	$.fn.videoFrameAnimation = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist in this plugin');
		}
	};

})(jQuery);