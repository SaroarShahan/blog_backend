export class CreatePostDto {
  title: string;
  content: string;
  categoryId?: string;
  tagIds?: string[];
}
