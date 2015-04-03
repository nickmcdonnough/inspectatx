module RestInspect
  class Lookup < UseCase
    def run params
      query = params['query']
      score = params['score']
      sign  = params['sign']
      type  = params['type']

      results = RestInspect::Restaurant.lookup query, sign, score, type

      return failure(:nothing_found) unless results

      success results
    end
  end
end
