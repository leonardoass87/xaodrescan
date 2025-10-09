// Script para testar a API de DELETE de capítulos
const fetch = require('node-fetch');

async function testDeleteAPI() {
  try {
    console.log('🧪 Testando API de DELETE de capítulos...');
    
    // Simular uma chamada DELETE para o capítulo 4 do mangá 4
    const response = await fetch('http://localhost:3000/api/mangas/4/capitulo/4', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Adicionar token de autenticação se necessário
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta da API:', data);
    } else {
      const error = await response.text();
      console.log('❌ Erro da API:', error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testDeleteAPI();
