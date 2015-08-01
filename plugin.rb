# name: df-gallery
# about: The «Gallery» plugin adds the ability to show multiple images in a post as a gallery.
# version: 2.0.0
# authors: Dmitry Fedyuk
# url: https://discourse.pro/t/34
register_asset 'javascripts/markdown.js', :server_side
register_asset 'javascripts/magnific-popup.js'
register_asset 'stylesheets/main.scss'
register_asset 'stylesheets/magnific-popup/main.scss'
after_initialize do
	# 2015-07-08
	# Добавляем к картинкам идентификаторы соответствующих им в таблице uploads строк
	require_dependency 'plugin/filter'
	Plugin::Filter.register(:after_post_cook) do |post, cooked|
		cooked.gsub!(/<img src="([^"]+)"/) {
			upload = Upload.find_by(url: $1)
			if upload
				"<img data-file-id=\"#{upload.id}\" src=\"#{$1}\""
			else
				"<img src=\"#{$1}\""
			end
		}
		cooked
	end
	require 'cooked_post_processor'
	CookedPostProcessor.class_eval do
		alias_method :core__extract_images, :extract_images
		def extract_images
			@doc.css('.df-gallery img') -
			core__extract_images
		end
	end
end