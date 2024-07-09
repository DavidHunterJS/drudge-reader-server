// linkRoutes.test.ts
import request from 'supertest';
import express from 'express';
import linkRoutes from './linkRoutes';
import { checkLinkChanges } from '../helpers/LinkCompare';

// Mock the checkLinkChanges function
jest.mock('../helpers/LinkCompare', () => ({
  checkLinkChanges: jest.fn()
}));

const app = express();
app.use(express.json());
app.use('/api', linkRoutes);

describe('Link Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle POST /link-changes and return hasChanges', async () => {
    // Mock data
    const currentLinks = ['http://example.com', 'http://test.com'];
    
    // Mock the checkLinkChanges function to return true
    (checkLinkChanges as jest.Mock).mockReturnValue(true);

    const response = await request(app)
      .post('/api/link-changes')
      .send({ currentLinks })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({ hasChanges: true });
    expect(checkLinkChanges).toHaveBeenCalledWith(currentLinks);
  });

  it('should handle POST /link-changes when there are no changes', async () => {
    // Mock data
    const currentLinks = ['http://example.com', '