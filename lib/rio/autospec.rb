ENV['RAILS_ENV'] = "development"

require 'find'
require 'rio/juggernaut'
require 'rio/path'
require 'active_support'

class AutoSpec
  def self.run
    self.new.run
  end

  attr_accessor :directories, :last_mtime

  def initialize
    rio_root = Rio::ROOT
    
    js_root = File.join("public", "javascripts")
    rio_js_root = File.join(rio_root, "public", "javascripts")
    css_root = File.join("public", "stylesheets")
    rio_css_root = File.join(rio_root, "public", "stylesheets")

    self.directories = [js_root, rio_js_root, css_root, rio_css_root]
    self.last_mtime = Time.now
  end
  
  def run
    if (!Juggernaut)
      puts "Juggernaut needs to be running for autospec to work"
      return
    end
    begin
      loop do
        wait_for_changes
        files = find_files_to_broadcast
        self.last_mtime = files.values.map {|d| d[:mtime] }.max
        broadcast_changes(files)
      end
    rescue Interrupt
      puts
      # Quit with ^C
    end
  end
  
  def broadcast_changes(files)
    puts "\n\nBroadcasting updates for: \n"
    puts files.values.map{|d| d[:rio_name]}.join(", ")

    Juggernaut.send_to_all("rio.console.touch([#{ files.values.map{|d| "'" + d[:rio_name] + "'"}.join(", ") }])")
  end
  
  def wait_for_changes
    Kernel.sleep 1 until !find_files_to_broadcast.empty?
  end
  
  def find_files_to_broadcast
    files = find_files
    files.each do |filename, data|
      files.delete(filename) unless self.last_mtime < data[:mtime]
    end
    files
  end
  
  def find_files
    result = {}
    targets = self.directories

    # from ZenTest
    targets.each do |target|
      Find.find(target) do |f|

        next if test ?d, f
        next if f =~ /(swp|~|rej|orig)$/ # temporary/patch files
        next if f =~ /(\.svn)/           # svn files
        next if f =~ /\/\.?#/            # Emacs autosave/cvs merge files
        next if f =~ /\.DS_Store/        # OSX metadata

        filename = f.sub(/^\.\//, '')
        
        rio_name = Regexp.new("^#{Regexp.escape(target)}(.*)").match(filename)[1]
        result[filename] = { :mtime => File.stat(filename).mtime, :rio_name => rio_name } rescue next
      end
    end

    return result
  end
end