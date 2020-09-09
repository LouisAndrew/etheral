import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from '@reach/router';

import { Text, Flex, Box } from 'rebass';
import { Icon } from '@iconify/react';
import menuFill from '@iconify/icons-ri/menu-fill';
import { CSSTransition } from 'react-transition-group';
import closeLine from '@iconify/icons-ri/close-line';

import Cart from './cart';
import { clearCart } from 'state/actions/cart';
import Dropdown from './dropdown';
import Logo from 'components/logo';
import CartItems from './cart-items';

import './nav.scss';
import Account from './account';
import { IState as ICartState } from 'state/reducers/cart-reducer';

export type Props = {
    auth: firebase.auth.Auth;
    db: firebase.firestore.Firestore;
};

const Navigation: React.FC<Props & ICartState> = ({ auth, db, cart }) => {
    // states for ui changes
    const [showMenuMobile, setShowMenuMobile] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdownL, setShowDropdownL] = useState(false);
    const [currLocation, setCurrLocation] = useState('/');
    const [showCart, setShowCart] = useState(false);

    const [user, setUser] = useState<firebase.User | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (auth.currentUser) {
            setUser(auth.currentUser);
        }
        if (window.location) {
            const { pathname } = location;
            setCurrLocation(pathname);
        }
    }, []);

    const logout = async () => {
        try {
            await auth.signOut();
            await setUser(null);
            await dispatch(clearCart());
        } catch (e) {
            console.error(e);
        }
    };

    const handleMenuMobile = () => {
        if (showDropdown) {
            setShowDropdown(false);
        }
        if (showCart) {
            setShowCart(false);
        }
        setShowMenuMobile(prev => !prev);
    };

    const toggleShowCart = () => {
        if (showMenuMobile) {
            setShowMenuMobile(false);
        }
        setShowCart(prev => !prev);
    };

    // eslint-disable-next-line immutable/no-let, @typescript-eslint/tslint/config
    let bg;
    if (showMenuMobile) {
        bg = 'brown.0';
    } else {
        if (showDropdownL || showCart) {
            bg = '#fff';
        } else {
            bg = 'rgba(0, 0, 0, 0)';
        }
    }

    // mock links for testing purposes
    return (
        <Flex variant="outerWrapper" as="header" bg={bg}>
            <Box
                variant="innerWrapper"
                my={[0, 5, 0]}
                css={`
                    & .icons {
                        height: 16px;
                        width: 16px;

                        &.bigger {
                            height: 20px;
                            width: 20px;
                        }

                        @media screen and (min-width: 27em) {
                            height: 20px;
                            width: 20px;

                            &.bigger {
                                height: 24px;
                                width: 24px;
                            }
                        }

                        @media screen and (min-width: 48em) {
                            height: 24px;
                            width: 24px;
                        }
                    }
                `}
            >
                {/* Logo */}
                <Link to="/">
                    <Flex
                        variant="center"
                        css={`
                            position: absolute;
                            z-index: 2;

                            left: 50%;
                            transform: translate(-50%, 0);

                            & svg {
                                height: 8vh;
                                width: 20vw;
                            }

                            @media screen and (min-width: 48em) {
                                width: 12vw;
                                transform: translate(-55%, 8px);
                            }

                            @media screen and (min-width: 64em) {
                                width: 8vw;
                                transform: translate(-60%, 8px);
                            }
                        `}
                    >
                        <Logo />
                    </Flex>
                </Link>

                <Flex
                    width="100%"
                    height={['8vh', '8vh', '10vh']}
                    alignItems="center"
                    justifyContent="space-between"
                    css={`
                        position: relative;

                        #links-L {
                            display: none;
                        }

                        @media (min-width: 48em) {
                            #links-L {
                                display: flex;
                            }

                            #menu-mobile {
                                display: none;
                            }
                        }
                    `}
                >
                    {/* Links for desktop */}

                    <Flex id="links-L" alignItems="center">
                        <Link to="/about">
                            <Text
                                variant={
                                    currLocation.includes('about')
                                        ? 'linkActive'
                                        : 'link'
                                }
                                py={[0, 0, '5vh']}
                            >
                                About
                            </Text>
                        </Link>
                        <Box
                            onMouseEnter={() => setShowDropdownL(true)}
                            onMouseLeave={() => setShowDropdownL(false)}
                        >
                            <Text variant="link" py={[0, 0, '5vh']}>
                                Shop
                            </Text>
                            <CSSTransition
                                in={showDropdownL}
                                timeout={200}
                                unmountOnExit={true}
                                classNames="dropdown"
                            >
                                <Dropdown
                                    goBack={() => setShowDropdown(false)}
                                    currLocation={currLocation}
                                />
                            </CSSTransition>
                        </Box>
                        <Link to="/blog">
                            <Text
                                variant={
                                    currLocation.includes('blog')
                                        ? 'linkActive'
                                        : 'link'
                                }
                                py={[0, 0, '5vh']}
                            >
                                Blog
                            </Text>
                        </Link>
                    </Flex>

                    {/* menu toggle button for mobile */}
                    <Flex
                        variant="center"
                        onClick={handleMenuMobile}
                        id="menu-mobile"
                    >
                        <Icon
                            icon={showMenuMobile ? closeLine : menuFill}
                            className={`icons ${
                                showMenuMobile ? 'bigger' : ''
                            }`}
                        />
                    </Flex>

                    {/* Auth and cart */}
                    <Flex alignItems="center">
                        <Account desktop={true} user={user} />
                        <Cart
                            toggleShowCart={toggleShowCart}
                            showCart={showCart}
                            user={user}
                            db={db}
                            cart={cart}
                        />
                    </Flex>
                </Flex>

                {/* Menu on mobile devices */}
                <CSSTransition
                    in={showMenuMobile}
                    timeout={100}
                    unmountOnExit={true}
                    classNames="links"
                >
                    <Box id="links-S" minHeight={['92vh']} p={5}>
                        <Account user={user} desktop={false} />
                        <Link to="/about">
                            <Text
                                variant={
                                    currLocation.includes('about')
                                        ? 'linkActive'
                                        : 'link'
                                }
                                my={[2]}
                            >
                                About
                            </Text>
                        </Link>
                        <Box onClick={() => setShowDropdown(prev => !prev)}>
                            <Text variant="link" my={[2]}>
                                Shop
                            </Text>
                        </Box>
                        <Link to="/blog">
                            <Text
                                variant={
                                    currLocation.includes('blog')
                                        ? 'linkActive'
                                        : 'link'
                                }
                                my={[2]}
                            >
                                Blog
                            </Text>
                        </Link>
                    </Box>
                </CSSTransition>

                {/* Dropdown element. */}
                <CSSTransition
                    in={showDropdown}
                    timeout={100}
                    unmountOnExit={true}
                    classNames="dropdown"
                >
                    <Dropdown
                        goBack={() => setShowDropdown(false)}
                        currLocation={currLocation}
                    />
                </CSSTransition>

                <CSSTransition
                    in={showCart}
                    timeout={100}
                    unmountOnExit={true}
                    classNames="cart-items"
                >
                    <CartItems cart={{ cart }} />
                </CSSTransition>
            </Box>
        </Flex>
    );
};

export { Navigation };
