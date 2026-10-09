import 'server-only';

// Read at request time so builds do not need a production credential.
export function getPdfExtractorApiKey(): string {
  const apiKey = process.env.PDF_EXTRACTOR_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error('PDF_EXTRACTOR_API_KEY is not configured');
  }
  return apiKey;
}
