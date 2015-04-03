module RestInspect
  class UseCase
    def self.run inputs
      self.new.run inputs
    end

    def failure error
      OpenStruct.new(success?: false, error: error)
    end

    def success data
      OpenStruct.new(success?: true, data: data)
    end
  end
end
