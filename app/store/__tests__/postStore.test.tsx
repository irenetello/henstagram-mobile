import { beforeEach, describe, expect, it } from 'vitest';
import { usePostsStore } from '../postsStore';

describe('postsStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    usePostsStore.getState().resetPosts();
  });

  it('addPost adds a post at the top', () => {
    const initialLength = usePostsStore.getState().posts.length;
    
    const newPost = usePostsStore.getState().addPost({
      imageUrl: 'https://example.com/test.jpg',
      caption: 'Test caption',
      authorName: 'TestUser',
    });

    const { posts } = usePostsStore.getState();
    
    expect(posts.length).toBe(initialLength + 1);
    expect(posts[0]).toEqual(newPost);
    expect(posts[0].caption).toBe('Test caption');
    expect(posts[0].authorName).toBe('TestUser');
    expect(posts[0].likesCount).toBe(0);
  });

  it('addPost uses CURRENT_USER when authorName is not provided', () => {
    const newPost = usePostsStore.getState().addPost({
      imageUrl: 'https://example.com/test.jpg',
      caption: 'Test without author',
    });

    expect(newPost.authorName).toBe('Irene');
  });

  it('addPost trims caption whitespace', () => {
    const newPost = usePostsStore.getState().addPost({
      imageUrl: 'https://example.com/test.jpg',
      caption: '  Test with spaces  ',
    });

    expect(newPost.caption).toBe('Test with spaces');
  });

  it('getPostById returns the correct post', () => {
    const newPost = usePostsStore.getState().addPost({
      imageUrl: 'https://example.com/test.jpg',
      caption: 'Findable post',
    });

    const found = usePostsStore.getState().getPostById(newPost.id);

    expect(found).toBeDefined();
    expect(found?.id).toBe(newPost.id);
    expect(found?.caption).toBe('Findable post');
  });

  it('getPostById returns undefined for non-existent id', () => {
    const found = usePostsStore.getState().getPostById('non-existent-id');

    expect(found).toBeUndefined();
  });

  it('resetPosts restores seed posts', () => {
    // Add a new post
    usePostsStore.getState().addPost({
      imageUrl: 'https://example.com/test.jpg',
      caption: 'Extra post',
    });

    const beforeReset = usePostsStore.getState().posts.length;
    expect(beforeReset).toBeGreaterThan(3);

    // Reset
    usePostsStore.getState().resetPosts();

    const { posts } = usePostsStore.getState();
    expect(posts.length).toBe(3);
    expect(posts[0].caption).toBe('First memory ✨');
  }); 
});