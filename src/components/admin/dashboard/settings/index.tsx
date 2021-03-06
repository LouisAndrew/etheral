/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/tslint/config, immutable/no-let */

import React, { useState, useEffect } from 'react';
import firebase from 'gatsby-plugin-firebase';

import LoadingScreen from 'components/popups/loading-screen';

import { Settings as SettingsEl } from './settings';

export enum Status {
    NEW,
    UPDATE,
}

export type Timestamps = {
    lastModifiedDate?: Date;
    createdDate: Date;
    status: Status;
};

export type LatestProducts = Timestamps & {
    name: string;
    pid: string;
};

export type LatestCollections = Timestamps & {
    name: string;
    cid: string;
};

export type LatestBlogs = Timestamps & {
    slug: string;
};

export type DiscountCodes = {
    value: number;
    expiresIn: Date;
    code: string;
};

const Settings: React.FC = () => {
    const [db, setDb] = useState<firebase.firestore.Firestore | null>(null);

    const [isLoading, setIsLoading] = useState(false);

    const [latestProducts, setLatestProducts] = useState<LatestProducts[]>([]);
    const [latestCollections, setLatestCollections] = useState<
        LatestCollections[]
    >([]);
    const [latestBlogs, setLatestBlogs] = useState<LatestBlogs[]>([]);
    const [latestCodes, setLatestCodes] = useState<DiscountCodes[]>([]);

    const [rerender, setRerender] = useState(false);

    useEffect(() => {
        setDb(firebase.firestore());
    }, []);

    // DO NOT OPEN THIS
    // basically just a way to fetch ALL data from firestore (same as on gatsby-node.js)
    useEffect(() => {
        if (db) {
            fetchData();
        }
    }, [db]);

    useEffect(() => {
        if (rerender) {
            checkRerender();
        }
    }, [rerender]);

    const fetchData = async () => {
        if (db) {
            await setIsLoading(true);

            const contentRef = db.collection('fl_content');

            let lastUpdate = 0;

            const lastUpdateRef = db
                .collection('website-update')
                .orderBy('lastUpdate', 'desc')
                .limit(1);

            await lastUpdateRef.get().then(docs =>
                docs.forEach(async doc => {
                    lastUpdate = await doc.data().lastUpdate.seconds;
                })
            );

            // setting all refs here.
            const productsRef = contentRef.where(
                '_fl_meta_.schema',
                '==',
                'product'
            );
            const collectionsRef = contentRef.where(
                '_fl_meta_.schema',
                '==',
                'collection'
            );
            const discountCodeRef = db.collection('discount');

            const blogsRef = contentRef.where('_fl_meta_.schema', '==', 'blog');

            let collectionDocs: firebase.firestore.DocumentData[] = [];
            let productDocs: firebase.firestore.DocumentData[] = [];
            let blogDocs: firebase.firestore.DocumentData[] = [];

            // not sure why, but whenever i fetched homepage data, latest products and collections won't be fetched

            // fetch all products
            await productsRef.get().then(docs =>
                docs.forEach(doc => {
                    productDocs = [...productDocs, doc.data()];
                })
            );

            // fetch all collections
            await collectionsRef.get().then(docs =>
                docs.forEach(doc => {
                    collectionDocs = [...collectionDocs, doc.data()];
                })
            );

            // fetch all blogs
            await blogsRef.get().then(docs =>
                docs.forEach(doc => {
                    blogDocs = [...blogDocs, doc.data()];
                })
            );

            await setLatestProducts(
                productDocs
                    // filter function to filter latest product that has been created OR updated after the last update count.
                    .filter(
                        product =>
                            product._fl_meta_.createdDate.seconds >
                                lastUpdate ||
                            (product._fl_meta_.lastModifiedDate &&
                                product._fl_meta_.lastModifiedDate.seconds >
                                    lastUpdate)
                    )
                    .map(product => ({
                        pid: product.id,
                        name: product.name,
                        lastModifiedDate: product._fl_meta_.lastModifiedDate
                            ? product._fl_meta_.lastModifiedDate.toDate()
                            : undefined,
                        createdDate: product._fl_meta_.createdDate.toDate(),
                        status:
                            product._fl_meta_.createdDate.seconds > lastUpdate // no need to check if created date is smaller than last update
                                ? Status.NEW
                                : Status.UPDATE,
                    }))
            );

            await setLatestCollections(
                collectionDocs
                    .filter(
                        collection =>
                            collection._fl_meta_.createdDate.seconds >
                                lastUpdate ||
                            (collection._fl_meta_.lastModifiedDate &&
                                collection._fl_meta_.lastModifiedDate.seconds >
                                    lastUpdate)
                    )
                    .map(collection => ({
                        cid: collection.id,
                        name: collection.name,
                        lastModifiedDate: collection._fl_meta_.lastModifiedDate
                            ? collection._fl_meta_.lastModifiedDate.toDate()
                            : undefined,
                        createdDate: collection._fl_meta_.createdDate.toDate(),
                        status:
                            collection._fl_meta_.createdDate.seconds >
                            lastUpdate
                                ? Status.NEW
                                : Status.UPDATE,
                    }))
            );

            await setLatestBlogs(
                blogDocs
                    .filter(
                        blog =>
                            blog._fl_meta_.createdDate.seconds > lastUpdate ||
                            (blog._fl_meta_.lastModifiedDate &&
                                blog._fl_meta_.lastModifiedDate.seconds >
                                    lastUpdate)
                    )
                    .map(blog => ({
                        ...blog,
                        slug: blog.slug,
                        lastModifiedDate: blog._fl_meta_.lastModifiedDate
                            ? blog._fl_meta_.lastModifiedDate.toDate()
                            : undefined,
                        createdDate: blog._fl_meta_.createdDate.toDate(),
                        status:
                            blog._fl_meta_.createdDate.seconds > lastUpdate
                                ? Status.NEW
                                : Status.UPDATE,
                    }))
            );

            const discountCodes: DiscountCodes[] = await discountCodeRef
                .get()
                .then(snapshot =>
                    snapshot.docs.map(doc => {
                        const data = doc.data();

                        const { value, expiresIn } = data;

                        return {
                            code: doc.id,
                            value,
                            expiresIn: expiresIn.toDate(),
                        } as DiscountCodes;
                    })
                );

            await setLatestCodes(discountCodes);

            await setIsLoading(false);
        }
    };

    const checkRerender = async () => {
        await fetchData();
        await setRerender(false);
    };

    if (db && !isLoading) {
        return (
            <SettingsEl
                db={db}
                latestProducts={latestProducts}
                latestCollections={latestCollections}
                latestBlogs={latestBlogs}
                latestCodes={latestCodes}
                fromDate={firebase.firestore.Timestamp.fromDate}
                doRerender={() => {
                    setRerender(true);
                }}
            />
        );
    }

    return <LoadingScreen />;
};

export default Settings;
