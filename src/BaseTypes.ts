export type AppLayout = "mobile" | "desktop";

export interface BaseComponentProps {
  className?: string;
  style?: any;
  layout: AppLayout;
}