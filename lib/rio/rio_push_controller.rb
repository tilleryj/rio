class RioPushController < ActionController::Base
  session :cookie_only => false, :only => :subscribe

  def subscribe
    client_id = params[:client_id].to_i
    channels = params[:channels] || []
    if(client_id == 0)
      # client 0 is the server
      render :text => "AUTHORIZED"
    elsif(channels.length != 1)
      render :text => "FAILED", :status => 500
    else
      channel = channels.first
      model = channel.split(".")[0].constantize
      id = channel.split(".")[1].to_i
      
      if (model.authorize_broadcast(id, client_id))
        render :text => "AUTHORIZED"
      else
        render :text => "UNAUTHORIZED", :status => 401
      end
    end
  end
  
  def broadcast
    channel = params[:channel]
    model_name = channel.split(".")[0]
    model = model_name.constantize
    id = channel.split(".")[1].to_i
    user_id = session[:user_id]

    if (model.authorize_broadcast(id, user_id))

      message_json = ActiveSupport::JSON.decode(params[:message])
      message = "rio.models." + model_name + ".receiveBroadcast(" + message_json.to_json + ")"

      Rio::Push.send_to_channel(message, channel)
      
      render :text => "PASSED", :status => 200
    else
      render :text => "UNAUTHORIZED", :status => 500
    end
  end
  
  def test_connection
    render :text => Rio::Push.show_connected_clients.detect {|c| c["session_id"] == session.session_id} ? "CONNECTED" : "NOT_CONNECTED"
  end
end