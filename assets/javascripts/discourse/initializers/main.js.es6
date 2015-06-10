import { decorateCooked } from 'discourse/lib/plugin-api';
let _codesA;
export default {name: 'gallery', after: 'inject-objects', initialize: function (container) {
	if (Discourse.SiteSettings['«Gallery»_Enabled']) {
		decorateCooked(container, function($post) {
			alert('decorateCooked');
		});
	}
}};