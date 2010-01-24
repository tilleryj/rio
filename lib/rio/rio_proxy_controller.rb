class RioProxyController < ApplicationController
  ssl_allowed :javascripts, :sounds, :stylesheets, :stylesheet_concat if defined? SslRequirement
  
  def javascripts
    if m = params[:path].last.match(/(.*)_concat\.jst/)
      app = m[1]
      render :text => RioCompressor.concat_templates_for_app(app, params[:path])
    elsif m = params[:path].last.match(/(.*)_concat\.js/)
      app = m[1]
      if app == "rio"
        render :text => RioCompressor.concat_scripts_for_rio
      elsif app == "rio_development"
        render :text => RioCompressor.concat_scripts_for_rio_development
      elsif app == "prototype"
        render :text => RioCompressor.concat_scripts_for_prototype
      else
        render :text => RioCompressor.concat_script_functions_for_app(app, params[:path])
      end
    else
      file_to_render = File.join(Rio::ROOT, "public", "javascripts", File.join(params[:path])) 
      extension = params[:path].last.split('.').last || 'js'
      render :file => file_to_render, :content_type => Mime::Type.lookup_by_extension(extension).to_s
    end
  end
  
  def sounds
    file_to_render = File.join(Rio::ROOT, "public", "sounds", File.join(params[:path])) 
    extension = params[:path].last.split('.').last || 'js'
    render :file => file_to_render, :content_type => Mime::Type.lookup_by_extension(extension).to_s
  end
  
  def images
    file_to_render = File.join(Rio::ROOT, "public", "images", File.join(params[:path])) 
    extension = params[:path].last.split('.').last || 'png'
    render :file => file_to_render, :content_type => Mime::Type.lookup_by_extension(extension).to_s
  end
  
  def stylesheets
    if m = params[:path].last.match(/(.*)_concat\.css/)
      app = m[1]
      render :text => RioCompressor.concat_stylesheets_for_app(app, params[:path][0..-2] + ["apps"] + [params[:path][-1]]), :content_type => Mime::Type.lookup_by_extension("css").to_s
    else
      file_to_render = File.join(Rio::ROOT, "public", "stylesheets", File.join(params[:path]))
      if (file_to_render.match(/\.css$/))
        render :file => file_to_render, :content_type => Mime::Type.lookup_by_extension("css").to_s
      else
        render :text => "Not a css file"
      end
    end
  end
  
  def stylesheet_concat
    content = params[:files].map do |f|
      app_path = File.join(RAILS_ROOT, "public", "stylesheets", f + ".css")
      rio_path = File.join(Rio::ROOT, "public", "stylesheets", f + ".css")
      File.open(File.exists?(app_path) ? app_path : rio_path).read
    end
    render :text => content.join("\n\n"), :content_type => Mime::Type.lookup_by_extension("css").to_s
  end
end
