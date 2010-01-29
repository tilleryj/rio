require "rio/rio_compressor"
require "rio/rio_file_controller"
require "rio/rio_on_rails"
require "rio/path"
require "rio/rio_proxy_controller"
require "rio/rio_push_controller"
require "rio/rio_routes"
require "rio/rio_spec_controller"
require "rio/juggernaut"

ActionView::Base.send(:include, Rio::Helpers)
ActionController::Base.send(:extend, Rio::ActionControllerExtensions)
ActionController::Base.send(:include, Rio::ApplicationControllerExtensions)
ActiveRecord::Base.send(:include, Rio::ActiveRecordExtensions)
