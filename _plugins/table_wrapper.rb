module Jekyll
  class TableWrapper
    # Regex to capture table content non-greedily
    TABLE_REGEX = /<table.*?>.*?<\/table>/im

    def self.process(content)
      content.gsub(TABLE_REGEX) do |match|
        # Check if already wrapped by looking at immediate predecessor
        # This is a basic check.
        pre_match = Regexp.last_match.pre_match
        if pre_match =~ /<div[^>]*class=["']matephis-table-wrapper["'][^>]*>\s*\z/
          match
        else
          "<div class=\"matephis-table-wrapper\">#{match}</div>"
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
