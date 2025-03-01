export class PullImageResponseDto {
  status: number;
  message: string;
  data: {
    image: string;
    tag: string;
    success: boolean;
  };
}
