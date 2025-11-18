
export const parseMarkdown = (text: string): string => {
  let html = text;

  // Handle newlines
  html = html.replace(/\n/g, '<br />');

  // Handle bold text: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle bullet points: * text or - text
  // This is a bit more complex to handle multi-line lists correctly
  html = html.replace(/(?:<br \/>)?(?:(\*|-)\s)(.*)/g, (match, p1, p2) => `<li>${p2}</li>`);
  // Check if we have list items and wrap them in <ul>
  if (html.includes('<li>')) {
    html = `<ul>${html.replace(/<\/li>(<br \/>)?/g, '</li>')}</ul>`.replace(/<\/li><ul>/g, '<ul>').replace(/<\/ul><li>/g, '<li>');
  }
   // Clean up any double br tags that might occur after list processing
  html = html.replace(/<br \/>\s*<br \/>/g, '<br />');
  html = html.replace(/<\/li><br \/>/g, '</li>');

  return html;
};
