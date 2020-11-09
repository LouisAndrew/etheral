import React from 'react';
// import styling libs
import { Box, Flex, Text } from 'rebass';
// import local components
import { Data } from '..';

type Props = {
    data: Data[];
};

/**
 * Component to display an illustration of the ring sizes and its comparation.
 */
const Sizes: React.FC<Props> = ({ data }) => {
    const textStyling = {
        fontFamily: 'body',
        fontWeight: 'medium',
        fontSize: [1],
    };

    const ringStyling = {
        border: '1px solid #222',
        borderRadius: '50%',
    };

    return (
        <Flex>
            {data.map(dt => {
                const sizes = [
                    dt.size * 8,
                    dt.size * 9,
                    dt.size * 10,
                    dt.size * 10,
                ];

                return (
                    <Box
                        key={`${dt.size}-sizes`}
                        mx={[3]}
                        sx={{ textAlign: 'center' }}
                    >
                        <Text {...textStyling} mb={[2]}>
                            SIZE {dt.size}
                        </Text>
                        <Box
                            sx={{
                                ...ringStyling,
                                height: sizes,
                                width: sizes,
                            }}
                        />
                    </Box>
                );
            })}
        </Flex>
    );
};

export { Sizes };
