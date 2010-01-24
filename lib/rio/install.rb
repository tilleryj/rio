require 'fileutils'

module Rio
  class Install
    ROOT = File.join(File.dirname(__FILE__), "..", "..", "install")

    def self.install!
      self.print_banner
      self.create_public_directories!
      self.install_dependencies!
      self.add_gem_require_to_environment!
      self.add_juggernaut_config!
      self.print_readme
    end
    
    private
    
    def self.print_banner
      puts ""
      puts "Installing rio dependencies"
      puts ""
    end
    
    def self.print_readme
      puts ""
      puts IO.read(File.join(ROOT, "..", 'README.rdoc'))
      puts ""
    end
    
    def self.create_public_directories!
      ["apps", "components", "lib", "models", "pages", "specs"].each do |path|
        self.mkdir!(File.join("public", "javascripts", path))
      end
      self.mkdir!("public/stylesheets/components")
      self.mkdir!("public/stylesheets/pages")
    end
    
    def self.install_dependencies!
      install_items! File.join('..', 'public', 'javascripts', 'lib', 'expressinstall.swf'), File.join('public', 'javascripts', 'lib')
      install_items! File.join('..', 'public', 'javascripts', 'lib', 'juggernaut.swf'), File.join('public', 'javascripts', 'lib')
      install_items! File.join('..', 'public', 'javascripts', 'lib', 'environment.js'), File.join('public', 'javascripts', 'lib')
      install_items! File.join('config')
      install_items! File.join('lib')
      install_items! File.join('script')
    end
    
    def self.add_gem_require_to_environment!
      sentinel = 'Rails::Initializer.run do |config|'
      gsub_file 'config/environment.rb', /(#{Regexp.escape(sentinel)})/mi do |match|
        "#{match}\n  config.gem \"rio\"\n"
      end
    end
    
    def self.add_juggernaut_config!
      system('juggernaut -g config/juggernaut.yml')
    end
    
    def self.mkdir!(path)
      puts "\tcreate   #{path}" unless File.exist?(path)

      FileUtils.mkdir_p(path)
    end
    
    def self.install_items!(from, to = from)

      src = File.join(ROOT, from)
      if File.directory?(src)
        self.mkdir!(to)
        Dir.entries(src).reject do |entry|
          entry.match(/^\..*/)
        end.each do |entry|
          install_items! File.join(from, entry), File.join(to, entry)
        end
      else
        dest_dirname = File.dirname(to)
        FileUtils.mkdir_p(dest_dirname) unless File.exists?(dest_dirname)
        FileUtils.cp(src, to)

        installed_path = to.match(/#{File.basename(src)}$/) ? to : "#{to}/#{File.basename(src)}"
        puts "\tinstall  #{installed_path}"
      end
    end

    def self.gsub_file(path, regexp, *args, &block)
      content = File.read(path).gsub(regexp, *args, &block)
      File.open(path, 'wb') { |file| file.write(content) }
    end
  end
end

