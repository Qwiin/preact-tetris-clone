
export const LAYOUT_MOBILE: string = "mobile";
export const LAYOUT_DESKTOP: string = "desktop";

export type AppLayout = "mobile" | "desktop";

export interface BaseComponentProps {
  className?: string;
  style?: any;
  layout: AppLayout;
}