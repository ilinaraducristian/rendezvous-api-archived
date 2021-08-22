import { createHash } from 'crypto';

function md5(payload: string) {
  return createHash('md5').update(payload).digest('hex');
}

export default md5;