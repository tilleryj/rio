class RioAppGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      m.template "app.js", "public/javascripts/apps/#{file_name}.js"
      m.file "app.css", "public/stylesheets/#{file_name}.css"
      m.directory "public/javascripts/specs/fixtures/apps"
      m.template "fixture.js", "public/javascripts/specs/fixtures/apps/#{file_name}.js"
      m.directory "public/javascripts/specs/apps"
      m.template "spec.js", "public/javascripts/specs/apps/#{file_name}_spec.js"

      m.dependency "rio_page", [name]

      m.template "app.build", "public/javascripts/apps/#{file_name}.build"
      
      m.file "rio_controller.rb", "app/controllers/rio_controller.rb", :collision => :skip
      m.file "rio.html.erb", "app/views/layouts/rio.html.erb"
      m.directory "app/views/rio"
      m.template "app_view.html.erb", "app/views/rio/#{file_name}.html.erb"

      route_app file_name
    end
  end
  
  def route_app app_name
    sentinel = 'ActionController::Routing::Routes.draw do |map|'

    unless options[:pretend]
      gsub_file 'config/routes.rb', /(#{Regexp.escape(sentinel)})/mi do |match|
        "#{match}\n  map.connect '#{app_name}', :controller => 'rio', :action => '#{app_name}'\n"
      end
    end
  end
  
  def gsub_file(relative_destination, regexp, *args, &block)
    path = destination_path(relative_destination)
    content = File.read(path).gsub(regexp, *args, &block)
    File.open(path, 'wb') { |file| file.write(content) }
  end
  
end