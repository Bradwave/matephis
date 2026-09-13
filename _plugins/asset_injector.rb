# Automatically injects plot/circuit/slides assets if code blocks or markers exist in content
Jekyll::Hooks.register [:documents, :pages], :pre_render do |doc|
  content = doc.content.to_s
  
  if content.include?('language-matephis') || content.include?('matephis-plot') || content =~ /```\s*matephis/
    doc.data['plot'] = true
  end

  if content.include?('language-circuit') || content.include?('matephis-circuit') || content =~ /```\s*circuit/
    doc.data['circuit'] = true
  end

  if content.include?('language-slides') || content.include?('matephis-slides') || content =~ /```\s*slides/
    doc.data['slides'] = true
  end
end
