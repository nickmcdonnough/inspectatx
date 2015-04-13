require 'sinatra'
require 'json'
require 'dalli'

class RestInspectServer < Sinatra::Application
  attr_reader :params, :cash

  set :cache, Dalli::Client.new

  before '/search' do
    @params = JSON.parse request.body.read
    @cash = settings.cache.get params unless params.empty?
  end

  get '/' do
    erb :index
  end

  post '/search' do
    return cash if cash

    results = RestInspect::Lookup.run params

    data = if results.success?
      RestInspect::BuildGeoJSON.run results.data
    else
      {}
    end

    data = JSON.generate(data)
    settings.cache.set(params, data)
    data
  end

end
