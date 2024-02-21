
export const LAYOUT_PORTRAIT: AppLayout = "portrait";
export const LAYOUT_LANDSCAPE: AppLayout = "landscape";

export const PLATFORM_MOBILE: Platform = "mobile";
export const PLATFORM_TABLET: Platform = "tablet";
export const PLATFORM_DESKTOP: Platform = "desktop";

export type AppLayout = "portrait" | "landscape";
export type Platform = "desktop" | "mobile" | "tablet";

export interface BaseComponentProps {
  className?: string;
  style?: any;
  layout: AppLayout;
  platform: Platform;
}