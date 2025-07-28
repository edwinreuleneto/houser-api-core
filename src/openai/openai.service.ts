// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import 'isomorphic-fetch';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly baseUrl = 'https://api.openai.com/v1';
  private readonly apiKey = process.env.OPENAI_API_KEY as string;

  async extractContractData(text: string) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content:
                'Extraia nome da empresa, descrição, site, data de início e data de término do contrato do texto a seguir e responda em JSON com as chaves companyName, description, website, startDate, endDate.',
            },
            { role: 'user', content: text },
          ],
        }),
      });
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '{}';
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to extract contract data', error.stack);
      throw new InternalServerErrorException('Failed to extract contract data');
    }
  }
}
