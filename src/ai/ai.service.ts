// Dependencies
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import OpenAI from 'openai';
import { ChatOpenAI } from '@langchain/openai';
import { getBlogPromptTemplate } from './prompts/blog.prompt';

export interface GenerateBlogInput {
  prompt: string;
  keywords?: string[];
  language?: string;
  tone?: string;
  audience?: string;
}

export interface GeneratedBlogOutput {
  title: string;
  slug: string;
  description: string;
  content: string;
  metaTags: string[];
  imageBase64?: string;
  imageFilename?: string;
  socialLinkedin?: string;
  socialInstagram?: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateBlogPost(
    input: GenerateBlogInput,
  ): Promise<GeneratedBlogOutput> {
    try {
      // LangChain LLM (configurável por env)
      const chatModel = (process.env.OPENAI_CHAT_MODEL || 'gpt-5').trim();
      this.logger.log(`Chat model selected: ${chatModel}`);
      let llm = new ChatOpenAI({
        model: chatModel,
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = getBlogPromptTemplate();
      let chain = prompt.pipe(llm);
      let response;
      try {
        response = await chain.invoke({ userPrompt: input.prompt });
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (
          msg.includes('model_not_found') ||
          msg.includes('does not have access to model')
        ) {
          const fallback = 'gpt-5';
          this.logger.warn(
            `Model '${chatModel}' unavailable. Falling back to '${fallback}'.`,
          );
          llm = new ChatOpenAI({
            model: fallback,
            apiKey: process.env.OPENAI_API_KEY,
          });
          chain = prompt.pipe(llm);
          response = await chain.invoke({ userPrompt: input.prompt });
        } else {
          throw err;
        }
      }

      const text =
        typeof response?.content === 'string'
          ? response.content
          : Array.isArray(response?.content)
            ? response.content.map((c: any) => c?.text ?? '').join('\n')
            : '';

      const parsed = this.safeJson(text || '{}');
      if (!parsed || !parsed.title || !parsed.description || !parsed.content) {
        throw new Error('Resposta inválida do modelo');
      }

      const toSlug = (txt: string) =>
        txt
          .normalize('NFD')
          .replace(/\p{Diacritic}+/gu, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 80);
      const slugCandidate =
        typeof parsed.slug === 'string' && parsed.slug.trim().length
          ? parsed.slug
          : toSlug(parsed.title);

      const imagePrompt = `${parsed.imagePrompt || parsed.title} — estilo fotográfico realista, alta qualidade, proporção 16:9`;
      this.logger.log(`AI image prompt: ${imagePrompt}`);

      // Configuração de imagens via env
      const imageEnabled =
        (process.env.AI_IMAGE_ENABLED ?? 'true').toLowerCase() !== 'false';
      const imageModel = process.env.AI_IMAGE_MODEL || 'gpt-image-1';
      const requestedSize = process.env.AI_IMAGE_SIZE || '1536x1024';
      const normalizeSize = (
        size: string,
      ): '1024x1024' | '1024x1536' | '1536x1024' | 'auto' => {
        const allowed = new Set([
          '1024x1024',
          '1024x1536',
          '1536x1024',
          'auto',
        ]);
        if (allowed.has(size)) return size as any;
        if (size === 'auto') return 'auto';
        const m = size.match(/^(\d+)x(\d+)$/i);
        if (!m) return '1536x1024';
        const w = parseInt(m[1], 10);
        const h = parseInt(m[2], 10);
        if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0)
          return '1536x1024';
        if (w === h) return '1024x1024';
        return w > h ? '1536x1024' : '1024x1536';
      };
      const imageSize = normalizeSize(requestedSize);
      if (requestedSize !== imageSize) {
        this.logger.warn(
          `AI image size '${requestedSize}' not supported; normalized to '${imageSize}'.`,
        );
      }
      this.logger.log(
        `AI image config -> enabled: ${imageEnabled}, model: ${imageModel}, size: ${imageSize}`,
      );

      let b64: string | undefined;
      let contentTypeHint: string | undefined;
      if (imageEnabled) {
        try {
          const imageRes = await this.openai.images.generate({
            model: imageModel,
            prompt: imagePrompt,
            size: imageSize,
          });
          const item = imageRes.data?.[0];
          const hasB64 = Boolean(item?.b64_json);
          const hasUrl = Boolean((item as any)?.url);
          this.logger.log(
            `AI image response -> hasB64: ${hasB64}, hasUrl: ${hasUrl}`,
          );
          if (item?.b64_json) {
            b64 = item.b64_json;
            const preview = b64.slice(0, 64);
            this.logger.log(`AI image base64 length: ${b64.length}`);
            this.logger.log(`AI native image (b64 head): ${preview}...`);
            // explicit console.log as requested

            console.log(
              `[AiService] AI native image (b64 head): ${preview}...`,
            );
          } else if ((item as any)?.url) {
            const url: string = (item as any).url;
            this.logger.log(`AI image provided URL. Fetching: ${url}`);
            const res = await fetch(url);
            contentTypeHint = res.headers.get('content-type') || undefined;
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const arrayBuf = await res.arrayBuffer();
            b64 = Buffer.from(arrayBuf).toString('base64');
            const preview = b64.slice(0, 64);
            this.logger.log(
              `AI image fetched from URL; base64 length: ${b64.length}; type: ${contentTypeHint ?? 'unknown'}`,
            );
            this.logger.log(`AI native image (b64 head): ${preview}...`);

            console.log(
              `[AiService] AI native image (b64 head): ${preview}...`,
            );
          }
        } catch (imgErr) {
          // Evita poluir logs quando o recurso não está habilitado no org
          const msg = String(imgErr ?? 'unknown error');
          if (msg.includes('must be verified') || msg.includes('403')) {
            this.logger.log('Image generation not available; skipping cover.');
          } else {
            this.logger.warn(`Image generation skipped: ${msg}`);
          }
        }
      } else {
        this.logger.log(
          'AI image generation disabled by env (AI_IMAGE_ENABLED=false).',
        );
      }

      // Placeholder fallback (remote image or tiny PNG)
      const placeholderEnabled =
        (process.env.AI_IMAGE_PLACEHOLDER ?? 'true').toLowerCase() !== 'false';
      if (!b64 && placeholderEnabled) {
        const sizeStr = imageSize === 'auto' ? '1200x630' : imageSize;
        const [w, h] = sizeStr.split('x').map((n) => parseInt(n, 10));
        // 1) Try remote placeholder (if configured or default allowed)
        try {
          const text = encodeURIComponent(
            (parsed.title || 'Houser Blog').slice(0, 60),
          );
          const defaultUrl = `https://via.placeholder.com/${w}x${h}.jpg?text=${text}`;
          const url = process.env.AI_IMAGE_PLACEHOLDER_URL || defaultUrl;
          this.logger.log(`Fetching placeholder cover from: ${url}`);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arrayBuf = await res.arrayBuffer();
          b64 = Buffer.from(arrayBuf).toString('base64');
          this.logger.log(
            `Placeholder cover fetched: ${b64.length} base64 chars`,
          );
        } catch (phErr) {
          // 2) Generate local SVG placeholder (no network), then base64 it
          this.logger.warn(
            `Failed to fetch placeholder cover, generating SVG placeholder. Reason: ${phErr}`,
          );
          const title = String(parsed.title || 'Houser Blog');
          const safeTitle = title.replace(/[<>]/g, '').slice(0, 80);
          const bg = '#0e1116';
          const fg = '#e6edf3';
          const accent = '#2ea043';
          const fontSize = Math.max(24, Math.min(48, Math.floor(w / 24)));
          const svg =
            `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
            `<rect width="100%" height="100%" fill="${bg}"/>` +
            `<g font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif">` +
            `<text x="40" y="${Math.floor(h / 2)}" fill="${fg}" font-size="${fontSize}" font-weight="700">${safeTitle}</text>` +
            `<text x="40" y="${Math.floor(h / 2) + fontSize + 20}" fill="${accent}" font-size="${Math.max(14, Math.floor(fontSize * 0.6))}" font-weight="500">Houser Blog</text>` +
            `</g>` +
            `</svg>`;
          b64 = Buffer.from(svg, 'utf8').toString('base64');
          this.logger.log(
            `SVG placeholder generated: ${b64.length} base64 chars`,
          );
          // Override filename to .svg downstream
          // We'll set filename later when assembling output
        }
      }
      if (!b64 && !placeholderEnabled) {
        this.logger.log(
          'AI image placeholder disabled by env (AI_IMAGE_PLACEHOLDER=false); no cover will be attached.',
        );
      }

      // Decide filename by magic number
      const inferExt = (
        b64data?: string,
        typeHint?: string,
      ): 'png' | 'jpg' | 'svg' | undefined => {
        if (!b64data) return undefined;
        if (typeHint) {
          if (typeHint.includes('jpeg')) return 'jpg';
          if (typeHint.includes('png')) return 'png';
          if (typeHint.includes('svg')) return 'svg';
        }
        if (b64data.startsWith('iVBOR')) return 'png'; // PNG
        if (b64data.startsWith('/9j/')) return 'jpg'; // JPEG
        if (b64data.startsWith('PHN2Zy')) return 'svg'; // '<svg' base64
        return 'png';
      };
      const ext = inferExt(b64, contentTypeHint);

      const output: GeneratedBlogOutput = {
        title: parsed.title,
        slug: slugCandidate,
        description: parsed.description,
        content: parsed.content,
        metaTags: Array.isArray(parsed.metaTags) ? parsed.metaTags : [],
        imageBase64: b64,
        imageFilename: b64 && ext ? `cover.${ext}` : undefined,
        socialLinkedin:
          typeof parsed.socialLinkedin === 'string'
            ? parsed.socialLinkedin
            : undefined,
        socialInstagram:
          typeof parsed.socialInstagram === 'string'
            ? parsed.socialInstagram
            : undefined,
      };
      return output;
    } catch (error) {
      this.logger.error('Failed to generate blog post', error || error);
      throw new InternalServerErrorException('Falha ao gerar post com IA');
    }
  }

  private safeJson(text: string): any {
    try {
      const cleaned = text.trim().replace(/^```json\n?|```$/g, '');
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}
