# name: df-gallery
# about: The «Gallery» plugin adds the ability to show multiple images in a post as a gallery.
# version: 1.0.0
# authors: Dmitry Fedyuk
# url: https://discourse.pro/t/34
register_asset 'javascripts/server.js.erb', :server_side
register_asset 'javascripts/magnific-popup.js'
register_asset 'stylesheets/main.scss'
register_asset 'stylesheets/magnific-popup/main.scss'
after_initialize do
	module ::Gallery
		class Engine < ::Rails::Engine
			engine_name 'gallery'
			isolate_namespace Gallery
		end
		require_dependency 'application_controller'
		class IndexController < ::ApplicationController
			layout false
			skip_before_filter :preload_json, :check_xhr
			def thumbnail
				original = params[:original]
				upload = Upload.find_by(sha1: original) || Upload.find_by(url: original)
				if !upload
					render nothing: true, status: 404
					#raise ActiveRecord::RecordNotFound
				else
					originalPath = Discourse.store.path_for(upload)
					w = params[:width].to_i
					h = params[:height].to_i
					thumbnail = upload.thumbnail(w, h)
					if not thumbnail.present?
						createThumbnailsOriginalValue = SiteSetting.create_thumbnails?
						SiteSetting.create_thumbnails = true
						upload.create_thumbnail!(w, h)
						thumbnail = upload.thumbnail(w, h)
						SiteSetting.create_thumbnails = createThumbnailsOriginalValue
					end
					contentType = thumbnail.extension
					# Remove leading dot
					# http://stackoverflow.com/a/3614592/254475
					contentType[0] = ''
					if 'jpg' == contentType
						contentType = 'jpeg'
					end
					send_file "#{Rails.root}/public#{thumbnail.url}",
						:disposition => 'inline',
						:type => "image/#{contentType}",
						:x_sendfile => true
				end
			end
		end
		Discourse::Application.routes.prepend do
			mount ::Gallery::Engine, at: 'gallery'
		end
		Gallery::Engine.routes.draw do
			get '/thumb/:width/:height' => 'index#thumbnail'
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
end