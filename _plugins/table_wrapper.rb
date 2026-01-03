module Jekyll
  class TableWrapper
    # Regex to capture table content non-greedily
    TABLE_REGEX = /<table.*?>.*?<\/table>/im

    def self.process(content)
      content.gsub(TABLE_REGEX) do |match|
        # Check if already wrapped by looking at immediate predecessor
        # This is a basic check.
        pre_match = Regexp.last_match.pre_match
          "<div class=\"table-wrapper\">#{match}</div>"
        end
      end
    end
  end
end

Jekyll::Hooks.register [:documents, :pages], :post_render do |doc|
  # Only process HTML output
  if doc.output_ext == ".html"
    doc.output = Jekyll::TableWrapper.process(doc.output)
  end
end
