module RestInspect
  class Inspection < ActiveRecord::Base
    belongs_to :restaurant, foreign_key: :facility_id
  end
end
