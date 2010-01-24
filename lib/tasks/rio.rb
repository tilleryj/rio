require "packr"
require "rio/path"
require "rio/autospec"
require "rio/rio_compressor"

ROOT = RAILS_ROOT
RIO_ROOT = Rio::ROOT

JS_ROOT = File.join(ROOT, "public", "javascripts")
RIO_JS_ROOT = File.join(RIO_ROOT, "public", "javascripts")


namespace :js do
  
  desc "Minify javascripts and templates for production environment"
  task :min => :environment do
    RioCompressor.minify_boot
    RioCompressor.apps.each do |app|
      RioCompressor.minify_scripts(RioCompressor.scripts_for_app(app, ["apps", app + ".js"]), File.join(JS_ROOT, "apps", "compressed", app + ".js"))

      RioCompressor.minify_stylesheets(app, ["apps", app + ".build"], File.join(ROOT, "public", "stylesheets", "compressed", app + ".css"))

      RioCompressor.minify_templates(app, ["apps", app + ".build"], File.join(JS_ROOT, "apps", "compressed", app + ".jst"))
    end
  end
  
  def entries_to_delete(directory, save = [])
    return [] unless File.exist?(File.join(JS_ROOT, directory))
    Dir.entries(File.join(JS_ROOT, directory)).reject do |entry|
      entry.match /\.build$/ or entry.match /\.jst$/ or entry.match /^\./ or entry == "compressed" or save.include?(entry)
    end.map { |entry| File.join(directory, entry) }
  end
  
  desc "[ONLY USE IN PRODUCTION] Prepares for JS deployment, by minifying then removing all non-minified and non-prototype javascript files."
  task :deploy => :min do
    FileUtils.cp(File.join(RIO_JS_ROOT, "lib", "boot.js"), File.join(JS_ROOT, "lib"))
    FileUtils.cp(File.join(RIO_JS_ROOT, "lib", "event.simulate.js"), File.join(JS_ROOT, "lib"))
    FileUtils.cp_r(File.join(RIO_JS_ROOT, "prototype"), File.join(JS_ROOT))
    
    to_remove = (
      ["models"] + 
      entries_to_delete("components") +
      entries_to_delete("pages") + 
      entries_to_delete("apps") + 
      entries_to_delete("lib", ["boot.js", "environment.js", "ZeroClipboard.swf", "swfupload.swf", "juggernaut.swf", "selenium_extensions.js", "event.simulate.js", "expressinstall.swf"])
    ).map do |entry|
      File.join(JS_ROOT, entry)
    end
    FileUtils.rm_rf(to_remove)
  end
  
  desc "Start the rio javascript autospec server"
  task :autospec do
    AutoSpec.run
  end
end

desc "Start the juggernaut server"
task :juggernaut do
  `juggernaut -c config/juggernaut.yml`
end


