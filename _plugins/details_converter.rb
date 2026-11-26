# Obsidian-style callouts: a blockquote whose first line is `[!TYPE] Title`.
#
#   > [!DETAILS] Title          a collapsible block
#   > [!DIMOSTRAZIONE] Title    the same, labelled (also APPROFONDIMENTO)
#   > [!SVOLGIMENTO]            the worked solution of an exercise, collapsed under it
#   > [!NOTA] Text              a short note, set in the margin voice
#
# The rest of the first line is the title; everything after it is the body. Other types and plain
# blockquotes are left alone, and callouts nested inside a body are converted too.
module MatephisCallouts
  LABELS = { 'DIMOSTRAZIONE' => 'Dimostrazione', 'APPROFONDIMENTO' => 'Approfondimento' }.freeze
  TYPES = (%w[DETAILS SVOLGIMENTO NOTA] + LABELS.keys).freeze
  OPENING = /<blockquote>\s*<p>\[!(\w+)\][ \t]*/
  TAG = %r{<(/?)blockquote\b[^>]*>}

  module_function

  def render(html)
    out = +''
    pos = 0
    while (m = OPENING.match(html, pos))
      type = m[1].upcase
      close = TYPES.include?(type) && closing_tag(html, m.end(0))
      unless close
        out << html[pos...m.end(0)]
        pos = m.end(0)
        next
      end

      first, rest = html[m.end(0)...close].split('</p>', 2)
      title, more = first.split("\n", 2)
      body = more ? "<p>#{more}</p>#{rest}" : rest.to_s
      out << html[pos...m.begin(0)] << callout(type, title.to_s.strip, render(body))
      pos = close + '</blockquote>'.length
    end
    out << html[pos..]
  end

  def closing_tag(html, from)
    depth = 1
    while (t = TAG.match(html, from))
      depth += t[1].empty? ? 1 : -1
      return t.begin(0) if depth.zero?

      from = t.end(0)
    end
    nil
  end

  def callout(type, title, body)
    case type
    when 'SVOLGIMENTO'
      %(<details class="work"><summary><span class="aid-label">Svolgimento</span></summary>) +
        %(<div class="details-content">#{body}</div></details>)
    when 'NOTA'
      %(<div class="nota">#{"<p>#{title}</p>" unless title.empty?}#{body}</div>)
    else
      label = LABELS[type] && %(<span class="aid-label">#{LABELS[type]}</span> )
      %(<details class="details"><summary>#{label}#{title}</summary>) +
        %(<div class="details-content">#{body}</div></details>)
    end
  end
end

Jekyll::Hooks.register [:pages, :posts, :notes], :post_render do |doc|
  doc.output = MatephisCallouts.render(doc.output) if doc.output&.match?(MatephisCallouts::OPENING)
end
