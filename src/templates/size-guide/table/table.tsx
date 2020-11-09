import React from 'react';
// import styling libs
import { Box, Text } from 'rebass';
// import local components
import { Data } from '..';

type Props = {
    data: Data[];
};

/**
 * Table component to display available sizes available..
 */
const Table: React.FC<Props> = ({ data }) => {
    const border = '2px solid #222';
    const textAlign: 'center' | 'left' = 'center';

    const baseTextStyle = {
        fontFamily: 'body',
        fontSize: 1,
        px: [4, 4, 6],
        py: [2],
        textAlign,
    };

    const headingStyle = {
        ...baseTextStyle,
        fontWeight: 'bold',
    };

    return (
        <Box
            mb={[6, 6, 0]}
            mr={[0, 0, 4, 9]}
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, auto)',
                border,
                borderBottomWidth: 0,
            }}
        >
            {/* table heading! */}
            <Text
                {...headingStyle}
                sx={{
                    gridColumn: '1/2',
                    borderBottom: border,
                }}
            >
                SIZE
            </Text>
            <Text
                {...headingStyle}
                sx={{
                    gridColumn: '2/3',
                    borderLeft: border,
                    borderBottom: border,
                }}
            >
                DIAMEsTER
            </Text>
            <Text
                {...headingStyle}
                sx={{
                    gridColumn: '3/4',
                    borderLeft: border,
                    borderBottom: border,
                }}
            >
                CIRCUMFERENCE
            </Text>

            {/* render data */}
            {data.map(dt => (
                <React.Fragment key={dt.size}>
                    <Text
                        {...baseTextStyle}
                        sx={{
                            gridColumn: '1/2',
                            borderBottom: border,
                        }}
                    >
                        {dt.size}
                    </Text>
                    <Text
                        {...baseTextStyle}
                        sx={{
                            gridColumn: '2/3',
                            borderLeft: border,
                            borderBottom: border,
                        }}
                    >
                        {dt.diameter} mm
                    </Text>
                    <Text
                        {...baseTextStyle}
                        sx={{
                            gridColumn: '3/4',
                            borderLeft: border,
                            borderBottom: border,
                        }}
                    >
                        {dt.circum} mm
                    </Text>
                </React.Fragment>
            ))}
        </Box>
    );
};

export { Table };
