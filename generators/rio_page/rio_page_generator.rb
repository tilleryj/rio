class RioPageGenerator < Rails::Generator::NamedBase
  def manifest
    record do |m|
      m.template "page.js", "public/javascripts/pages/#{file_name}_page.js"
      m.template "page.jst", "public/javascripts/pages/#{file_name}_page.jst"

      m.directory "public/stylesheets/pages"
      m.template "page.css", "public/stylesheets/pages/#{file_name}_page.css"

      m.directory "public/javascripts/specs/fixtures/pages"
      m.template "fixture.js", "public/javascripts/specs/fixtures/pages/#{file_name}_page.js"
      m.directory "public/javascripts/specs/pages"
      m.template "spec.js", "public/javascripts/specs/pages/#{file_name}_page_spec.js"
    end
  end
end