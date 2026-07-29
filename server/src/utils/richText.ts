interface TipTapNode {
  type?: string;
  text?: string;
  content?: TipTapNode[];
}

export function extractPlainText(doc: unknown): string {
  const node = doc as TipTapNode;
  if (!node || typeof node !== 'object') return '';

  let text = node.text ?? '';
  if (Array.isArray(node.content)) {
    text += node.content.map(extractPlainText).join(' ');
  }
  return text.trim();
}

export function countWords(plainText: string): number {
  return plainText.split(/\s+/).filter(Boolean).length;
}
