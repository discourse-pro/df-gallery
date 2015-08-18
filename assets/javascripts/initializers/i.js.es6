import df from 'discourse/plugins/df-core/df';
import {decorateCooked} from 'discourse/lib/plugin-api';
import loadScript from 'discourse/lib/load-script';
import ClickTrack from 'discourse/lib/click-track';
export default {name: 'df-gallery', initialize(c) {if (Discourse.SiteSettings['«Gallery»_Enabled']) {
	/** @type {Function} */
	const original = ClickTrack.trackClick;
	ClickTrack.trackClick = function(e) {
		/** @type {jQuery} HTMLAnchorElement */
		const $a = $(e.currentTarget);
		return $a.hasClass('dfNoClickTrack') ? true : original.call(ClickTrack, e);
	};
	/*Discourse.reopen({
		LOG_TRANSITIONS: true,
		LOG_TRANSITIONS_INTERNAL: true
	});*/
	decorateCooked(c, onDecorateCooked);
}}};
/**
 * @link http://stackoverflow.com/a/3820412
 * @param {String} url
 * @returns {String}
 */
const baseName = function(url) {
	/** @type {String} */
	var result = new String(url).substring(url.lastIndexOf('/') + 1);
	if (result.lastIndexOf('.') != -1) {
		result = result.substring(0, result.lastIndexOf('.'));
	}
	return result;
};
/**
 * @param {String} url
 * @returns {String}
 */
const imageId = function(url) {
	var hash = baseName(url);
	return 40 === hash.length ? hash : url;
};
/**
 * @param {Event} e
 * @returns {Boolean}
 */
