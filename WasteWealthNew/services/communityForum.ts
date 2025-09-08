import { Alert } from 'react-native';
import api from './api';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  isPinned: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  userLiked?: boolean;
  userSaved?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  isAuthor: boolean;
  createdAt: Date;
  userLiked?: boolean;
}

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  isPublic: boolean;
}

class CommunityForumService {
  private posts: ForumPost[] = [];
  private categories: ForumCategory[] = [];
  private userSavedPosts: string[] = [];

  async initialize() {
    await this.loadCategories();
    await this.loadSavedPosts();
  }

  async loadCategories(): Promise<ForumCategory[]> {
    try {
      const response = await api.get('/forum/categories');
      this.categories = response.data.categories;
      return this.categories;
    } catch (error) {
      console.error('Error loading forum categories:', error);
      return [];
    }
  }

  async loadPosts(
    categoryId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ForumPost[]> {
    try {
      const endpoint = categoryId 
        ? `/forum/posts?category=${categoryId}&page=${page}&limit=${limit}`
        : `/forum/posts?page=${page}&limit=${limit}`;
      
      const response = await api.get(endpoint);
      const newPosts = response.data.posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));

      if (page === 1) {
        this.posts = newPosts;
      } else {
        this.posts = [...this.posts, ...newPosts];
      }

      return this.posts;
    } catch (error) {
      console.error('Error loading forum posts:', error);
      return [];
    }
  }

  async loadSavedPosts(): Promise<string[]> {
    try {
      const response = await api.get('/forum/saved-posts');
      this.userSavedPosts = response.data.savedPosts;
      return this.userSavedPosts;
    } catch (error) {
      console.error('Error loading saved posts:', error);
      return [];
    }
  }

  async createPost(
    title: string,
    content: string,
    category: string,
    tags: string[] = []
  ): Promise<string | null> {
    try {
      const response = await api.post('/forum/posts', {
        title,
        content,
        category,
        tags,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Post created successfully!');
        return response.data.postId;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
      return null;
    }
  }

  async addComment(postId: string, content: string): Promise<boolean> {
    try {
      const response = await api.post(`/forum/posts/${postId}/comments`, {
        content,
      });

      if (response.data.success) {
        // Update local post comment count
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this.posts[postIndex].comments += 1;
        }
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add comment');
      return false;
    }
  }

  async likePost(postId: string): Promise<boolean> {
    try {
      const response = await api.post(`/forum/posts/${postId}/like`);
      
      if (response.data.success) {
        // Update local post like count
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this.posts[postIndex].likes += response.data.liked ? 1 : -1;
          this.posts[postIndex].userLiked = response.data.liked;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error liking post:', error);
      return false;
    }
  }

  async savePost(postId: string): Promise<boolean> {
    try {
      const response = await api.post(`/forum/posts/${postId}/save`);
      
      if (response.data.success) {
        if (response.data.saved) {
          this.userSavedPosts.push(postId);
        } else {
          this.userSavedPosts = this.userSavedPosts.filter(id => id !== postId);
        }
        
        // Update local post saved status
        const postIndex = this.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          this.posts[postIndex].userSaved = response.data.saved;
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving post:', error);
      return false;
    }
  }

  async searchPosts(query: string, category?: string): Promise<ForumPost[]> {
    try {
      const endpoint = category 
        ? `/forum/search?q=${encodeURIComponent(query)}&category=${category}`
        : `/forum/search?q=${encodeURIComponent(query)}`;
      
      const response = await api.get(endpoint);
      return response.data.posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  async getPostComments(postId: string): Promise<ForumComment[]> {
    try {
      const response = await api.get(`/forum/posts/${postId}/comments`);
      return response.data.comments.map((comment: any) => ({
        ...comment,
        createdAt: new Date(comment.createdAt),
      }));
    } catch (error) {
      console.error('Error loading comments:', error);
      return [];
    }
  }

  async reportPost(postId: string, reason: string): Promise<boolean> {
    try {
      const response = await api.post(`/forum/posts/${postId}/report`, { reason });
      
      if (response.data.success) {
        Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error reporting post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to report post');
      return false;
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/forum/posts/${postId}`);
      
      if (response.data.success) {
        Alert.alert('Success', 'Post deleted successfully!');
        this.posts = this.posts.filter(post => post.id !== postId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete post');
      return false;
    }
  }

  getPopularTags(): string[] {
    const allTags = this.posts.flatMap(post => post.tags);
    const tagCounts: { [tag: string]: number } = {};
    
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  isPostSaved(postId: string): boolean {
    return this.userSavedPosts.includes(postId);
  }

  // Get posts by category
  getPostsByCategory(categoryId: string): ForumPost[] {
    return this.posts.filter(post => post.category === categoryId);
  }

  // Get user's posts
  getUserPosts(userId: string): ForumPost[] {
    return this.posts.filter(post => post.authorId === userId);
  }

  // Get saved posts
  getSavedPosts(): ForumPost[] {
    return this.posts.filter(post => this.userSavedPosts.includes(post.id));
  }
}

export const communityForumService = new CommunityForumService();