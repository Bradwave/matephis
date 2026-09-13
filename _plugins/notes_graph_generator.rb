# frozen_string_literal: true
require 'json'

module Jekyll
  class NotesGraphGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      notes_col = site.collections['notes']
      return unless notes_col

      notes_data = {}
      title_to_key = {}

      # 1. Index all notes metadata
      notes_col.docs.each do |doc|
        title = doc.data['title'].to_s.strip
        slug = doc.basename_without_ext
        key = slug.downcase
        title_to_key[title.downcase] = key

        # Generate a safe 20-word excerpt without HTML tags
        raw_text = doc.content.to_s.gsub(/---[\s\S]*?---/, '')
        clean_text = raw_text.gsub(/<[^>]+>/, ' ').gsub(/\s+/, ' ').strip
        words = clean_text.split(/\s+/)
        excerpt = words[0..20].join(' ')
        excerpt += '...' if words.length > 20

        notes_data[key] = {
          'title' => title,
          'url' => "#{site.baseurl}#{doc.url}",
          'excerpt' => excerpt,
          'outbound' => [],
          'backlinks' => []
        }
      end

      # 2. Extract outbound links from raw markdown (ignoring code blocks)
      notes_col.docs.each do |doc|
        source_key = doc.basename_without_ext.downcase
        next unless notes_data[source_key]

        content = doc.content.to_s
        # Strip fenced code blocks and inline code to prevent matching JSON/math
        sanitized = content.gsub(/```[\s\S]*?```/, '').gsub(/`[^`]+`/, '')

        sanitized.scan(/\[\[(.*?)\]\]/) do |match|
          raw_target = match[0].split('|').first.to_s.strip
          next if raw_target.include?('::') # external link

          target_key = title_to_key[raw_target.downcase] || raw_target.downcase
          if notes_data[target_key] && target_key != source_key
            notes_data[source_key]['outbound'] << target_key unless notes_data[source_key]['outbound'].include?(target_key)
            
            backlink_item = {
              'title' => notes_data[source_key]['title'],
              'url' => notes_data[source_key]['url']
            }
            unless notes_data[target_key]['backlinks'].any? { |b| b['url'] == backlink_item['url'] }
              notes_data[target_key]['backlinks'] << backlink_item
            end
          end
        end
      end

      # 3. Output /assets/notes-graph.json statically
      site.pages << GraphJsonPage.new(site, site.source, 'assets', 'notes-graph.json', notes_data.to_json)
    end
  end

  class GraphJsonPage < Jekyll::Page
    def initialize(site, base, dir, name, content)
      @site = site
      @base = base
      @dir = dir
      @name = name
      self.process(name)
      self.data = { 'layout' => nil }
      self.content = content
    end
  end
end
