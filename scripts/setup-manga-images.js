const fs = require('fs');
const path = require('path');

// URLs públicas de imagens (exemplos de APIs gratuitas)
const mangaImageUrls = {
  'one-piece': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'naruto': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'dragon-ball': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'attack-on-titan': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'demon-slayer': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'my-hero-academia': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'jujutsu-kaisen': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'tokyo-ghoul': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'death-note': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'fullmetal-alchemist': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'hunter-x-hunter': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'bleach': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'one-punch-man': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'mob-psycho-100': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'chainsaw-man': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'spy-x-family': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'the-promised-neverland': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'dr-stone': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'black-clover': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'fire-force': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'tokyo-revengers': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'haikyuu': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'kaguya-sama': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'seven-deadly-sins': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'boruto': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'solo-leveling': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'tower-of-god': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'god-of-high-school': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'unordinary': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format',
  'lookism': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop&auto=format'
};

// Atualizar os dados mockados com URLs reais
const updateMockData = () => {
  const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockMangas.ts');
  
  let content = fs.readFileSync(mockDataPath, 'utf8');
  
  // Substituir as URLs das capas
  Object.entries(mangaImageUrls).forEach(([mangaName, url]) => {
    const oldPattern = `capa: "/images/mangas/${mangaName}.jpg"`;
    const newPattern = `capa: "${url}"`;
    content = content.replace(oldPattern, newPattern);
  });
  
  fs.writeFileSync(mockDataPath, content);
  console.log('✅ Mock data updated with real image URLs');
};

// Executar
updateMockData();
console.log('🎉 Setup completed! Images will now load from external URLs with SVG fallback.');
