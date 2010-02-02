require 'rake'
require 'fileutils'

def version
  File.read('VERSION').strip
end

desc "Build riojs gem"
task :build do
  mkdir_p "pkg"
  system("gem build riojs.gemspec && mv riojs-#{version}.gem pkg/riojs-#{version}.gem")
end

desc "Install riojs gem"
task :install => [:build, :uninstall] do
  system("gem install pkg/riojs-#{version}.gem --no-ri --no-rdoc")
end

desc "Uninstall riojs gem"
task :uninstall do
  system("gem uninstall -ax riojs")
end

desc "Deploy the riojs gem to gemcutter"
task :deploy => [:jsdoc, :build] do
  system("gem push pkg/riojs-#{version}.gem")
end

desc "Update the rio docs"
task :jsdoc do
  rio_js_root = File.join("public", "javascripts")

  js_doc_output = File.join(rio_js_root, "lib", "console", "docs")
  rio_build_path = File.join(rio_js_root, "lib", "rio.build")
  rio_files = IO.readlines(rio_build_path) + ["lib/boot"]
  files = rio_files.map do |f| 
    File.join(rio_js_root, f.strip + ".js")
  end
  `java -jar jsdoc/jsrun.jar jsdoc/app/run.js -d=#{ js_doc_output } -a -t=jsdoc/templates/jsdoc #{ files.join(" ") }`
end

desc "Creates a rails specification file"
task :rails_spec => :build do
  spec = Gem::Specification.load("riojs.gemspec")
  File.open(".specification", 'w') do |file|
    file.puts spec.to_yaml
  end
end