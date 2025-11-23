export class CreateCommentDto {
  content: string;
  postId: string;
  parentCommentId?: string;
}
