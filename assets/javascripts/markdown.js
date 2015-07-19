Discourse.Dialect.replaceBlock({
	start: /(\[gallery])([\s\S]*)/gmi,
	stop: /\[\/gallery]/gmi,
	emitter: function(contentA) {
		return ['div', {'class': 'df-gallery df-hidden'/*, 'df-photo-id': '123'*/}, contentA.join()];
	}
});
Discourse.Markdown.whiteListTag('div', 'class', /^df\-[\s\S]+$/);
//Discourse.Markdown.whiteListTag('div', 'df-photo-id', /^\d+$/);