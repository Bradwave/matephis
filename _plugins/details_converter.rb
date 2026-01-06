module Jekyll
  class DetailsConverter < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      site.pages.each { |page| convert_details(page) }
      site.posts.docs.each { |post| convert_details(post) }
      site.collections.each do |label, collection|
        collection.docs.each { |doc| convert_details(doc) }
      end
    end

    private

    def convert_details(doc)
      return unless doc.output

      # Look for blockquotes with class="details"
      # Kramdown renders {: .details} as <blockquote class="details">
      doc.output.gsub!(/<blockquote\s+class="details">\s*<p>(.*?)<\/p>(.*?)<\/blockquote>/m) do |match|
        summary = $1
        content = $2
        
        # Wrap content in <details>
        # Note: We preserve the 'details' class just in case, though usually styles target the tag
        "<details class=\"details\">\n<summary>#{summary}</summary>\n#{content}\n</details>"
      end
    end
  end
end

# Also hook into the post_render for pages/posts not caught by Generator if needed, 
# but Generator is robust. Actually, `Hooks` is the modern Jekyll way.
# Let's use Hooks like the other plugins for consistency.

Jekyll::Hooks.register [:pages, :posts, :notes], :post_render do |doc|
  # Match standard Kramdown blockquote output with .details class
  # Regex explanation:
  # <blockquote class="details">  -> Match start
  # \s*<p>(.*?)</p>               -> Capture first paragraph as summary
  # (.*?)                         -> Capture rest of content
  # </blockquote>                 -> Match end
  
  if doc.output
    # 1. Support for Kramdown class syntax: > ... {: .details}
    doc.output.gsub!(/<blockquote\s+class="details">\s*<p>(.*?)<\/p>(.*?)<\/blockquote>/m) do
      summary = $1
      content = $2
      "<details class=\"details\">\n<summary>#{summary}</summary>\n<div class=\"details-content\">#{content}</div>\n</details>"
    end

    # 2. Support for "Callout" syntax: > [!DETAILS] Summary
    # Matches: <blockquote><p>[!DETAILS] Summary</p> ... </blockquote>
    doc.output.gsub!(/<blockquote([^>]*)>\s*<p>\s*\[!DETAILS\]\s*(.*?)<\/p>(.*?)<\/blockquote>/m) do |match|
      attrs = $1
      summary = $2.strip
      content = $3
      
      # Preserve existing classes if any (excluding 'details' to avoid duplication if mixed)
      details_attrs = attrs.gsub(/class="[^"]*"/, '') 
      
      "<details class=\"details\" #{details_attrs}>\n<summary>#{summary}</summary>\n<div class=\"details-content\">#{content}</div>\n</details>"
    end
  end
end
