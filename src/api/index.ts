//json-server --watch db.json --port 3000
export * from './base';
export * from './category';
export * from './visit';
export * from './article';
export * from './link';
export * from './expansion';
export * from './demo';
export interface Window {
    returnCitySN: {
        cip: string;
        cname: string;
    };
}