/**
 * Simple markdown → HTML converter for agent replies.
 * Handles: **bold**, *italic*, \n newlines, bullet lists.
 */
export function renderMarkdown(text) {
  if (!text) return "";
  return (
    text
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic *text*
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Bullet points - lines starting with - or *
      .replace(/^[-•]\s(.+)/gm, "<li>$1</li>")
      // Wrap consecutive <li> in <ul>
      .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
      // Double newline = paragraph break
      .replace(/\n\n/g, "</p><p>")
      // Single newline = line break
      .replace(/\n/g, "<br/>")
      // Wrap everything in a paragraph
      .replace(/^(.+)/, "<p>$1")
      .replace(/(.+)$/, "$1</p>")
  );
}
