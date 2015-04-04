require 'json'
require 'active_record'

require_relative 'restinspect/entities/restaurant.rb'
require_relative 'restinspect/entities/inspection.rb'

require_relative 'restinspect/use_cases/use_case.rb'
require_relative 'restinspect/use_cases/lookup.rb'
require_relative 'restinspect/use_cases/prepare_results.rb'

module RestInspect
end
