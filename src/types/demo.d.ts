export interface SingleDemo {
    _id: string;
    code: string;
    type: T_Type;
    title: string;
    img: string;
}
export type T_Type = 'Three.js' | 'WebGL' | 'Shader' | 'Css' | 'Other' | "";