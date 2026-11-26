# Hints and solutions in exercises.
#
#   [sol: …] or [solution: …]  the answer, blurred until tapped
#   [hint: …]                  a hint; consecutive hints form a group revealed one at a time
#
# A short answer floats on the exercise's last line; a long one becomes a block. Brackets inside
# the answer are fine when balanced, and anything inside maths ($…$, $$…$$) is ignored, so
# intervals like $[0, 1)$ or $]0, 1[$ don't end the tag early. Examples inside <code> are left
# as written. The reveal behaviour lives in assets/js/matephis-aids.js (notes) and the board's
# exercise cards.
module MatephisAids
  OPEN = /\[(sol|solution|hint):\s*/
  SHORT_MAX = 48 # visible characters that still fit beside the exercise text
  BETWEEN_HINTS = %r{\A\s*(?:<br\s*/?>\s*)?\z}

  module_function

  def render(html)
    parts = split(html)
    out = +''
    parts.each do |part|
      next out << part if part.is_a?(String)
      next out << solution(part[:body]) unless part[:hint]

      out << '<span class="hints">' if part[:first]
      out << hint(part[:body], part[:number])
      out << '</span>' if part[:last]
    end
    out
  end

  # Text and tags in order; hints separated only by whitespace are numbered as one group.
  def split(html)
    parts = []
    pos = 0
    while (m = OPEN.match(html, pos))
      # Syntax shown in code, or a tag that never closes, stays as written
      close = !in_code?(html, m.begin(0)) && closing_bracket(html, m.end(0))
      unless close
        parts << html[pos...m.end(0)]
        pos = m.end(0)
        next
      end

      parts << html[pos...m.begin(0)]
      parts << { hint: m[1] == 'hint', body: html[m.end(0)...close].strip }
      pos = close + 1
    end
    parts << html[pos..]
    number_hints(parts)
  end

  def number_hints(parts)
    groups = []
    parts.each_with_index do |part, i|
      next unless part.is_a?(Hash) && part[:hint]

      previous = groups.last&.last
      joined = previous && parts[previous + 1...i].all? { |p| p.is_a?(String) && p.match?(BETWEEN_HINTS) }
      joined ? groups.last << i : groups << [i]
    end
    groups.each do |group|
      group.each_with_index { |index, n| parts[index][:number] = group.size > 1 ? n + 1 : nil }
      parts[group.first][:first] = true
      parts[group.last][:last] = true
    end
    parts
  end

  def in_code?(html, at)
    open = html.rindex('<code', at) or return false
    close = html.rindex('</code>', at)
    close.nil? || close < open
  end

  def closing_bracket(text, from)
    depth = 1
    i = from
    while i < text.length
      case text[i]
      when '\\' then i += 1
      when '$' # skip the maths; a dollar that doesn't close ($…$ on one line) is a character
        fence = text[i + 1] == '$' ? '$$' : '$'
        close = text.index(fence, i + fence.length)
        close = nil if close && fence == '$' && text[i...close].include?("\n")
        i = close + fence.length - 1 if close
      when '[' then depth += 1
      when ']'
        depth -= 1
        return i if depth.zero?
      end
      i += 1
    end
    nil
  end

  def solution(body)
    long = visible_length(body) > SHORT_MAX
    %(<span class="solution-tag#{' is-long' if long}"><span class="aid-label">Soluzione</span> ) +
      %(<span class="solution-text" tabindex="0" role="button">#{body}</span></span><span class="aid-end"></span>)
  end

  def hint(body, number)
    %(<span class="hint-tag"><span class="aid-label">Suggerimento#{" #{number}" if number}</span> ) +
      %(<span class="hint-text">#{body}</span></span>)
  end

  # Roughly what a reader sees: no tags, and a TeX command counts as one glyph.
  def visible_length(body)
    body.gsub(/<[^>]+>/, '')
        .gsub(/\\(?:left|right|[bB]igg?|[,;!]|q?quad)/, '')
        .gsub(/\\[a-zA-Z]+/, 'x')
        .delete('${}^_\\')
        .length
  end
end

Jekyll::Hooks.register [:notes, :posts], :post_render do |doc|
  doc.output = MatephisAids.render(doc.output) if doc.output&.match?(MatephisAids::OPEN)
end
