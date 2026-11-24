Jekyll::Hooks.register [:notes, :posts], :post_render do |item|
  # Replace [sol: text here] or [solution: text here] with a right-aligned solution tag.
  # "Soluzione: " label is always visible; only the answer text is blurred.
  item.output.gsub!(/\[(sol|solution):\s*(.*?)\]/) do |match|
    # The text is already HTML (links, maths): quotes are left alone, escaping them broke attributes
    text = $2.strip
    "<span class=\"solution-tag\">Soluzione: <span class=\"solution-text\" tabindex=\"0\">#{text}</span></span>"
  end

  # Replace [hint: text here] with a right-aligned hint tag.
  # "Suggerimento: " label is always visible; only the hint text is blurred.
  item.output.gsub!(/\[hint:\s*(.*?)\]/) do |match|
    text = $1.strip
    "<span class=\"solution-tag hint-tag\">Suggerimento: <span class=\"solution-text hint-text\" tabindex=\"0\">#{text}</span></span>"
  end
end


