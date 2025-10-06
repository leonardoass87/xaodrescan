import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuração do transporter com fallback automático
    this.transporter = this.createTransporterWithFallback();
  }

  private createTransporterWithFallback(): nodemailer.Transporter {
    // Tentar configuração TLS primeiro (porta 587)
    const tlsConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    // Tentar configuração SSL como fallback (porta 465)
    const sslConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    };

    // Retornar transporter TLS por padrão, mas com método de fallback
    return nodemailer.createTransport(tlsConfig);
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password/confirm?token=${resetToken}`;
      
      // Em modo de desenvolvimento sem SMTP configurado, apenas logar o email
      if (process.env.NODE_ENV === 'development' && !process.env.SMTP_USER) {
        console.log('📧 [DEV] Email seria enviado para:', email);
        console.log('🔗 [DEV] Link:', resetUrl);
        return true;
      }
      
      const mailOptions = {
        from: `"XaoDRescan" <${process.env.SMTP_USER || 'noreply@xaodrescan.com'}>`,
        to: email,
        subject: '🔐 Redefinir sua senha - XaoDRescan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 XaoDRescan</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0 0;">Redefinição de Senha</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta no XaoDRescan.
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;">
                  🔑 Redefinir Senha
                </a>
              </div>
              
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Ou copie e cole este link no seu navegador:<br>
                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⚠️ <strong>Importante:</strong> Este link expira em 1 hora por motivos de segurança.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Se você não solicitou esta redefinição, pode ignorar este email com segurança.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Este é um email automático, por favor não responda.<br>
                © 2024 XaoDRescan - Todos os direitos reservados
              </p>
            </div>
          </div>
        `
      };

      try {
        // Tentar envio com configuração atual
        await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email enviado para: ${email}`);
        return true;
      } catch (firstError) {
        console.log('⚠️ Tentando fallback SSL...');
        
        try {
          // Tentar com configuração SSL (porta 465)
          const sslTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.SMTP_USER || '',
              pass: process.env.SMTP_PASS || ''
            }
          });
          
          await sslTransporter.sendMail(mailOptions);
          console.log(`✅ Email enviado via SSL para: ${email}`);
          return true;
        } catch (secondError) {
          console.error('❌ Falha no envio de email:', (secondError as Error).message);
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email:', (error as Error).message);
      return false;
    }
  }

  async sendPasswordResetConfirmation(email: string, userName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"XaoDRescan" <${process.env.SMTP_USER || 'noreply@xaodrescan.com'}>`,
        to: email,
        subject: '✅ Senha redefinida com sucesso - XaoDRescan',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ XaoDRescan</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0 0;">Senha Redefinida</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Olá, ${userName}!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Sua senha foi redefinida com sucesso! 🎉
              </p>
              
              <p style="color: #666; line-height: 1.6;">
                Agora você pode fazer login com sua nova senha.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login" 
                   style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 25px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;">
                  🚀 Fazer Login
                </a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⚠️ <strong>Segurança:</strong> Se você não fez esta alteração, entre em contato conosco imediatamente.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Este é um email automático, por favor não responda.<br>
                © 2024 XaoDRescan - Todos os direitos reservados
              </p>
            </div>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email de confirmação enviado para: ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email de confirmação:', (error as Error).message);
      return false;
    }
  }
}

export default new EmailService();
