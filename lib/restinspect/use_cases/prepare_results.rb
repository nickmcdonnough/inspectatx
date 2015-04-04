module RestInspect
  class BuildGeoJSON
    def run results
      return {results: []} if data.empty?

      {
        results: results.map do |r|
          facility = JSON.parse(r.to_json)
          geojson = JSON.parse(facility.delete('gj'))
          geojson['properties'] = facility
          geojson
        end
      }
    end
  end
end
