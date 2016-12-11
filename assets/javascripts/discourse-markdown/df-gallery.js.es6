// 2016-12-11
// Сделал по аналогии с плагином Poll: https://github.com/discourse/discourse/blob/v1.7.0.beta9/plugins/poll/assets/javascripts/lib/discourse-markdown/poll.js.es6
import {registerOption} from 'pretty-text/pretty-text';
registerOption((siteSettings, opts) => {
	// 2016-07-24
	// Название фичи должно совпадать с именем файла.
	// https://github.com/discourse/discourse/blob/a9207dafa/app/assets/javascripts/pretty-text/engines/discourse-markdown.js.es6#L66
	opts.features['df-gallery'] = true;
});
//noinspection FunctionWithInconsistentReturnsJS
export function setup(helper) {
	helper.whiteList({custom(tag, name, value) {
		return 'div' === tag && 'class' == name && 0 === value.indexOf('df-');
	}});
	helper.replaceBlock({
		start: /(\[gallery])([\s\S]*)/gmi,
		stop: /\[\/gallery]/gmi,
		emitter: contentA => {return ['div', {'class': 'df-gallery df-hidden'}, contentA.join()];}
	});
}