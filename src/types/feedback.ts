export interface Feedback {
  id: string;
  title: string;
  content: string;
  realName: string;
  phone: string;
  createdAt: number;
  viewed: boolean;
}

export interface FeedbackFormData {
  title: string;
  content: string;
  realName: string;
  phone: string;
}
