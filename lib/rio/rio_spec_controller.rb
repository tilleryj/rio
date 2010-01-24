class RioSpecController < ApplicationController
  def initialize
    @file_utils = FileDependencies.new(File.join(RAILS_ROOT, 'public', 'javascripts', 'specs'))
    @rio_file_utils = FileDependencies.new(File.join(Rio::ROOT, "public", "javascripts", "specs"))
  end

  def specs
    render :text => ("{" + (spec_entries(@file_utils) + spec_entries(@rio_file_utils)).join(",") + "}")
  end

  def fixtures
    render :json => "{ #{(dir(@file_utils, 'fixtures') + dir(@rio_file_utils, 'fixtures')).join(",")} }"
  end
  
  def spec_entries utils
    utils.entries.reject do |entry|
      entry == 'fixtures' or entry.starts_with?('.')
    end.map do |entry|
      dir(utils, entry)
    end.flatten
  end
  
  def dir utils, dir_path
    utils.entries(dir_path).reject do |entry|
      # REQ: Skip anything that start with '.'
      entry.starts_with?('.')
    end.reject do |entry|
      # REQ: Skip files that don't end with '.js'
      utils.file?(entry) and not entry.ends_with?('.js')
    end.map do |entry|
      child_path = File.join(dir_path, entry)
      if(utils.directory?(child_path))
        dir(utils, child_path)
      else
        file(utils, child_path)
      end
    end.flatten
  end
  
  def file(utils, file_path)
    "\"#{strip_ex file_path}\": function(){ return \"#{escape_special_characters(utils.read(file_path).gsub("\n", ""))}\" }"
  end
  
  def escape_special_characters s
      s.gsub(/["]/, '\\\"').gsub(/\\n/, '\\\\\\n').gsub(/\\t/, '\\\\\\t')
  end
  
  def strip_ex s
    s[0..(s.rindex('.')-1)]
  end
end

class FileDependencies
  def initialize root_directory
    @root_directory = root_directory
  end
  
  def entries *path
    Dir.entries(File.join(@root_directory, *path))
  end
  def directory? path
    File.directory?(File.join(@root_directory, path))
  end
  def file? path
    not self.directory?(path)
  end
  def read path
    File.read(File.join(@root_directory, path))
  end
end
