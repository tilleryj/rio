# RioOnRails
require 'digest/sha1'
require 'json/add/rails'

module Rio
  module Helpers
    def cache_key
      @cache_key ||= ENV['cache_rio'] ? File.new(RAILS_ROOT).mtime.to_i : rand
    end
    
    def application_stylesheet
      url = boot_compressed? ? "compressed/#{@rio_app}.css" : "#{@rio_app}_concat.css"
      <<-CSS
        <link href="#{asset_prefix}/stylesheets/#{url}?#{cache_key}" media="screen" rel="stylesheet" type="text/css" />
      CSS
    end
    
    def asset_prefix
      # meant to be overriden
      ""
    end
    
    def after_rio(html)
      @after_rio = "#{@after_rio || ""}\n#{html}"
    end

    def boot_compressed?
      rio_compression == "compressed"
    end

    def rio_compression
      ENV['rio_compression'] || ((RAILS_ENV == "development" and params.has_key?(:compressed)) ? "compressed" : "uncompressed")
    end
    
    def rio_environment
      ENV['rio_environment'] || RAILS_ENV
    end

    def rio(opts = {})
      if @rio_app
        rio_html = <<-HTML
          <script type="text/javascript">
            rio = {
              cacheKey: "#{cache_key}",
              assetPrefix: "#{asset_prefix}",
              preloadedStylesheets: #{RioCompressor.stylesheet_files_for_app(@rio_app, ["apps", @rio_app + ".build"]).to_json},
              preloadTemplates: #{not RioCompressor.template_files_for_app(@rio_app, ["apps", @rio_app + ".build"]).empty?},
              environment: {
                includeRootInJson: "#{ ActiveRecord::Base.include_root_in_json }",
                railsToken: "#{ form_authenticity_token }",
                sessionId: #{ session.session_id.to_json },
                uSessionId: "#{ u  session.session_id }",
                transactionKey: "#{ u Digest::SHA1.hexdigest(Time.now.to_f.to_s + session.session_id) }"
              } 
            };
            #{ current_user_id.blank? ? "" : "rio.environment.userId = #{ current_user_id }" };
          </script>
        HTML

        if (boot_compressed?)
          <<-SCRIPTS
            #{rio_html}
            #{javascript_include_tag "#{asset_prefix}/javascripts/lib/compressed/boot.js?#{@rio_app},#{rio_environment},#{rio_compression},#{cache_key}"}
            #{@after_rio || ""}
          SCRIPTS
        else
          <<-SCRIPTS
            #{rio_html}
            #{javascript_include_tag "prototype/prototype.js"}
            #{javascript_include_tag "lib/environment.js"}
            #{javascript_include_tag "lib/boot.js?#{@rio_app},#{rio_environment},#{rio_compression},#{cache_key}"}
            #{@after_rio || ""}
          SCRIPTS
        end
      end
    end
  end
  
  module ActiveRecordExtensions
    def self.included(base)
      base.extend ClassMethods
      base.send(:include, Rio::ActiveRecordExtensions::Methods)
    end
    
    module ClassMethods

      def rio_json(options = {})
        self.send(:cattr_accessor, :rio_json_includes)

        self.rio_json_includes = options[:include]

        self.send(:include, Rio::RioModel)
      end
    
      def broadcast(mode)
        self.send(:cattr_accessor, :broadcast_mode)
        self.broadcast_mode = mode
      end
      
      def broadcast_mode
        :normal
      end
    
      def broadcast?
        self.broadcast_mode != :none
      end

      def validate_transaction!(transaction, objects)
        true
      end
    end
    
    module Methods
      def broadcast_to
        []
      end
    end
  end
  
  module RioModel
    # cattr_accessor :rio_json_includes
    def has_json_options?
      self.class.respond_to?("json_options")
    end
    
    def json_options
      has_json_options? ? self.class.json_options : {} 
    end
    
    def json_hash
      result = ActiveRecord::Serialization::Serializer.new(self, json_options).serializable_record
      
      # result = Hash.new
      # self.class.columns.each do |column|
      #   # unless column.name == "created_at" || column.name == "updated_at"
      #     result[column.name.to_sym] = self.send(column.name)
      #   # end
      # end
    
      # if(has_json_options)
      #   (self.class.json_options[:methods] || []).each do |method|
      #     result[method.to_sym] = self.send(method)
      #   end
      # end
    
      ActiveRecord::Base.include_root_in_json ? { self.class.name.underscore => result } : result
    end
    
    def include_json
      self.class.rio_json_includes.map do |inc| 
        {
          :className => inc[:class_name],
          :parameters => inc[:params].keys.inject({}) do |acc, k| 
            val = inc[:params][k]
            acc[k] = val.class == Proc ? val.call(self) : val
            acc
          end,
          :json => self.send(inc[:name])
        }
      end
    end
    
    def to_json(*args)
      if self.class.rio_json_includes.nil? or self.class.rio_json_includes.empty?
        json_hash.to_json
      else
        {
          :_set => {
            :self => json_hash,
            :include => include_json
          }
        }.to_json
      end
    end
  end
  
  module ActionControllerExtensions
    def rio_resource(options = {})
      self.send(:cattr_accessor, :rio_actions)

      self.rio_actions = options[:only] || [:index, :show, :create, :update, :destroy]
      self.send(:include, Rio::RioResource)
    end
  end
  
  module ApplicationControllerExtensions
    def self.included(base)
      base.send(:include, Rio::ApplicationControllerExtensions::Methods)
      base.send(:helper_method, :current_user_id)
      
      base.send(:before_filter, :reset_rio_cache)
    end
    module Methods
      def current_user_id
        nil
      end
      
      def reset_rio_cache
        $rio_cache[:current_user_id] = current_user_id
      end
    end
  end
  
  class Push
    def self.push_class
      (ENV["rio_push_class"] || "Juggernaut").constantize
    end
    
    def self.show_connected_clients
      self.push_class.show_connected_clients
    end
    
    def self.show_clients_for_channel(channel)
      self.push_class.show_clients_for_channel(channel)
    end

    def self.send_to_channel(data, channel)
      self.push_class.send_to_channel(data, channel)
    end

    def self.send_to_clients(data, clients)
      self.push_class.send_to_clients(data, clients)
    end
  end
  
  module RioResource
    def index
      raise "Index operation not supported" unless self.class.rio_actions.include?(:index)
      
      parsed_index_conditions = index_conditions
      
      raise "Index operation not authorized" unless self.index_authorized?(parsed_index_conditions)
      
      render :json => scope.find(:all, :conditions => parsed_index_conditions)
    end
    
    def index_conditions
      ActiveSupport::JSON.decode(params[:conditions])
    end

    def show
      raise "Show operation not supported" unless self.class.rio_actions.include?(:show)
      raise "Show operation not authorized" unless self.show_authorized?(params[:id])
      
      render :json => scope.find(params[:id])
    end
    
    def create
      raise "Create operation not supported" unless self.class.rio_actions.include?(:create)
      
      if (params["transaction"])
        execute_transaction(params["transaction"], params["transaction_key"])
      else
        raise "Create operation not authorized" unless self.create_authorized?(params[model_param_name])
        obj = create_scope.new(params[model_param_name])
      
        valid = true
        model.transaction do
          if (obj.save)
            objects = {}
            objects[obj.id] = obj
            unless (model.validate_transaction!({}, objects))
              valid = false
              raise ActiveRecord::Rollback
            end
          else
            valid = false
            raise ActiveRecord::Rollback
          end
        end

        if (valid)
          remote_create(obj, params["transaction_key"])
          render :json => obj
        else
          render :json => obj.errors, :status => 500
        end
      end
    end
    
    def update
      raise "Update operation not supported" unless self.class.rio_actions.include?(:update)
      paranoid = scope.respond_to?(:find_with_deleted)
      if (paranoid)
        obj = scope.find_with_deleted(params[:id])
      else
        obj = scope.find(params[:id])
      end

      needs_recover = (paranoid and obj.deleted?)

      valid = true
      changed_fields = []
      model.transaction do
        if (needs_recover)
          raise "Update operation not authorized" unless self.update_authorized?(obj, ["deleted_at"])
          obj.recover!
        end

        obj.attributes = params[model_param_name]
        changed_fields = obj.changed
        raise "Update operation not authorized" unless self.update_authorized?(obj, changed_fields)
        if (obj.save)
          objects = {}
          objects[obj.id] = obj
          unless (model.validate_transaction!({}, objects))
            valid = false
            raise ActiveRecord::Rollback
          end
        else
          valid = false
          raise ActiveRecord::Rollback
        end
      end

      if (valid)
        if (needs_recover)
          remote_create(obj, params["transaction_key"])
        else
          remote_update(obj, changed_fields, params["transaction_key"])
        end
        render :json => obj
      else
        render :json => obj.errors, :status => 500
      end
    end
    
    def destroy
      raise "Destroy operation not supported" unless self.class.rio_actions.include?(:destroy)
      obj = scope.find(params[:id])
      raise "Destroy operation not authorized" unless self.destroy_authorized?(obj)

      valid = true
      model.transaction do
        if (obj.destroy)
          objects = {}
          objects[obj.id] = obj

          unless (model.validate_transaction!({}, objects))
            valid = false
            raise ActiveRecord::Rollback
          end
        else
          valid = false
          raise ActiveRecord::Rollback
        end
      end

      if (valid)
        remote_destroy(obj, params["transaction_key"])
        render :json => { :id => params[:id] }
      else
        render :json => obj.errors, :status => 500
      end
    end
    
    protected
    
    def scope
      model
    end
    
    def create_scope
      scope
    end
    
    def model
      model_class_name = controller_class_name.match(/(.*)Controller$/)[1].singularize
      model_class_name.constantize
    end
    
    def index_authorized?(params)
      true
    end
    
    def show_authorized?(id)
      true
    end
    
    def create_authorized?(params)
      true
    end
    
    def update_authorized?(instance, attributes)
      true
    end

    def destroy_authorized?(instance)
      true
    end
    
    

    private
    
    def execute_transaction(transaction, transaction_key)
      valid = true
      objects = {}
      remote_transaction_data = []

      # If any of these items aren't found the transaction is invalid and will fail.
      # By verifying this here we can take for granted that some of these might be destroyed
      # as part of an association or before/after filter and not be available when needed to be destroyed.
      to_find = transaction.keys.select {|t| t.to_i > 0}
      paranoid = scope.respond_to?(:find_with_deleted)
      if (paranoid)
        existing_entities = scope.find_with_deleted(to_find)
      else
        existing_entities = scope.find(to_find)
      end
      existing_entities = [existing_entities].flatten

      model.transaction do
        new_ids, existing_ids = transaction.keys.partition { |id| id.to_i < 0 }
        
        transaction.keys.each do |id|
          obj = existing_entities.detect { |e| e.id == id.to_i }

          if (id.to_i < 0)
            raise "Create operation not authorized" unless self.create_authorized?(transaction[id])
            obj = create_scope.create(transaction[id])
            remote_transaction_data.push({ :action => "create", :name => model.to_s, :id => obj.id, :json => obj })
          elsif (paranoid and (not obj.nil?) and obj.deleted?)
            obj.recover!
            obj.attributes = transaction[id]
            raise "Update operation not authorized" unless self.update_authorized?(obj, obj.changed)
            obj.save
            remote_transaction_data.push({ :action => "create", :name => model.to_s, :id => obj.id, :json => obj })
          elsif (transaction[id] == "delete")
            raise "Destroy operation not authorized" unless self.destroy_authorized?(obj)
            obj.destroy
            remote_transaction_data.push({ :action => "destroy", :name => model.to_s, :id => obj.id, :json => obj })
          else
            obj.attributes = transaction[id]
            raise "Update operation not authorized" unless self.update_authorized?(obj, obj.changed)
            json_fields = obj.changed
            obj.save
            remote_transaction_data.push({ :action => "update", :name => model.to_s, :id => obj.id, :obj => obj, :json_fields => json_fields })
          end
        
          if (!obj.valid?)
            valid = false
          end
          
          objects[id] = obj
        end
      
        transaction.keys.each do |id|
          if (transaction[id] != "delete")
            (transaction[id].keys - ["id"]).each do |k|
              if (new_ids.include?(transaction[id][k].to_s))
                objects[id].update_attribute(k, objects[transaction[id][k].to_s].id)
              end
            end
          end
        end
        
        unless (model.validate_transaction!(transaction, objects))
          valid = false
          raise ActiveRecord::Rollback
        end
        
        raise ActiveRecord::Rollback unless valid
      end

      if (valid)
        remote_transaction(remote_transaction_data, transaction_key)
        render :json => {
          :transaction => objects.keys.inject({}) do |acc, id| 
            acc[id] = objects[id]
            acc
          end
        }
      else
        render :json => {
          :transaction => "FAILED"
        }, :status => 500
      end
    end
    
    def remote_create(obj, transaction_key)
      if (Rio::Push and model.broadcast?)
        begin
          Rio::Push.send_to_clients("""
            rio.Model.remoteCreate({
              transactionKey: \"#{transaction_key}\",
              name: \"#{ model.to_s }\",
              id: \"#{ obj.id }\",
              json: #{ obj.to_json }
            });
          """, other_client_ids(obj))
        rescue
          RAILS_DEFAULT_LOGGER.error("\n Failed to send a remote create \n")
        end
      end
    end
    
    def remote_update(obj, changed_fields, transaction_key)
      if (Rio::Push and model.broadcast?)
        begin
          
          json = changed_fields.inject({}) do |acc, f|
            acc[f] = obj.send(f)
            acc
          end
          
          if (ActiveRecord::Base.include_root_in_json)
            json = { "#{model.class_name.underscore}" => json }
          end
          
          Rio::Push.send_to_clients("""
            rio.Model.remoteUpdate({
              transactionKey: \"#{transaction_key}\",
              name: \"#{ model.to_s }\",
              id: \"#{ obj.id }\",
              json: #{ json.to_json }
            });
          """, other_client_ids(obj))
        rescue
          RAILS_DEFAULT_LOGGER.error("\n Failed to send a remote update \n")
        end
      end
    end
    
    def remote_destroy(obj, transaction_key)
      if(Rio::Push and model.broadcast?)
        begin
          Rio::Push.send_to_clients("""
            rio.Model.remoteDestroy({
              transactionKey: \"#{transaction_key}\",
              name: \"#{ model.to_s }\",
              id: \"#{ obj.id }\"
            });
          """, other_client_ids(obj))
        rescue
          RAILS_DEFAULT_LOGGER.error("\n Failed to send a remote destroy \n")
        end
      end
    end
    
    def remote_transaction(transaction, transaction_key)
      if(Rio::Push and model.broadcast?)
        begin
          other_client_list = transaction.map {|t| other_client_ids(t[:obj] || t[:json]) }.inject { |acc, ids| acc & ids }
          
          transaction.each do |t|
            if (t[:obj])
              obj = t.delete(:obj)
              fields = t.delete(:json_fields)
              t[:json] = fields.inject({}) do |acc, f|
                acc[f] = obj.send(f)
                acc
              end
              
              if (ActiveRecord::Base.include_root_in_json)
                t[:json] = { "#{model.class_name.underscore}" => t[:json] }
              end
            end
          end

          Rio::Push.send_to_clients("""
            rio.Model.remoteTransaction({
              transactionKey: \"#{transaction_key}\",
              transaction: #{transaction.to_json}
            });
          """, other_client_list)
        rescue => e
          RAILS_DEFAULT_LOGGER.error("\n Failed to send a remote transaction \n")
          RAILS_DEFAULT_LOGGER.error(e)
        end
      end
    end
    
    def other_client_ids(instance)
      if(model.broadcast_mode == :strict)
        instance.broadcast_to
      else
        Rio::Push.show_connected_clients.map { |c| c["id"] || c["client_id"] }
      end
    end
    
    def model_param_name
      model.class_name.underscore
    end
  end
end