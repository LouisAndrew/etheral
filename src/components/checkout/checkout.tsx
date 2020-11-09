import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { get, findIndex, set } from 'lodash';
import { useDispatch } from 'react-redux';
import { useNavigate } from '@reach/router';

import { Box, Flex, Text } from 'rebass';

import ProductsSummary from './products-summary';
import BillingSummary from './billing-summary';
import Payment, { RadioInput } from './payment';
import Form from './form';

import Modal from 'components/modal';
import { IState as ICartState } from 'state/reducers/cart-reducer';
import { clearCart } from 'state/actions/cart';
import { Order, IpaymuData } from 'helper/schema/order';
import { Currencies } from 'state/reducers/currency-reducer';
import { withDiscount } from 'helper/with-discount';
import { getDateReadable } from 'helper/get-date';

import useAllProducts from 'helper/use-all-products';

type Props = {
    db: firebase.firestore.Firestore;
    user: firebase.User | null;
    cartObj: ICartState;
    currency: Currencies;
    firestoreFieldValue: { increment: any; arrayUnion: any };
};

export type UserData = {
    name: string;
    email: string;
    phone: number;
    address: string;
    postal: number;
    country: string;
    message?: {
        message: string;
        forName: string;
        fromName: string;
    };
};

export type UserLocation = {
    cityId: number;
    provinceId: number;
};

enum Status {
    NONE,
    ERROR_SHIPPNG,
    ERROR_PAYMENT,
    ERROR_SHIPPING_COST,
    ERROR_CREATE_ORDER,
}

