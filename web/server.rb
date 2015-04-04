require 'sinatra'
require 'json'
require_relative '../lib/restinspect.rb'

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
      RestInspect::PrepResults.run results.data
    else
      {}
    end

    JSON.generate(data)
  end
end
