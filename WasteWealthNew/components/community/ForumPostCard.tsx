import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, IconButton, Menu, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ForumPost } from '../../services/communityForum';
import { formatDate, calculateTimeAgo } from '../../utils/calculations';
// import { multilingualService } from '../../utils/multilingual';

interface ForumPostCardProps {
  post: ForumPost;
  onPress: (postId: string) => void;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  onReport?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
  isOwner?: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
  post,
  onPress,
  onLike,
  onSave,
  onComment,
  onShare,
  onReport,
  onDelete,
  showActions = true,
  isOwner = false,
}) => {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  // Fallback colors for secondary and tertiary to replace missing ones
  const secondaryColor = '#1976d2'; // Blue
  const tertiaryColor = '#9c27b0'; // Purple

  const handleLike = () => onLike(post.id);
  const handleSave = () => onSave(post.id);
  const handleComment = () => onComment(post.id);
  const handleShare = () => onShare(post.id);
  const handleReport = () => {
    setMenuVisible(false);
    onReport?.(post.id);
  };
  const handleDelete = () => {
    setMenuVisible(false);
    onDelete?.(post.id);
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      discussion: secondaryColor,
      question: tertiaryColor,
      tip: colors.primary,
      news: colors.primary,
      event: colors.error,
      default: colors.onSurfaceDisabled,
    };
    return categoryColors[category] || categoryColors.default;
  };

  const truncateContent = (content: string, maxLength = 150): string =>
    content.length <= maxLength ? content : content.substring(0, maxLength) + '...';

  return (
    <Card style={styles.card} onPress={() => onPress(post.id)}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            <Avatar.Text
              size={40}
              label={post.authorName.charAt(0)}
              style={{ backgroundColor: getCategoryColor(post.category) }}
            />
            <View style={styles.authorDetails}>
              <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                {post.authorName}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                {calculateTimeAgo(typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString())}
              </Text>
            </View>
          </View>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton icon="dots-vertical" size={20} onPress={() => setMenuVisible(true)} />
            }
          >
            <Menu.Item onPress={handleShare} title="Share" leadingIcon="share" />
            {!isOwner && onReport && <Menu.Item onPress={handleReport} title="Report" leadingIcon="flag" />}
            {isOwner && onDelete && <Menu.Item onPress={handleDelete} title="Delete" leadingIcon="delete" />}
          </Menu>
        </View>

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text variant="bodySmall" style={[styles.categoryText, { color: getCategoryColor(post.category) }]}>
            {post.category.toUpperCase()}
          </Text>
        </View>

        {/* Title and Content */}
        <Text variant="titleMedium" style={styles.title}>
          {post.title}
        </Text>

        <Text variant="bodyMedium" style={styles.content}>
          {truncateContent(post.content)}
        </Text>

        {/* Tags */}
        {post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text variant="bodySmall" style={styles.tagText}>
                  #{tag}
                </Text>
              </View>
            ))}
            {post.tags.length > 3 && (
              <Text variant="bodySmall" style={styles.moreTags}>
                +{post.tags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="eye" size={16} color={colors.onSurfaceDisabled} />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled, marginLeft: 4 }}>
              {post.views}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={16} color={colors.onSurfaceDisabled} />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled, marginLeft: 4 }}>
              {post.comments}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color={colors.onSurfaceDisabled} />
            <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled, marginLeft: 4 }}>
              {post.likes}
            </Text>
          </View>
        </View>
      </Card.Content>

      {/* Actions */}
      {showActions && (
        <>
          <Divider />
          <Card.Actions style={styles.actions}>
            <Button
              mode="text"
              icon={post.userLiked ? 'heart' : 'heart-outline'}
              onPress={handleLike}
              labelStyle={{ color: post.userLiked ? colors.error : colors.onSurface }}
            >
              Like
            </Button>
            <Button mode="text" icon="comment" onPress={handleComment}>
              Comment
            </Button>
            <Button
              mode="text"
              icon={post.userSaved ? 'bookmark' : 'bookmark-outline'}
              onPress={handleSave}
              labelStyle={{ color: post.userSaved ? tertiaryColor : colors.onSurface }}
            >
              Save
            </Button>
            <Button mode="text" icon="share" onPress={handleShare}>
              Share
            </Button>
          </Card.Actions>
        </>
      )}

      {/* Featured/Pinned Badges */}
      {(post.isFeatured || post.isPinned) && (
        <View style={styles.badges}>
          {post.isPinned && (
            <View style={[styles.badge, { backgroundColor: tertiaryColor }]}>
              <Ionicons name="pin" size={12} color="white" />
              <Text variant="bodySmall" style={styles.badgeText}>
                Pinned
              </Text>
            </View>
          )}
          {post.isFeatured && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Ionicons name="star" size={12} color="white" />
              <Text variant="bodySmall" style={styles.badgeText}>
                Featured
              </Text>
            </View>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorDetails: {
    marginLeft: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  moreTags: {
    color: '#999',
    alignSelf: 'center',
    marginLeft: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    justifyContent: 'space-around',
  },
  badges: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ForumPostCard;
