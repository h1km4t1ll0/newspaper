import { OutputData } from '@editorjs/editorjs';
import { BlockTuneData } from '@editorjs/editorjs/types/block-tunes/block-tune-data';
import { OutputBlockData } from '@editorjs/editorjs/types/data-formats/output-data';

export type QuestionOutputBlockData = {
  id?: string;
  type: 'questionLink';
  data: {
    questionIndex: number
  }
  tunes?: { [name: string]: BlockTuneData };
};

export type QuestionBlockData = {
  questionIndex: number
};

const isOutputData = (data: unknown): data is OutputData => Boolean(data && typeof data === 'object' && 'blocks' in data);

export const isQuestionOutputBlock = (block: OutputBlockData): block is QuestionOutputBlockData => Boolean(block.type === 'questionLink');

export const isQuestionBlockData = (data: unknown): data is QuestionBlockData => Boolean(data && typeof data === 'object' && 'questionIndex' in data);

export default isOutputData;
