const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// URLs públicas de imagens dos mangás (exemplos)
const mangaImages = {
  'one-piece': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'naruto': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'dragon-ball': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'attack-on-titan': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'demon-slayer': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'my-hero-academia': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'jujutsu-kaisen': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'tokyo-ghoul': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'death-note': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg',
  'fullmetal-alchemist': 'https://mangadex.org/covers/32f76b47-6a74-4eae-9f75-05b6a5c24315/4a8b0b5a-8b0c-4b8d-9c8d-8b0c4b8d9c8d.jpg'
};

// URLs alternativas usando APIs públicas
const alternativeUrls = {
  'one-piece': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'naruto': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'dragon-ball': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'attack-on-titan': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'demon-slayer': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'my-hero-academia': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'jujutsu-kaisen': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'tokyo-ghoul': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'death-note': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
  'fullmetal-alchemist': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop'
};

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filename);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download: ${url} (Status: ${response.statusCode})`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filename, () => {}); // Delete the file on error
      console.log(`❌ Error downloading ${url}: ${err.message}`);
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  const imagesDir = path.join(__dirname, '..', 'public', 'images', 'mangas');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  console.log('🚀 Starting image download...');
  
  for (const [mangaName, url] of Object.entries(mangaImages)) {
    const filename = path.join(imagesDir, `${mangaName}.jpg`);
    
    try {
      await downloadImage(url, filename);
    } catch (error) {
      console.log(`🔄 Trying alternative URL for ${mangaName}...`);
      try {
        await downloadImage(alternativeUrls[mangaName], filename);
      } catch (altError) {
        console.log(`❌ Failed to download ${mangaName} from both URLs`);
      }
    }
  }
  
  console.log('🎉 Download process completed!');
};

// Run the download
downloadAllImages().catch(console.error);
