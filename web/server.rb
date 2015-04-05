require 'sinatra'
require 'json'

require 'pry-byebug'

class RestInspectServer < Sinatra::Application
  attr_reader :params

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
