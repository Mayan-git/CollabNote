import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { aiService } from '../services/ai.service';
import { noteService } from '../services/note.service';
import { extractPlainText } from '../utils/richText';

function uid(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

async function getNoteText(noteId: string, userId: string): Promise<string> {
  const { note } = await noteService.getById(noteId, userId);
  const text = note.plainText || extractPlainText(note.content);
  if (!text.trim()) throw ApiError.badRequest('Note has no content to process');
  return text;
}

export const summarize = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.summarize(text);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const fixGrammar = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.fixGrammar(text);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const rewrite = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const style = String(req.body.style ?? 'professional');
  const result = await aiService.rewrite(text, style);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const translate = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const targetLanguage = String(req.body.targetLanguage ?? 'Spanish');
  const result = await aiService.translate(text, targetLanguage);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const generateTitle = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.generateTitle(text);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const generateTags = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.generateTags(text);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const generateMeetingNotes = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.generateMeetingNotes(text);
  res.status(200).json(new ApiResponse(200, { result }));
});

export const extractActionItems = asyncHandler(async (req: Request, res: Response) => {
  const text = await getNoteText(req.params.id, uid(req));
  const result = await aiService.extractActionItems(text);
  res.status(200).json(new ApiResponse(200, { result }));
});
