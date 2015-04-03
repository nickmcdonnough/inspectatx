task :environment do
  require './config/environments'
end

task :console => :environment do
  require 'irb'
  ARGV.clear
  IRB.start
end
