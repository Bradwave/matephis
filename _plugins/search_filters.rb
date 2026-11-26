module Jekyll
  module SearchFilters
    # Strip rendered fenced code blocks (<pre>...</pre>) so raw JSON specs for
    # matephis/physics/sets/circuit diagrams are excluded from SearchData.json.
    def strip_code_blocks(input)
      return "" if input.nil?
      input.to_s.gsub(/<pre\b[^>]*>.*?<\/pre>/im, " ")
    end
  end
end

Liquid::Template.register_filter(Jekyll::SearchFilters)
