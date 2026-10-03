const fs = require('fs');

let c = fs.readFileSync('src/components/EventAlbum.jsx', 'utf8');

c = c.replace(/'events_mtfd'/g, "'wedding_events'");
c = c.replace(/Alinne & Josue/g, 'Josué & Mónica');
c = c.replace(/Alinne y Josue/g, 'Josué y Mónica');

c = c.replace(
  /const fetchPosts = async \(\) => \{[\s\S]+?subscribe\(\);/,
  `const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('wedding_media')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const visiblePosts = data.filter(p => 
          p.title !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
          p.title !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
          p.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
          p.guest_name !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
          (p.media_type === 'image' || p.media_type === 'video')
        );
        setPosts(visiblePosts);
      } catch (error) {
        console.error('Error fetching album posts:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const channel = supabase
      .channel('public:wedding_media:event=' + event.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wedding_media', filter: 'event_id=eq.' + event.id }, payload => {
        if (payload.eventType === 'INSERT') {
          if (
            payload.new.title !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
            payload.new.title !== 'BACKGROUND_PICTURE_SYSTEM_RECORD' &&
            payload.new.guest_name !== 'PROFILE_PICTURE_SYSTEM_RECORD' && 
            (payload.new.media_type === 'image' || payload.new.media_type === 'video')
          ) {
            setPosts(current => [payload.new, ...current]);
          }
        } else if (payload.eventType === 'DELETE') {
          setPosts(current => current.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();`
);

c = c.replace(
  /<img\s+src=\{`\$\{post\.media_url\}\?t=\$\{Date\.now\(\)\}`\}\s+alt=\{post\.title\}\s+style=\{\{\s*width:\s*'100%',\s*height:\s*'100%',\s*objectFit:\s*'cover'\s*\}\}\s*\/>/s,
  `{post.media_type === 'video' ? (
                  <video 
                    src={\`\${post.media_url}#t=0.1\`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preload="metadata"
                    muted
                    playsInline
                  />
                ) : (
                  <img 
                    src={\`\${post.media_url}?t=\${Date.now()}\`} 
                    alt={post.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}`
);

c = c.replace(/\(Los videos se ven en la Galería 3D\)/, "");

fs.writeFileSync('src/components/EventAlbum.jsx', c, 'utf8');