const onClick = function(e) {
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
const Caption = {
	/**
	 * @param {jQuery} $image HTMLImageElement
	 * @returns {String}
	 */
	get: function($image) {return $image.attr('alt');}
	/**
	 * @param {jQuery} $image HTMLImageElement
	 * @returns void
	 */
	,prepare: function($image) {
		/**
		 * 2015-08-06
		 * К сожалению, jQuery не умеет выбирать текстовых братьев.
		 * В частности, .siblings() и .next() просто игнорируют текстовых братьев,
		 * не обрамлённых внутрь каких либо тегов.
		 * Поэтому делаем выборку текстовых братьев вручную посредством DOM.
		 */
		/** @type HTMLImageElement */
		const image = $image.get(0);
		/** @type {HTMLElement} */
		var e = image.nextSibling;
		/** @type {HTMLElement[]} */
		var nextUntilImg = [];
		/** @type {HTMLElement[]} */
		var descriptionA = [];
		/**
		 * @param {HTMLElement} e
		 * @returns {Boolean}
		 */
		const isGarbage = function(e) {
			return (
				isTag(e, 'br')
				// комментарий: http://www.w3schools.com/jsref/prop_node_nodetype.asp
				|| (8 === e.nodeType)
				// текст
				|| (3 === e.nodeType && '' === e.nodeValue.trim())
			);
		};
		/**
		 * Cвойство tagName текстовых узлов возвращает undefined.
		 * @param {HTMLElement} e
		 * @param {String} tag
		 * @returns {Boolean}
		 */
		const isTag = function(e, tag) {return !!(e.tagName && tag === e.tagName.toLowerCase());};
		// Пропускаем начальные br.
		// 2015-08-07
		// Оказывается, нам надо пропускать не только начальные br,
		// но и мусор перед br: пробелы, переносы строк, табуляции и т.п.
		while (e && isGarbage(e)) {
			nextUntilImg.push(e);
			e = e.nextSibling;
		}
		// Теперь разбираем подпись к картинке.
		while (e && !isTag(e, 'img')) {
			nextUntilImg.push(e);
			descriptionA.push(e);
			e = e.nextSibling;
		}
		// Теперь удаляем конечные br и мусор.
		while (descriptionA.length && isGarbage(descriptionA[descriptionA.length - 1])) {
			descriptionA.pop();
		}
		/** @type {String} */
		var description = df.dom.outerHtml(descriptionA);
		$.each(nextUntilImg, function() {
			/** @link http://stackoverflow.com/a/8830882 */
			this.parentNode.removeChild(this);
		});
		if (description.length) {
			/** @type {String} */
			var title = $image.attr('alt');
			/** @type {String} */
			var descriptionCooked = Discourse.Markdown.cook(description);
			var $descriptionCooked = $(descriptionCooked);
			$descriptionCooked =
				$('<div>')
					.addClass('df-description')
					.html($descriptionCooked.is('p') ? $descriptionCooked.html() : descriptionCooked)
			;
			descriptionCooked = df.dom.outerHtml($descriptionCooked);
			if (title) {
				title = df.dom.outerHtml($('<div>').addClass('df-title').html(title));
			}
			/**
			 * Discourse.Markdown.cook обрамляет наше описание в тег p.
			 * В принципе, нам это на руку: таким образом, при наличии alt,
			 * alt становится заголовком изображения, а description — описанием.
			 */
			$image.attr('alt', title ? title + descriptionCooked : descriptionCooked);
		}
	}
};
/**
 * 2015-08-06
 * 1) decorateCooked вызывает своих подписчиков для каждого сообщения отдельно.
 * 2) $post содержит не только сообщение, но и элементы управления.
 * Чтобы применить свои селекторы только к сообщению,
 * используйте родительский селектор .cooked, например:
 * const $tables = $('.cooked > table', $post);
 * @used-by decorateCooked
 * @link https://github.com/discourse/discourse/blob/v1.4.0.beta7/app/assets/javascripts/discourse/lib/plugin-api.js.es6#L5
 * @param {jQuery} $post HTMLDivElement
 * @returns void
 */
const onDecorateCooked = function($post) {
	/** @type {jQuery} HTMLDivElement[] */
	var $galleries = $('.df-gallery', $post);
	const matches = location.hash.match(/#image(\d+)/);
	const imageIdToOpen = matches && (1 < matches.length) ? matches[1] : null;
	const imageIdSelector = imageIdToOpen ? 'img[data-file-id=' + imageIdToOpen + ']' : null;
	if ($galleries.length) {
		/** @type {String} */
		const w = Discourse.SiteSettings['«Gallery»_Thumbnail_Size'];
		/** @type {String} */
		const h = w;
		/** @type {String} */
		const thumbUrlPrefix = '/df/core/thumb/' + w + '/' + h + '?original=';
		// For edit mode: check if already processed.
		// Important!
		//$('br', $galleries).remove();
		/** @type {jQuery} HTMLImageElement[] */
		const $images = $galleries.children('img');
		$images.each(function() {
			/** @type {jQuery} HTMLImageElement */
			const $image = $(this);
			Caption.prepare($image);
			/** @type {String} */
			const fullSizeUrl = $image.attr('src');
			/** @type {String} */
			const thumbUrl = thumbUrlPrefix + encodeURIComponent(imageId(fullSizeUrl));
			$image.attr({src: thumbUrl, width: w, height: h});
			const $a = $('<a/>');
			$a.attr({href: fullSizeUrl, title: Caption.get($image), 'class': 'dfNoClickTrack'});
			//$a.css({width: w, height: h});
			$a.click(onClick);
			$image.wrap($a);
		});
		// We do not use standard Magnific Popup
		// loadScript('/javascripts/jquery.magnific-popup-min.js').then(function() {
		// because it does not work in gallery mode.
		$galleries.each(function() {
			var $gallery = $(this);
			var options = {
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
				,callbacks: {
					change: function(data) {
						const imageId = data.el.children('img').attr('data-file-id');
						if (imageId) {
							silentlyChangeLocationHash('#image' + imageId);
						}
					}
					,close: function() {silentlyChangeLocationHash('');}
		  		}
			};
			var indexToOpen = null;
			if (imageIdToOpen) {
				const $img = $(imageIdSelector, $gallery);
				if ($img.length) {
					indexToOpen = $img.parent().index();
				}
			}
			/**
			 * 2015-08-06
			 * Ошибочно здесь ставить условие !indexToOpen,
			 * потому что indexToOpen может быть равен 0.
			 */
			if (null === indexToOpen) {
				$gallery.dfMagnificPopup(options);
			}
			else {
				$gallery.dfMagnificPopup(options);
				$gallery.dfMagnificPopup('open', indexToOpen);
			}
			$gallery.removeClass('df-hidden');
		});
	}
};
const silentlyChangeLocationHash = function(newHash) {
	const discourseLocation = Discourse.URL.get('router.location');
	discourseLocation.pushState(discourseLocation.getURL() + newHash);
};