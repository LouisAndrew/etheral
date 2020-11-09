import React from 'react';
// import styling libs
import { Box, Heading } from 'rebass';
// import local components

import thanks from './assets/desktop.jpg';
import thanksMobile from './assets/mobile.jpg';

type Props = {};

/**
 * Thankyou page. Shown after user completes a transaction
 * @param param0 Props
 */
const Thankyou: React.FC<Props> = () => {
    const THANKYOU_MSG =
        'THANK YOU FOR YOUR PURCHASE!\nCHECK YOUR EMAIL FOR YOUR ORDER CONFIRMATION';

    return (
        <Box className="content">
            {/* separated content container from the inner content */}
            <Box
                className="inner-wrapper"
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    height: ['80vh', '120vh', '55vh', '65vh'],
                    minHeight: ['unset', 'unset', '400px'],
                    maxHeight: ['unset', '380px', '50vh', 'unset'],
                }}
                css={`
                    /* kinda specific for surface duo. */
                    @media screen and (min-width: 27em) and (max-width: 48em) and (orientation: portrait) {
                        max-height: 40vh !important;
                        margin-top: 16px !important;
                    }

                    /* kinda specific for ipad(s) */
                    @media screen and (min-width: 48em) and (max-width: 64em) and (orientation: portrait) {
                        max-height: 40vh !important;
                    }
                `}
            >
                <Box
                    className="bg"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        zIndex: 1,
                        img: {
                            height: 'auto',
                            width: '100%',

                            '&.thx-mobile': {
                                display: ['block', 'none'],
                            },
                            '&.thx-desktop': {
                                display: ['none', 'block'],
                            },
                            transform: [
                                'unset',
                                'unset',
                                'unset',
                                'unset',
                                'translateY(-200px)',
                            ],
                        },
                    }}
                >
                    <img
                        alt="Thankyou"
                        src={thanksMobile}
                        className="thx-mobile"
                    />
                    <img alt="Thankyou" src={thanks} className="thx-desktop" />
                </Box>
                <Box
                    sx={{ zIndex: 2, position: 'relative' }}
                    py={[128]}
                    px={[4, 6, 7, 9]}
                >
                    <Heading
                        color="#fff"
                        fontWeight="semiBold"
                        textAlign={['center', 'left']}
                        fontSize={[1, 1, 5, 6, 7]}
                        my="auto"
                        mx={['auto', 0, 0]}
                    >
                        {THANKYOU_MSG}
                    </Heading>
                </Box>
            </Box>
        </Box>
    );
};

export { Thankyou };
