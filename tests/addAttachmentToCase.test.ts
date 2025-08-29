import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import nock from 'nock';
import { addAttachmentToCase } from '../src/services/testrailService';
import { config } from '../src/config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('testrailService.addAttachmentToCase', () => {
  const baseApi = `${config.TESTRAIL_URL}`;
  const apiPath = '/index.php?/api/v2';
  let tempFilePath: string;

  beforeEach(() => {
    nock.disableNetConnect();
    
    // Create a temporary test file
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, 'test-attachment.txt');
    fs.writeFileSync(tempFilePath, 'This is a test attachment content');
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
    
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  });

  it('successfully uploads attachment to case', async () => {
    const caseId = 123;
    const attachmentId = 443;

    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(200, {
        attachment_id: attachmentId,
      });

    const result = await addAttachmentToCase(caseId, tempFilePath);
    
    expect(result).toEqual({
      attachment_id: attachmentId,
    });
    scope.done();
  });

  it('handles different file types', async () => {
    const caseId = 456;
    const attachmentId = 789;
    
    // Create a different type of test file
    const imagePath = path.join(os.tmpdir(), 'test-image.png');
    fs.writeFileSync(imagePath, 'fake png content');

    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(200, {
        attachment_id: attachmentId,
      });

    const result = await addAttachmentToCase(caseId, imagePath);
    
    expect(result).toEqual({
      attachment_id: attachmentId,
    });
    scope.done();
    
    // Clean up
    fs.unlinkSync(imagePath);
  });

  it('throws on 404 - case not found', async () => {
    const caseId = 9999;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(404, { error: 'not found' });

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'not_found' 
    });
    scope.done();
  });

  it('throws on authentication error', async () => {
    const caseId = 123;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(401, { error: 'unauthorized' });

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'auth' 
    });
    scope.done();
  });

  it('throws on permission error', async () => {
    const caseId = 123;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(403, { error: 'forbidden' });

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'auth' 
    });
    scope.done();
  });

  it('throws on rate limit error', async () => {
    const caseId = 123;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(429, { error: 'too many requests' });

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'rate_limited' 
    });
    scope.done();
  });

  it('throws on server error', async () => {
    const caseId = 123;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(500, { error: 'internal server error' });

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'server' 
    });
    scope.done();
  });

  it('throws on network error', async () => {
    const caseId = 123;
    
    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .replyWithError('Network error');

    await expect(addAttachmentToCase(caseId, tempFilePath)).rejects.toMatchObject({ 
      type: 'network' 
    });
    scope.done();
  });

  it('throws when file does not exist', async () => {
    const caseId = 123;
    const nonExistentPath = '/path/to/nonexistent/file.txt';

    await expect(addAttachmentToCase(caseId, nonExistentPath)).rejects.toThrow();
  });

  it('handles file path with special characters', async () => {
    const caseId = 123;
    const attachmentId = 444;
    
    // Create a file with special characters in the name
    const specialPath = path.join(os.tmpdir(), 'test-file with spaces & symbols.txt');
    fs.writeFileSync(specialPath, 'content with special chars');

    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(200, {
        attachment_id: attachmentId,
      });

    const result = await addAttachmentToCase(caseId, specialPath);
    
    expect(result).toEqual({
      attachment_id: attachmentId,
    });
    scope.done();
    
    // Clean up
    fs.unlinkSync(specialPath);
  });

  it('handles large files', async () => {
    const caseId = 123;
    const attachmentId = 555;
    
    // Create a larger test file (1MB)
    const largeFilePath = path.join(os.tmpdir(), 'large-test-file.txt');
    const largeContent = 'x'.repeat(1024 * 1024); // 1MB
    fs.writeFileSync(largeFilePath, largeContent);

    const scope = nock(baseApi)
      .post(`${apiPath}/add_attachment_to_case/${caseId}`)
      .reply(200, {
        attachment_id: attachmentId,
      });

    const result = await addAttachmentToCase(caseId, largeFilePath);
    
    expect(result).toEqual({
      attachment_id: attachmentId,
    });
    scope.done();
    
    // Clean up
    fs.unlinkSync(largeFilePath);
  });
});
