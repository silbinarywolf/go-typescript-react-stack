// note(jae): 2021-07-20
// These global variables are filled out by the Webpack DefinePlugin.
// See webpack.dev.js and webpack.production.js to see how.
declare const API_ENDPOINT: string;
declare const VERSION: string;

declare module "*.png" {
    const content: string;
    export default content;
}

// note(jae): 2021-08-24
// These allow us to import files as defined by the Webpack "file-loader"
// See "webpack.common.js" to see how.

declare module "*.jpeg" {
    const content: string;
    export default content;
}

declare module "*.jpg" {
    const content: string;
    export default content;
}

declare module "*.gif" {
    const content: string;
    export default content;
}

// note(jae): 2021-11-05
// allow importing of SVGs in TypeScript
// solution borrowed from: https://github.com/gregberge/svgr/issues/38#issuecomment-717602727
declare module "*.svg" {
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;

    export default ReactComponent;
}
