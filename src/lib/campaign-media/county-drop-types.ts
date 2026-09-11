export const COUNTY_DROP_INDEX_REL = "data/campaign-media/county-drop-albums.json";
export const COUNTY_DROP_PUBLIC_PREFIX = "/media/county-library";

export type CountyDropPhotoJson = {
  id: string;
  src: string;
  filename: string;
  width: number;
  height: number;
};

export type CountyDropAlbumJson = {
  countySlug: string;
  countyDisplayName: string;
  shortName: string;
  photos: CountyDropPhotoJson[];
};

export type CountyDropIndexJson = {
  generatedAt: string;
  albums: CountyDropAlbumJson[];
};
