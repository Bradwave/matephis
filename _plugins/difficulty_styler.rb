Jekyll::Hooks.register [:notes, :posts], :post_render do |item|
  # Cache the difficulty data to avoid reading the file for every post
  item.site.data['difficulty_map'] ||= begin
    path = File.join(item.site.source, '_notes', 'Public', 'scala-difficoltà.md')
    data = {}
    if File.exist?(path)
      content = File.read(path)
      # Match table rows: | **[CODE]** | Description | Example |
      # Updated regex to handle the [brackets] inside the **bold** markers
      content.scan(/\|\s*\*\*\[([A-Z\/]+)\]\*\*\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/) do |code, desc, ex|
        data[code.strip] = { 
          desc: desc.strip, 
          example: ex.strip 
        }
      end
    end
    data
  end

  difficulty_data = item.site.data['difficulty_map']

  # Process markers inside <strong> tags to handle cases like **text [F+]**
  item.output.gsub!(/<strong>(.*?)<\/strong>/m) do |bold_content|
    inner_html = $1
    # Replace [CODE] with styled span inside the bold block
    inner_html.gsub!(/\[(T|E|EE|EE\/F|F|PD|AD|D|TD|ED|ABO)([+\-]?)\]/) do |match|
      base_code = $1
      modifier = $2
      full_code = "#{base_code}#{modifier}"
      
      # Use the base code for data lookup
      info = difficulty_data[base_code] || { desc: "Grado #{base_code}", example: "" }
      level = base_code.downcase.gsub('/', '-')
      
      # Clean description: remove French names in parentheses
      desc = info[:desc].gsub(/\s*\([^)]+\)/, '').strip
      
      # Determine prefix
      is_alpinistico = ["F", "PD", "AD", "D", "TD", "ED", "ABO"].include?(base_code)
      prefix = is_alpinistico ? "Grado di difficoltà alpinistica: " : "Grado di difficoltà: "
      
      # Tooltip text with "Esempio cuneese"
      tooltip_text = "#{prefix}#{desc}\nEsempio cuneese: #{info[:example]}"
      
      # Escape quotes for HTML attribute
      safe_tooltip = tooltip_text.gsub('"', '&quot;')
      
      "<span class=\"difficulty-tag diff-#{level}\" data-tooltip=\"#{safe_tooltip}\">#{full_code}</span>"
    end
    "<strong>#{inner_html}</strong>"
  end
end
