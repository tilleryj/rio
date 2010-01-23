require 'rake'
require 'rake/gempackagetask'

spec = eval(File.read('rio.gemspec'))
Rake::GemPackageTask.new(spec) do |pkg|
  pkg.gem_spec = spec
end

def version
  File.read('VERSION').strip
end

desc "Install rio"
task :install => :gem do
  system("gem install pkg/rio-#{version}.gem --no-ri --no-rdoc")
end
