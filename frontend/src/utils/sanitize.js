// frontend/src/utils/sanitize.js
import sanitizeHtml from 'sanitize-html';

export function sanitizeContent(content) {
  return sanitizeHtml(content, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'ul', 'ol', 'li', 'br', 'span', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      span: ['style']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {},
    allowedStyles: {
      '*': {
        // Allow color and font-size styles
        'color': [/^.*$/],
        'font-size': [/^.*$/]
      }
    }
  });
}
