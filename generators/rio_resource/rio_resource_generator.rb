class RioResourceGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      m.dependency "resource", [name] + @args
      m.dependency "rio_model", [name] + @args
      
      m.template "controller.rb", "app/controllers/#{file_name}s_controller.rb", :collision => :force
    end
  end
end