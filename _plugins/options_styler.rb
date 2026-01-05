Jekyll::Hooks.register [:notes, :posts, :pages], :post_render do |item|
  # Regex to find list items starting with **(text)**
  # Matches: <li...> \s* <strong> ( ... ) </strong>
  # Group 1: The opening <li> tag (including attributes if any)
  # Group 2: The content inside the parentheses
  
  item.output.gsub!(/(<li\b[^>]*>)\s*<strong>\((.*?)\)<\/strong>/) do |match|
    li_tag = $1
    content = $2
    "#{li_tag}<strong class=\"option-label\">(#{content})</strong>"
  end
end
