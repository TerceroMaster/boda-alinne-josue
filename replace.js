const fs = require('fs');
let c = fs.readFileSync('src/components/EventAlbum.jsx', 'utf8');

c = c.replace(
  /<img\s+src=\{`\$\{post\.media_url\}\?t=\$\{Date\.now\(\)\}`\}\s+alt=\{post\.title\}\s+style=\{\{\s*width:\s*'100%',\s*height:\s*'100%',\s*objectFit:\s*'cover'\s*\}\}\s*\/>/gs,
  `{post.media_type === 'video' ? (
                  <video 
                    src={\`${post.media_url}#t=0.1\`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={\`${post.media_url}?t=\${Date.now()}\`} 
                    alt={post.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}`
);

fs.writeFileSync('src/components/EventAlbum.jsx', c);
