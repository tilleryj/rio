class RioComponentGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      m.directory "public/javascripts/components"
      m.template "component.js", "public/javascripts/components/#{file_name}.js"

      m.directory "public/stylesheets/components"
      m.file "component.css", "public/stylesheets/components/#{file_name}.css"

      m.directory "public/javascripts/specs/fixtures/components"
      m.template "fixture.js", "public/javascripts/specs/fixtures/components/#{file_name}.js"
      m.directory "public/javascripts/specs/components"
      m.template "spec.js", "public/javascripts/specs/components/#{file_name}_spec.js"
    end
  end
end