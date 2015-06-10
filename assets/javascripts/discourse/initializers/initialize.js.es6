import {decorateCooked} from 'discourse/lib/plugin-api';
import loadScript from 'discourse/lib/load-script';
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
export default {name: 'gallery', after: 'inject-objects', initialize: function(container) {
	const w = 100;
	const h = 100;
	if (Discourse.SiteSettings['«Gallery»_Enabled']) {
		decorateCooked(container, function($post) {
			return;
			/** @type {jQuery} HTMLDivElement[] */
			var $galleries = $('.df-gallery');
			/** @type {jQuery} HTMLImageElement[] */
			var $images = $('img', $galleries);
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
				$image.wrap($('<a/>').attr({href: fullSizeUrl, title: title}));
			});
			loadScript('/javascripts/jquery.magnific-popup-min.js').then(function() {
				$galleries.each(function() {
					/** @type {jQuery} HTMLDivElement */
					var $gallery = $(this);
					$gallery.magnificPopup({
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
				});
			});
			//alert(typeof $galleries.magnificPopup);
		});
	}
}};