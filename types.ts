import React from 'react';

export interface Message {
  role: 'user' | 'model';
  text: string;
  isJson?: boolean;
}

export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandTypography {
  heading: string;
  body: string;
}

export interface BrandLogoSpecs {
  concept: string;
  constructionAnalysis: string;
  layout: string;
  dimensions: {
    social: string;
    web: string;
    print: string;
  };
  fileFormats: string[];
  svgContent?: React.ReactNode; // Optional custom visual for examples
}

export interface BrandAssetData {
  brandName: string;
  tagline: string;
  description: string;
  colors: BrandPalette;
  typography: BrandTypography;
  logo: BrandLogoSpecs;
  usage: string;
}

export enum ChatStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  COMPLETE = 'COMPLETE'
}

export interface ChatState {
  messages: Message[];
  status: ChatStatus;
  brandData: BrandAssetData | null;
}