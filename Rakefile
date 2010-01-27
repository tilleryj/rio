require 'rake'

def version
  File.read('VERSION').strip
end

desc "Build rio gem"
task :build do
  system("gem build rio.gemspec && mv rio-#{version}.gem pkg/rio-#{version}.gem")
end

desc "Install rio gem"
task :install => [:build, :uninstall] do
  system("gem install pkg/rio-#{version}.gem --no-ri --no-rdoc")
end

desc "Uninstall rio gem"
task :uninstall do
  system("gem uninstall -ax rio")
end

desc "Update the rio docs"
task :jsdoc do
  rio_js_root = File.join(File.dirname(__FILE__), "public", "javascripts")

  js_doc_output = File.join(rio_js_root, "lib", "console", "docs")
  rio_build_path = File.join(rio_js_root, "lib", "rio.build")
  rio_files = IO.readlines(rio_build_path) + ["lib/boot"]
  files = rio_files.map do |f| 
    File.join(rio_js_root, f.strip + ".js")
  end
  `java -jar jsdoc/jsrun.jar jsdoc/app/run.js -d=#{ js_doc_output } -a -t=jsdoc/templates/jsdoc #{ files.join(" ") }`
end