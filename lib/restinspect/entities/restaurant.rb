module RestInspect
  class Restaurant < ActiveRecord::Base
    has_many :inspections, foreign_key: :facility_id, primary_key: :facility_id

    def self.lookup search_data, inequality, score, where_type
      select = %q[
        DISTINCT
          name
          , address
          , restaurants.facility_id
          , ST_AsGeoJSON(the_geom) as gj
      ]
      where1 = %Q[inspections.score #{getinequality(inequality)} #{score}]
      where2 = build_main_where search_data, where_type

      self
        .joins(:inspections)
        .preload(:inspections)
        .select(select)
        .where("#{where1} AND #{where2}")
    end

    private

    def self.build_main_where search_data, type
      case type
      when 'mapview'
        %Q[ST_Contains(ST_MakeEnvelope(#{search_data}, 4326), the_geom)]
      when 'zipcode'
        %Q[zip = '#{search_data}']
      when 'name'
        %Q[lower(restaurants.name) LIKE '%#{search_data.downcase}%']
      else
        ''
      end
    end

    def self.getinequality param
      case param
      when 'greaterthan'
        '>'
      when 'lessthan'
        '<'
      when 'equalto'
        '='
      else
        ''
      end
    end
  end
end

