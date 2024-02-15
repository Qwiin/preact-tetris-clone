
export const LAYOUT_MOBILE: AppLayout = "mobile";
export const LAYOUT_DESKTOP: AppLayout = "desktop";

export type AppLayout = "mobile" | "desktop";

export interface BaseComponentProps {
  className?: string;
  style?: any;
  layout: AppLayout;
}