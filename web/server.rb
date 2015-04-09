require 'sinatra'
require 'json'
require 'dalli'

class RestInspectServer < Sinatra::Application

  set :cache, Dalli::Client.new

  before '/search' do
    @cache = settings.cache.get(params)
  end

  get '/' do
    erb :index
  end

  post '/search' do
    return @cache if @cache

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
