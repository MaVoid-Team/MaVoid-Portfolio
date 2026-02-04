export interface Project {
  id: string;
  title: string;
  titleAr: string;
  categoryValue: string;
  categoryEn: string;
  categoryAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  link?: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
