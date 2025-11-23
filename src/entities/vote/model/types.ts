export type VoteOptionStats = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  displayOrder: number;
  voteCount: number;
};

export type VoteFeedItem = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: string;
  authorId: string;
  totalParticipants: number;
  userOptionId: string | null;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  options: VoteOptionStats[];
};

export type VoteComment = {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
};

