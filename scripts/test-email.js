const emailService = require('../src/services/emailService.ts');

async function testEmail() {
  try {
    console.log('🧪 Testando envio de email...');
    
    const result = await emailService.sendEmailConfirmation(
      'teste@exemplo.com',
      'Usuário Teste',
      'token-teste-123'
    );
    
    if (result) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log('❌ Falha ao enviar email');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testEmail();
