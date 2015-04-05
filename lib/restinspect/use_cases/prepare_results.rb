module RestInspect
  class BuildGeoJSON < UseCase
    def run results
      return {results: []} if results.empty?

      {
        results: results.map do |r|
          facility = JSON.parse(r.to_json)
          inspections = r.inspections.map { |x| JSON.parse(x.to_json) }

          geojson = JSON.parse(facility.delete('gj'))
          geojson['properties'] = facility
          geojson['properties']['inspections'] = inspections
          geojson
        end
      }
    end
  end
end
