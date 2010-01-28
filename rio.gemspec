Gem::Specification.new do |s|
  s.name = "rio"
  s.version = File.read('VERSION').strip
  s.summary = "Javascript RIA framework for building real-time collaborative web applications on top of Rails."
  s.description = <<-EOF
    Rio is a javascript RIA framework for building real-time collaborative web applications on top of Rails.
    It includes sophisticated binding libraries, client->server and server->client synchronization, transitive 
    dependency management, testing frameworks, and compression and deployment optimization.    
  EOF
  
  s.add_dependency('packr')
  s.add_dependency('juggernaut')
  
  s.files = Dir[
    "init.rb",
    "LICENSE",
    "README.rdoc",
    "rio.gemspec",
    "VERSION",
    
    "bin/**/*",
    "generators/**/*",
    "install/**/*",
    "lib/**/*",
    "public/**/*"
  ]
  s.require_path = "lib"
  s.executables = ["rio"]

  s.rdoc_options = ["--charset=UTF-8"]
  s.has_rdoc = false

  s.authors = ["Jason Tillery", "Vishu Ramanathan"]
  s.email = "tilleryj@gmail.com"
  s.homepage = "http://github.com/tilleryj/rio"
end

