Jekyll::Hooks.register [:notes, :posts], :post_render do |item|
  # Replace [sol: text here] or [solution: text here] with a right-aligned solution tag.
  # "Soluzione: " label is always visible; only the answer text is blurred.
  item.output.gsub!(/\[(sol|solution):\s*(.*?)\]/) do |match|
    text = $2.strip
    safe_text = text.gsub('"', '&quot;')
    "<span class=\"solution-tag\">Soluzione: <span class=\"solution-text\" tabindex=\"0\">#{safe_text}</span></span>"
  end

  # Replace [hint: text here] with a right-aligned hint tag.
  # "Suggerimento: " label is always visible; only the hint text is blurred.
  item.output.gsub!(/\[hint:\s*(.*?)\]/) do |match|
    text = $1.strip
    safe_text = text.gsub('"', '&quot;')
    "<span class=\"solution-tag hint-tag\">Suggerimento: <span class=\"solution-text hint-text\" tabindex=\"0\">#{safe_text}</span></span>"
  end
end


