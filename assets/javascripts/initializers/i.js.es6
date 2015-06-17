import {decorateCooked} from 'discourse/lib/plugin-api';
import loadScript from 'discourse/lib/load-script';
import ClickTrack from 'discourse/lib/click-track';
/*
 * @param {String} url
 * @returns {String}
 */
var baseName = function(url) {
	/** @type {String} */
	var result = new String(url).substring(url.lastIndexOf('/') + 1);
	if (result.lastIndexOf(".") != -1) {
		result = result.substring(0, result.lastIndexOf("."));
	}
	return result;
};
/*
 * @param {String} url
 * @returns {String}
 */
var imageId = function(url) {
	var hash = baseName(url);
	return 40 === hash.length ? hash : url;
};
var onClick = function(e) {
	/** @type {jQuery} HTMLAnchorElement */
	var $a = $(e.currentTarget);
	/** @type {String} */
	var href = $a.attr('href') || $a.data('href');
	/** @type {Boolean} */
	var result = false;
	if (3 === e.which) {
		// right menu
		ClickTrack.trackClick(e);
		//result = true;
	}
	else if ((2 === e.which) || e.shiftKey || e.metaKey || e.ctrlKey) {
		// new tab or window
		var win = window.open(href, '_blank');
		win.focus();
	}
	else {
		result = true;
	}
	return result;
};
export default {name: 'df-gallery', after: 'inject-objects', initialize: function(container) {
	var pluginEnabled = Discourse.SiteSettings['«Gallery»_Enabled'];
	const w = Discourse.SiteSettings['«Gallery»_Thumbnail_Size'];
	const h = w;
	if (pluginEnabled) {
		/** @type {Function} */
		var original = ClickTrack.trackClick;
		ClickTrack.trackClick = function(e) {
			/** @type {jQuery} HTMLAnchorElement */
			var $a = $(e.currentTarget);
			return $a.hasClass('dfNoClickTrack') ? true : original.call(ClickTrack, e);
		};
		decorateCooked(container, function($post) {
			/** @type {jQuery} HTMLDivElement[] */
			var $galleries = $('.df-gallery');
			if ($galleries.length) {
				// For edit mode: check if already processed.
				// Important!
				$('br', $galleries).remove();
				/** @type {jQuery} HTMLImageElement[] */
				var $images = $galleries.children('img');
				$images.each(function() {
					/** @type {jQuery} HTMLImageElement */
					var $image = $(this);
					/** @type {String} */
					var fullSizeUrl = $image.attr('src');
					/** @type {String} */
					var thumbUrl =
						'/gallery/thumb/' + w + '/' + h
						+ '?original=' + encodeURIComponent(imageId(fullSizeUrl))
					;
					/** @type {String} */
					var title = $image.attr('alt');
					$image.attr({src: thumbUrl, width: w, height: h});
					var $a = $('<a/>');
					$a.attr({href: fullSizeUrl, title: title, 'class': 'dfNoClickTrack'});
					//$a.css({width: w, height: h});
					$a.click(onClick);
					$image.wrap($a);
				});
				// We do not use standard Magnific Popup
				// loadScript('/javascripts/jquery.magnific-popup-min.js').then(function() {
				// because it does not work in gallery mode.
				//loadScript('/javascripts/jquery.magnific-popup-min.js').then(function() {
				$galleries.magnificPopup({
					delegate: 'a',
					type: 'image',
					tLoading: 'Loading image #%curr%...',
					mainClass: 'mfp-img-mobile',
					gallery: {
						enabled: true,
						navigateByImgClick: true,
						preload: [0,1] // Will preload 0 - before current, and 1 after the current image
					},
					image: {
						tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
						titleSrc: function(item) {
							return item.el.attr('title');
						}
					}
				});
				//});
				$galleries.removeClass('df-hidden');
			}
		});
	}
}};