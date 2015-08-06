import DiscourseLocation from 'discourse/lib/discourse-location';
export default DiscourseLocation.reopen({
	/**
	 * 2015-07-09
	 * Ядро Discourse содержит проблемный код в методе onUpdateURL класса DiscourseLocation:
	 * app/assets/javascripts/discourse/lib/discourse-location.js.es6:
		popstateCallbacks.forEach(function(cb) {
			cb(url);
		});
	 * Из-за этого кода при моей двойной ручной смене в адресной строке хэша Discourse зависает.
	 * Моя заплатка устраняет эту проблему.
	 */
	onUpdateURL: function(callback) {
		this._super(callback);
		const guid = Ember.guidFor(this);
		const eventId = 'popstate.ember-location-' + guid;
		const $window = $(window);
		const events = $._data($window[0], 'events');
		if (events && events['popstate'] && events['popstate'][0] && events['popstate'][0].handler) {
			const coreHandler = events['popstate'][0].handler;
			$window.off(eventId);
			if (coreHandler) {
				$window.on(eventId, function() {
					if (!DiscourseLocation.disableUpdateUrl) {
						coreHandler.call(window);
					}
				});
			}
		}
	}
});