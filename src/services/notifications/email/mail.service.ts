import { config } from '@/config';
import { AppError, ExternalServiceError } from '@/utils';
import logger from '@/utils/logger';
import { templateEngine } from '@/utils/mail.engine';
import fs from 'fs/promises';
import nodemailer from 'nodemailer';
import path from 'path';

class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private async initTransporter(): Promise<void> {
    const { smtp } = config;
    if (smtp.password && smtp.user) {
      try {
        this.transporter = nodemailer.createTransport({
          host: smtp.host,
          port: smtp.port,
          auth: { user: smtp.user, pass: smtp.password },
          secure: smtp.secure,
          pool: true,
          logger: smtp.logger,
          debug: smtp.debug,
        });
        this.transporter.verify(function (error, _success) {
          if (error) {
            if (error) {
              logger.error('SMTP connection failed', {
                error: error.message,
                code: (error as any).code,
              });
            } else {
              logger.info('SMTP connection established');
            }
          }
        });
      } catch (error: any) {
        logger.error('SMTP connection failed', {
          error: error.message,
          code: error.code,
        });
      }
    } else {
      logger.warn('SMTP credentials was not initialized');
    }
  }

  private checkMailTransporterConfig(): boolean {
    if (!this.transporter) {
      logger.error('SMTP not initialized yet!', { service: 'Mail Service' });
      return false;
    }
    return true;
  }

  private async wrapInLayout(content: string): Promise<string> {
    const layoutPath = path.join(
      process.cwd(),
      'src',
      'templates',
      'emails',
      'layout',
      'base.html',
    );

    const layoutContent = await fs.readFile(layoutPath, 'utf-8');

    const wraped = layoutContent.replace('{{content}}', content);

    return wraped;
  }

  private async sendTemplateEmail(
    to: string,
    subject: string,
    templateName: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      if (!this.checkMailTransporterConfig()) {
        logger.error('SMTP not initialized yet!', { service: 'Mail Service' });
        throw new ExternalServiceError(
          'Failed to send email',
          'email:smtp service',
        );
      }

      logger.info(`Sending ${templateName} email to ${to} subject ${subject}`);

      const htmlContent = await templateEngine.render(
        templateName,
        data,
        '.html',
      );
      const html = await this.wrapInLayout(htmlContent);
      const text = await templateEngine.render(templateName, data, '.txt');

      logger.info('Rendered content', {
        html,
        text,
      });

      const sent = await this.transporter!.sendMail({
        from: `Linkora <${config.smtp.from}>`,
        to,
        subject,
        html,
        text,
      });

      if (sent.rejected && sent.rejected.length > 0) {
        logger.warn('Email Rejected', {
          to,
          subject,
          rejected: sent.rejected,
          response: sent.response,
        });
      }
      logger.info('Sended email result', sent);
    } catch (error) {
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    data: {
      verificationToken: string;
      name: string;
    },
  ): Promise<void> {
    try {
      await this.sendTemplateEmail(
        email,
        'Email verification',
        'verification',
        {
          name: data.name,
          verificationUrl: `${config.frontendUrl}/auth/verify-email?token=${data.verificationToken}`,
        },
      );
    } catch (error: any) {
      logger.error(`Failed to send verification email to: ${email}`, {
        data,
        ...error,
      });
      if (error instanceof AppError) {
        throw error;
      }
      throw new ExternalServiceError(
        'Failed to send verification',
        'email:smtp service',
      );
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    try {
      await this.sendTemplateEmail(email, 'Welcome to Linkora', 'welcome', {
        name: username,
        dashboardUrl: `${config.frontendUrl}/dashboard`,
      });
    } catch (error: any) {
      logger.error(`Failed to send welcome email to: ${email}`, {
        username,
        ...error,
      });
      if (error instanceof AppError) {
        throw error;
      }
      throw new ExternalServiceError(
        'Failed to send welcome email',
        'email:smtp service',
      );
    }
  }
}

export const mailService = new MailService();
