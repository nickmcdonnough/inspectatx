require 'sinatra'

class RestInspectServer < Sinatra::Application

  get '/' do
    send_file 'index.html'
  end

end
