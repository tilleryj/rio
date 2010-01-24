require 'rio_on_rails'
require 'juggernaut'
require 'rio_routes'
ActionView::Base.send(:include, Rio::Helpers)
ActionController::Base.send(:extend, Rio::ActionControllerExtensions)
ActionController::Base.send(:include, Rio::ApplicationControllerExtensions)

ActiveRecord::Base.send(:include, Rio::ActiveRecordExtensions)


ActiveSupport::Dependencies.load_once_paths.delete("/Users/tilleryj/projects/outliner/vendor/plugins/rio_on_rails/lib")