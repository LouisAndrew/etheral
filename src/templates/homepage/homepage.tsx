import React from 'react';
import { findIndex, intersectionBy } from 'lodash';

import { FluidObject, FixedObject } from 'gatsby-image';

import { FluidData, FixedData, HomePageData } from 'pages';
import Hero from './hero';
import Campaign from './campaign';
import useAllProducts from 'helper/use-all-products';
import HomepageProducts from './homepage-products';
import BlogPreview from './blog-preview';

type Props = {
    homepageData: HomePageData;
    heroImages: {
        imgS: FluidData[];
        imgM: FluidData[];
        imgL: FluidData[];
    };
    campaignImages: {
        imgS: FixedData[];
        imgM: FixedData[];
        imgL: FixedData[];
        imgXL: FixedData[];
    };
};

const extractImagesFromUrl = (
    dataArr: any,
    imgVault: FluidData[] | FixedData[]
) =>
    dataArr
        .map((data: any) => {
            const index = findIndex(
                imgVault as any,
                (o: any) => o.url === data.url
            );
            if (index !== -1) {
                return imgVault[index];
            } else {
                return '';
            }
        })
        .filter((fluidData: any) => fluidData !== '');

const Homepage: React.FC<Props> = ({
    homepageData,
    heroImages,
    campaignImages,
}) => {
    // query on index.ts => maxWidth: 600, 1040, 1920
    const { homepageImages, campaigns, products } = homepageData;
    const allProducts = useAllProducts();

    // extract hero data
    // image list should be on the same order
    const heroImgS = extractImagesFromUrl(homepageImages, heroImages.imgS);
    const heroImgM = extractImagesFromUrl(homepageImages, heroImages.imgM);
    const heroImgL = extractImagesFromUrl(homepageImages, heroImages.imgL);

    const heroData = homepageImages.map((homepageImg, index) => ({
        ...homepageImg,
        img: {
            sources: [
                {
                    ...heroImgS[index].childImageSharp.fluid,
                    media: '(max-width: 600px)',
                } as FluidObject,
                {
                    ...heroImgM[index].childImageSharp.fluid,
                    media: '(max-width: 1040px)',
                } as FluidObject,
                {
                    ...heroImgL[index].childImageSharp.fluid,
                    media: '(max-width: 1920px)',
                } as FluidObject,
            ],
        },
    }));

    // extract campaigns data
    const campaignImgS = extractImagesFromUrl(campaigns, campaignImages.imgS);
    const campaignImgM = extractImagesFromUrl(campaigns, campaignImages.imgM);
    const campaignImgL = extractImagesFromUrl(campaigns, campaignImages.imgL);
    const campaignImgXL = extractImagesFromUrl(campaigns, campaignImages.imgXL);
    const campaignData = campaigns.map((campaign, index) => ({
        ...campaign,
        img: {
            sources: [
                {
                    ...campaignImgS[index].childImageSharp.fixed,
                    media: '(max-width: 768px)',
                } as FixedObject,
                {
                    ...campaignImgM[index].childImageSharp.fixed,
                    media: '(max-width: 1040px)',
                } as FixedObject,
                {
                    ...campaignImgL[index].childImageSharp.fixed,
                    media: '(max-width: 1440px)',
                } as FixedObject,
                campaignImgXL[index].childImageSharp.fixed,
            ],
        },
    }));

    // extract products to show on homepage
    const productsToShow = intersectionBy(
        allProducts,
        products.map(productStr => ({ pid: productStr })),
        'pid'
    );

    // extract mailing-list image

    return (
        <>
            <Hero heroData={heroData} />
            <Campaign campaignData={campaignData} />
            <HomepageProducts
                products={productsToShow}
                displayText={homepageData.homepageProductsDisplayText}
            />
            <BlogPreview />
        </>
    );
};

export { Homepage };
