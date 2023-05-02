import { ApplicationError } from '@/protocols';

export function forbiddenError(): ApplicationError {
  return {
    name: 'ForbiddenError',
    message: 'You are not authorized to continue this operation',
  };
}
