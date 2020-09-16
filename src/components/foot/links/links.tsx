import React from 'react';
import { Link } from '@reach/router';

import { Flex, Text } from 'rebass';

import { theme } from 'styles';

type Props = {};

const Links: React.FC<Props> = () => {
    return (
        <Flex
            as="nav"
            flexDirection={['column', 'column', 'row']}
            justifyContent={['space-between', 'space-between', 'flex-start']}
            alignItems="center"
            py={[4, 4, 5]}
            sx={{
                '& > a': {
                    textDecoration: 'none',
                    color: theme.colors.black[0],
                    px: [0, 0, 3],
                },
            }}
        >
            <Link to="/">
                <Text variant="linkSmall">CONTACT US</Text>
            </Link>
            <Link to="/">
                <Text variant="linkSmall">FAQ</Text>
            </Link>
            <Link to="/">
                <Text variant="linkSmall">SIZE GUIDE</Text>
            </Link>
        </Flex>
    );
};

export { Links };
