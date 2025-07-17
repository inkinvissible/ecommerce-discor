import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images:{
        remotePatterns:[ new URL('https://discor.multisoft.ar/images/**')]
    }
};


export default nextConfig;
