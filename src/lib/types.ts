
export type Material = {
  name: string;
  quantity: number;
  unit: string;
};

export type Place = {
    name: string;
    address: string;
    lat?: number; // Make optional
    lon?: number; // Make optional
}

export type Event = {
    id?: number;
    name: string;
    date: string;
    location: string;
    link: string;
}

export type EnhancementIdea = {
    title: string;
    description: string;
    googleSearchQuery: string;
}

export type GrowthTip = {
    title: string;
    description: string;
}

export type Scheme = {
    name: string;
    description: string;
    link: string;
}

export type TrendingProduct = {
    name: string;
    description: string;
    imageUrl: string;
}
