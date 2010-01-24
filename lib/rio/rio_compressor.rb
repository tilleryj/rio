# =================================================================
# = This file has a lot of repetition in it.  Refactoring needed! =
# =================================================================
class RioCompressor
  def self.concat_scripts(scripts, digestName)
    line_number = 1
    scripts.map do |script|
      currently_parsing = script.match(/.*\/javascripts\/(.*)\.js$/)[1]
      digest_entry = "rio.boot.#{digestName}['#{line_number + 1}'] = '#{currently_parsing}';\n"
      content = File.open(script).read + "\n"
      line_number = line_number + content.split("\n").size + 1
      
      digest_entry + content
    end.join("\n\n")
  end
  
  def self.concat_scripts_for_minify(scripts)
    scripts.map do |script|
      File.open(script).read
    end.join("\n\n")
  end
  
  def self.minify_boot
    prototype_file = File.join(RIO_JS_ROOT, "prototype", "prototype.js")
    environment_file = File.join(JS_ROOT, "lib", "environment.js")
    boot_file = File.join(RIO_JS_ROOT, "lib", "boot.js")
    compressed_prototype_file = File.join(JS_ROOT, "prototype", "compressed", "prototype.js")
    compressed_rio_file = File.join(JS_ROOT, "lib", "compressed", "rio.js")

    self.minify_scripts(self.prototype_scripts, compressed_prototype_file)
    self.minify_scripts(self.rio_scripts, compressed_rio_file)
    
    compressed_boot_file = File.join(JS_ROOT, "lib", "compressed", "boot.js")
    unless File.exists?(File.dirname(compressed_boot_file))
      FileUtils.mkdir_p(File.dirname(compressed_boot_file))
    end
    File.open(compressed_boot_file, "w") do |f|
      f.puts self.concat_scripts_for_minify([
        prototype_file, 
        environment_file, 
        boot_file, 
        compressed_prototype_file, 
        # compressed_rio_file
      ])
    end
  end
  
  def self.minify_scripts(scripts, compressed_script)
    code = concat_scripts_for_minify(scripts)

    compressed = Packr.pack(code)

    unless File.exists?(File.dirname(compressed_script))
      FileUtils.mkdir_p(File.dirname(compressed_script))
    end
    File.open(compressed_script, "w") do |f|
      f.puts compressed
    end
  end
  
  def self.minify_stylesheets(app, path, stylesheet_path)
    unless File.exists?(File.dirname(stylesheet_path))
      FileUtils.mkdir_p(File.dirname(stylesheet_path))
    end
    File.open(stylesheet_path, "w") do |f|
      f.puts concat_stylesheets_for_app(app, path)
    end
  end
  
  def self.minify_templates(app, path, template_path)
    unless File.exists?(File.dirname(template_path))
      FileUtils.mkdir_p(File.dirname(template_path))
    end
    File.open(template_path, "w") do |f|
      f.puts concat_templates_for_app(app, path)
    end
  end

  def self.read_build_file(build_file)
    File.readlines(build_file).reject(&:blank?).map(&:strip)
  end


  def self.rio_scripts
    self.raw_rio_scripts.map {|f| File.join(self.rio_js_root, f + ".js") }
  end
  def self.raw_rio_scripts
    self.read_build_file(File.join(self.rio_js_root, "lib", "rio.build"))
  end
  

  def self.rio_development_scripts
    self.raw_rio_development_scripts.map {|f| File.join(self.rio_js_root, f + ".js") }
  end
  def self.raw_rio_development_scripts
    self.read_build_file(File.join(self.rio_js_root, "lib", "rio_development.build"))
  end
  

  def self.prototype_scripts
    self.raw_prototype_scripts.map do |f|
      File.join(self.rio_js_root, f + ".js")
    end
  end
  def self.raw_prototype_scripts
    ["prototype/effects", "prototype/dragdrop", "prototype/controls", "prototype/builder"]
  end

  def self.apps
    Dir.entries(File.join(self.js_root, "apps")).select { |e| e.match(/.*\.build$/) }.map { |e| e.match(/(.*)\.build$/)[1] }
  end

  def self.scripts_for_app(app, path)
    self.raw_scripts_for_app(app, path).map do |f| 
      self.script_for_app(f)
    end
  end
  def self.script_for_app(script)
    File.exists?(File.join(self.js_root, script + ".js")) ? File.join(self.js_root, script + ".js") : File.join(self.rio_js_root, script + ".js")
  end
  def self.raw_scripts_for_app(app, path)
    self.yaml_for_app(app, path)["scripts"]
  end
  def self.yaml_for_app(app, path)
    app_build_path = File.join(self.js_root, path - [path.last], app + ".build")
    rio_build_path = File.join(self.rio_js_root, path - [path.last], app + ".build")

    filename = File.exists?(app_build_path) ? app_build_path : rio_build_path
    YAML.load_file(filename)
  end
  
  def self.concat_script_functions_for_app(app, path)
    register = raw_scripts_for_app(app, path).map do |f|
      <<-JS
        rio.boot.loadFunctions['#{f}'] = function() {
          #{File.open(self.script_for_app(f)).read}
        };
      JS
    end.join("\n\n")
  end

  def self.stylesheet_files_for_app(app, path)
    self.yaml_for_app(app, path)["stylesheets"] || []
  end
  def self.concat_stylesheets_for_app(app, path)
    stylesheet_files_for_app(app, path).map do |t|
      content_of_stylesheet(t)
    end.join("\n")
  end
  def self.content_of_stylesheet(t)
    sub_path = File.join("public", "stylesheets", t + ".css")
    app_path = File.join(self.root, sub_path)
    rio_path = File.join(self.rio_root, sub_path)

    File.read(File.exists?(app_path) ? app_path : rio_path)
  end

  def self.template_files_for_app(app, path)
    self.yaml_for_app(app, path)["templates"] || []
  end
  def self.concat_templates_for_app(app, path)
    "<templates xmlns:rio=\"http://riojs.com\">" + template_files_for_app(app, path).map do |t|
      tag_name = t.gsub("/", "--")
      class_name = t.split("/").last.camelize(:lower)
      <<-JST
        <#{tag_name}>
          <div style="height: 100%;" class="#{class_name}">
            #{content_of_template(t)}
          </div>
        </#{tag_name}>
      JST
    end.join("\n") + "</templates>"
  end
  def self.content_of_template(t)
    app_path = File.join(self.js_root, t + ".jst")
    rio_path = File.join(self.rio_js_root, t + ".jst")
    
    File.read(File.exists?(app_path) ? app_path : rio_path)
  end

  def self.concat_scripts_for_rio
    register = (self.raw_rio_scripts + self.raw_rio_development_scripts).map do |s|
      "rio.boot.loadedFiles.push('#{s}');rio.boot.rioScripts.push('#{s}');"
    end.join("\n")
    register + "\n" + self.concat_scripts(self.rio_scripts + self.rio_development_scripts, "rioScriptsDigest")
  end

  def self.concat_scripts_for_rio_development
    register = (self.raw_rio_development_scripts).map do |s|
      "rio.boot.loadedFiles.push('#{s}');rio.boot.rioScripts.push('#{s}');"
    end.join("\n")
    register + "\n" + self.concat_scripts(self.rio_development_scripts, "appScriptsDigest")
  end
  
  def self.concat_scripts_for_prototype
    register = self.raw_prototype_scripts.map do |s|
      "rio.boot.loadedFiles.push('#{s}');rio.boot.prototypeScripts.push('#{s}');"
    end.join("\n")
    register + "\n" + self.concat_scripts(self.prototype_scripts, "prototypeScriptsDigest")
  end
  
  private

  def self.root
    RAILS_ROOT
  end

  def self.rio_root
    Rio::ROOT
  end
  
  def self.js_root
    File.join(root, "public", "javascripts")
  end
  
  def self.rio_js_root
    File.join(rio_root, "public", "javascripts")
  end
end