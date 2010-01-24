class RioModelGenerator < Rails::Generator::NamedBase
  def manifest
    if (@args.size == 0)
      begin
        attributes = class_name.constantize.column_names - ["id", "created_at", "updated_at"]
      rescue
        attributes = []
      end
    else
      attributes = @args.map {|arg| arg.match(/(.*):.*/)[1] }
    end

    record do |m|
      m.template "model.js", "public/javascripts/models/#{file_name}.js", :assigns => { :attributes => attributes }
      m.directory "public/javascripts/specs/fixtures/models"
      m.template "fixture.js", "public/javascripts/specs/fixtures/models/#{file_name}.js"
      m.directory "public/javascripts/specs/models"
      m.template "spec.js", "public/javascripts/specs/models/#{file_name}_spec.js"
    end
  end
end