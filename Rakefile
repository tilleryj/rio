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