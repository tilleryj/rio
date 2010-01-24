module ActionController
  module Routing #:nodoc:
    class RouteSet #:nodoc:
      alias_method :draw_without_rio_routes, :draw
      def draw
        draw_without_rio_routes do |map|
          map.connect 'rio/fixtures', :controller => 'rio_spec', :action => 'fixtures' unless RAILS_ENV == "production"
          map.connect 'rio/specs', :controller => 'rio_spec', :action => 'specs' unless RAILS_ENV == "production"
          map.connect 'rio/file', :controller => 'rio_file', :action => 'write' if RAILS_ENV == "development"
          map.connect 'rio/stylesheets', :controller => 'rio_proxy', :action => 'stylesheet_concat'
          yield map
          map.connect 'javascripts/*path', :controller => 'rio_proxy', :action => 'javascripts' if RAILS_ENV == "development" or RAILS_ENV == "test"
          map.connect 'sounds/*path', :controller => 'rio_proxy', :action => 'sounds' if RAILS_ENV == "development"
          map.connect 'images/*path', :controller => 'rio_proxy', :action => 'images'
          map.connect 'stylesheets/*path', :controller => 'rio_proxy', :action => 'stylesheets'
          map.connect 'push/subscribe', :controller => 'rio_push', :action => 'subscribe'
          map.connect 'push/broadcast', :controller => 'rio_push', :action => 'broadcast'
          map.connect 'push/test_connection', :controller => 'rio_push', :action => 'test_connection'
        end
      end
    end
  end
end

