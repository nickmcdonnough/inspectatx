require 'sinatra'
require 'json'

class RestInspectServer < Sinatra::Application
  attr_reader :params

  before '/search' do
    @params = JSON.parse request.body.read
  end

  get '/' do
    erb :index
  end

  post '/search' do
    results = RestInspect::Lookup.run params

    data = if results.success?
      RestInspect::BuildGeoJSON.run results.data
    else
      {}
    end

    JSON.generate(data)
  end
end
