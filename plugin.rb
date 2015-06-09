# name: gallery
# about: The «Gallery» plugin adds the ability to show multiple images in a post as a gallery.
# version: 1.0.0
# authors: Dmitry Fedyuk
# url: http://discourse.pro/t/34
register_asset 'javascripts/magnific-popup.js'
register_asset 'stylesheets/magnific-popup/main.scss'
after_initialize do
	module ::Gallery
		class Engine < ::Rails::Engine
			engine_name 'gallery'
			isolate_namespace Gallery
		end
	end
end