const Checkout: React.FC<Props> = ({
    db,
    user,
    firestoreFieldValue,
    currency,
    cartObj: { cart, wishlist, showCart },
}) => {
    // state for prices based on currency
    const [price, setPrice] = useState(0);
    const [currencyPrefix, setCurrencyPrefix] = useState(Currencies.IDR);

    // user data(s) such as name, email, address, etc.
    const [userData, setUserData] = useState<
        (UserData & UserLocation) | undefined
    >(undefined);

    // shipping cost
    const [shipping, setShipping] = useState(-1);
    const [totalPrice, setTotalPrice] = useState(0);

    const [discountCode, setDiscountCode] = useState('');
    const [discountValue, setDiscountValue] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(0);

    const [status, setStatus] = useState<Status>(Status.NONE);

    const [processingPayment, setProcessingPayment] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allProducts = useAllProducts();

    const discounted = discountCode !== '' && discountValue !== 0;

    // price is based on global currency.
    useEffect(() => {
        // eslint-disable-next-line immutable/no-let, @typescript-eslint/tslint/config
        let temp: number;

        switch (currency) {
            case Currencies.IDR:
                temp = cart.reduce(
                    (acc, curr) =>
                        (curr.product.prices.discountPercentage > 0
                            ? withDiscount(
                                  curr.product.prices.idrPrice,
                                  curr.product.prices.discountPercentage
                              )
                            : curr.product.prices.idrPrice) *
                            curr.amount +
                        acc,
                    0
                );
                setPrice(temp);
                setCurrencyPrefix(Currencies.IDR);
                break;
            case Currencies.AUD:
                temp = cart.reduce(
                    (acc, curr) =>
                        (curr.product.prices.discountPercentage > 0
                            ? withDiscount(
                                  curr.product.prices.ausPrice,
                                  curr.product.prices.discountPercentage
                              )
                            : curr.product.prices.ausPrice) *
                            curr.amount +
                        acc,
                    0
                );
                setPrice(temp);
                setCurrencyPrefix(Currencies.AUD);
                break;
            default:
                temp = cart.reduce(
                    (acc, curr) =>
                        (curr.product.prices.discountPercentage > 0
                            ? withDiscount(
                                  curr.product.prices.idrPrice,
                                  curr.product.prices.discountPercentage
                              )
                            : curr.product.prices.idrPrice) *
                            curr.amount +
                        acc,
                    0
                );
                setPrice(temp);
                setCurrencyPrefix(Currencies.IDR);
                break;
        }
    }, [currency]);

    // update price if discount code is applied.
    useEffect(() => {
        if (discounted) {
            setDiscountedAmount((discountValue / 100) * price);

            // just apply discount for the products' costs, not the shipping cost!
            setPrice(withDiscount(price, discountValue));
        }
    }, [discountCode, discountValue]);

    useEffect(() => {
        if (shipping) {
            setTotalPrice(price + shipping);
        }
    }, [price, shipping]);

    /**
     * random id generator for document id on db.
     */
    const generateUniqueId = () =>
        Math.random()
            .toString(36)
            .substr(2, 8);

    // orderid -> document id on firestore order collection
    const generateOrderId = async (): Promise<string> => {
        const oid = `${generateUniqueId()}${generateUniqueId()}`;
        const ref = db.collection('order').doc(oid);

        try {
            const doesExist = await ref.get().then(doc => doc.exists);
            if (await doesExist) {
                return generateOrderId(); // recursively calls itself if document exists -> regenerate id.
            } else {
                return oid;
            }
        } catch (e) {
            console.error(e);
            return generateOrderId(); // recursively calls itself on error -> regenerate id.
        }
    };

    // calculate shipping cost -> shipping cost fetched from rajaongkir api.
    // calclulate shipping cost within ID.
    const calculateShippingCost = async (
        {
            cityId,
        }: {
            cityId: number;
        },
        origin: number
    ) => {
        try {
            const data = {
                origin,
                destination: cityId,
                weight: cart.reduce(
                    (acc, current) => current.product.weight + acc,
                    0
                ),
                courier: 'jne',
            };

            const url =
                process.env.NODE_ENV === 'production'
                    ? '/.netlify/functions/get-shipping-cost' // cloud function.
                    : '/starter/cost';

            const req = await axios.post(url, data, {
                headers: {
                    key: process.env.GATSBY_RAJA_ONGKIR_KEY || '',
                },
            });

            const rsp = await req.data;
            const { rajaongkir } = await rsp;
            const statusCode = await get(rajaongkir, 'status.code', 400);
            // status code is OK.
            if (statusCode < 299) {
                const rspVariants = await get(
                    rajaongkir,
                    'results[0].costs',
                    []
                );

                // get REG service.
                const REGIndex = findIndex(
                    await rspVariants,
                    (o: any) => o.service === 'REG'
                );

                // REG unavailable when sending within the same city?
                if (REGIndex === -1) {
                    const CTCIndex = findIndex(
                        await rspVariants,
                        (o: any) => o.service === 'CTC'
                    );

                    setShipping(
                        get(await rspVariants[CTCIndex], 'cost[0].value', 0)
                    );
                } else {
                    setShipping(
                        get(await rspVariants[REGIndex], 'cost[0].value', 0)
                    );
                }
            }
        } catch (e) {
            console.error(e);
            setStatus(Status.ERROR_SHIPPING_COST); // set status to error!
        }
    };

    // simple user form for getting required informations
    const getUserData = (data: UserData & UserLocation, origin: number) => {
        setUserData(data);
        calculateShippingCost(data, origin);
    };

    // pay here
    const handleClickPay = async ({ method, channel }: RadioInput) => {
        await setProcessingPayment(true);

        // add production payment url here!
        const paymentUrl =
            process.env.NODE_ENV === 'production'
                ? '/.netlify/functions/payment'
                : '/payment/';

        const oid = await generateOrderId();
        // interact with 3rd party api for payment.
        try {
            if (userData && shipping) {
                const bodyReq = await {
                    name: userData.name,
                    phone: userData.phone.toString(),
                    email: userData.email,
                    amount: totalPrice,
                    paymentMethod: method,
                    paymentChannel: channel,
                    oid,
                };

                const req = await axios.post(paymentUrl, bodyReq);

                const { status: reqStatus, data } = await req;

                if ((await reqStatus) < 299) {
                    const {
                        SessionId,
                        PaymentNo,
                        PaymentName,
                        Expired,
                        Fee,
                        Total,
                    } = data;

                    const ipaymuData: IpaymuData = {
                        sessionId: SessionId,
                        paymentNo: PaymentNo,
                        paymentName: PaymentName,
                        expired: Expired,
                        fee: Fee,
                        total: Total, // fetching total price from ipaymu as it sometimes charges extra for virtual account payments
                    };

                    // create new order object
                    createOrder(oid, ipaymuData, { method, channel });
                } else {
                    // handle error
                    setStatus(Status.ERROR_PAYMENT);
                }
            } else if (!shipping) {
                setStatus(Status.ERROR_SHIPPING_COST);
            }
        } catch (e) {
            setStatus(Status.ERROR_PAYMENT);
        }

        await setProcessingPayment(false);
    };

    // create new order object
    const createOrder = async (
        oid: string,
        ipaymuData: IpaymuData,
        { method, channel }: RadioInput
    ) => {
        if (userData) {
            try {
                const { total, ...data } = ipaymuData;

                const docRef = db.collection('order').doc(oid);
                const { increment, arrayUnion } = firestoreFieldValue;

                const decrement = (num: number) => increment(-1 * num);

                const orderDate = new Date();

                const userDatas = {
                    buyerName: userData.name,
                    buyerEmail: userData.email,
                    buyerPhone: userData.phone,
                    buyerAddr: userData.address,
                    buyerPostal: userData.postal,
                };

                const order: Order = {
                    oid,
                    buyerUId: user ? user.uid : 'admin',
                    ...userDatas,
                    via: method,
                    channel,

                    total,
                    currency: Currencies.IDR, // temporary
                    date: orderDate,
                    products: cart.map(cartItem => ({
                        pid: cartItem.product.pid,
                        amount: cartItem.amount,
                        discountPercentage:
                            cartItem.product.prices.discountPercentage,
                        note: cartItem.note,
                    })),
                    paid: false,
                    delivered: false,
                    transactionData: data,
                    discountCode,
                    discountedAmount,
                    discount: discountValue,
                    shippingCost: shipping,
                };

                // set order.message if userData.message is provided => error by firestore: firestore doesn't accept undefined!
                if (await userData.message) {
                    await set(order, 'message', userData.message);
                }

                await docRef.set({
                    ...order,
                });

                // updating product amount here!
                await Promise.all(
                    cart.map(async cartItem =>
                        db
                            .collection('fl_content')
                            .doc(cartItem.product.pid)
                            .update({
                                amount: decrement(cartItem.amount),
                            })
                    )
                );

                // update user's firestore orders data.
                if (user) {
                    await db
                        .collection('user')
                        .doc(user.uid)
                        .update({
                            orders: arrayUnion(oid),
                        });
                }

                // calls verify-order
                const verifyUrl =
                    process.env.NODE_ENV === 'production'
                        ? 'https://fervent-minsky-bc0840.netlify.app/.netlify/functions/verify-order'
                        : '/verify-order/';

                const verifyBody = {
                    date: getDateReadable(orderDate),
                    oid,
                    channel,
                    currency,
                    ...ipaymuData,
                    ...userDatas,
                };

                const req = await axios.post(verifyUrl, verifyBody);

                console.log(await req);

                const { paymentNo, paymentName, expired } = ipaymuData;

                // save code to localhost
                if (discountCode) {
                    saveDiscountCode(discountCode);
                }

                await dispatch(clearCart());
                await navigate('/thankyou', {
                    state: {
                        oid,
                        paymentNo,
                        paymentName,
                        expired,
                        total,
                        currency,
                    },
                }); // navigate to thank you page and use oid state!
            } catch (e) {
                console.error(e);
                setStatus(Status.ERROR_CREATE_ORDER);
            }
        }
    };

    /**
     * save discount code on localstorage, so user can't use the code multiple times.
     * @param code the discount code.
     */
    const saveDiscountCode = (code: string) => {
        const LOCALSTORAGE_KEY = 'appliedCodes';

        if (window) {
            const codesStringified = window.localStorage.getItem(
                LOCALSTORAGE_KEY
            );

            if (!codesStringified) {
                window.localStorage.setItem(
                    LOCALSTORAGE_KEY,
                    window.btoa(code)
                );
                return;
            }

            // splitting the saved code.
            const codes = codesStringified.split(';');

            window.localStorage.setItem(
                LOCALSTORAGE_KEY,
                [...codes, window.btoa(code)].join(';') // rejoin, with the newest code
            );
        }
    };

    const applyCode = (code: string, value: number) => {
        setDiscountCode(code);
        setDiscountValue(value);
    };
    return (
        <Box
            className="content"
            sx={{ textAlign: 'center' }}
            px={[4, 4, 9, 10]}
        >
            {processingPayment && (
                <Modal center={true}>
                    <Text
                        fontFamily="body"
                        fontSize={[2, 2, 3]}
                        fontWeight="regular"
                        color="#fff"
                    >
                        PROCESSING PAYMENT...
                    </Text>
                </Modal>
            )}
            <ProductsSummary
                currency={currency}
                cart={cart}
                wishlist={wishlist}
                showCart={showCart}
            />
            <Form getUserData={getUserData} />
            <Flex
                flexDirection={['column', 'column', 'row']}
                justifyContent="space-between"
                mt={[5]}
                sx={{
                    position: 'relative',
                    borderColor: 'black.0',
                    borderWidth: 0,
                    borderStyle: 'solid',
                    borderTopWidth: 1,
                }}
            >
                {!userData || totalPrice === 0 ? (
                    <Box
                        sx={{
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            bg: 'rgba(255, 255, 255, 0.8)',
                            top: 0,
                            left: 0,
                        }}
                    />
                ) : null}
                <BillingSummary
                    price={price}
                    shipping={shipping}
                    currencyPrefix={currencyPrefix}
                    totalPrice={totalPrice}
                    db={db}
                    applyCode={applyCode}
                    error={status === Status.ERROR_SHIPPING_COST} // apply error if failed to fetch shipping cost from api
                    discount={{
                        discounted,
                        discountCode,
                        discountValue,
                        discountedAmount,
                    }}
                />
                <Payment
                    handleClickPay={handleClickPay}
                    paymentError={status === Status.ERROR_PAYMENT}
                />
            </Flex>
            {/* handle unclickable if shipping hasn't been selected */}
        </Box>
    );
};

export { Checkout };
