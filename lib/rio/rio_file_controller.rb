class RioFileController < ActionController::Base
  ssl_allowed :write if defined? SslRequirement
  protect_from_forgery :except => :write
  
  def write
    app_path = File.join(Rio::ROOT, "public", params[:path])
    rio_path = File.join(RAILS_ROOT, "public", params[:path])

    File.open(File.exists?(app_path) ? app_path : rio_path, "w") do |f|
      f.write(params[:content])
    end
    
    render :text => "SUCCESS"
  end
  
end
