import fs from 'fs/promises';
import path from 'path';

const mailTemplatesDir = path.join(process.cwd(), 'src', 'templates', 'emails');

// replace {{variable}} to actual value
function interpolate(template: string, data: Record<string, any>): string {
  return template.replace(/{{(.*?)}}/g, function (match, key) {
    return data[key] !== undefined ? data[key] : match;
  });
}

// render template

/**
 * Render template
 * @param templateName template name
 * @param data Record<string, any>
 * @param ext file extension .txt or .html
 * @returns Promise<string>
 */
async function render(
  templateName: string,
  data: Record<string, any>,
  ext: '.html' | '.txt',
): Promise<string> {
  const templateFile = templateName.concat(ext);
  const content = await fs.readFile(
    path.join(mailTemplatesDir, templateFile),
    'utf-8',
  );
  return interpolate(content, data);
}

export const templateEngine = { render };
