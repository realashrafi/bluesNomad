import React from 'react';


const SvgImage = ({ src, alt = 'icon', size = 24, className = '' }:any) => {
    return (
        <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className={className}
            style={{ display: 'inline-block' }}
        />
    );
};


export default SvgImage;