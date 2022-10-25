type PositionSpy = {
    test: boolean,
    value: any,
    expected: any
    message: string,
}

const mocks: {
    testAll: boolean,
    system: {
        first: "a",
        last: "z",
        zero: "!"
    },
    sizes: {
        n: 4,
        z: 12
    },
    spies: { [key in string]: PositionSpy[] }
} = {
    testAll: false,
    system: {
        first: "a",
        last: "z",
        zero: "!"
    },
    sizes: {
        n: 4,
        z: 12
    },
    spies: {
        object: [
            {
                test: false,
                value: {
                    n: "nnnn",
                    z: "z",
                },
                expected: "nnnnz",
                message: "Should concat the values from the object"
            },
            {
                test: false,
                value: {
                    n: "n",
                },
                expected: "!!!n",
                message: "Should generate a value from the object and include leading zeroes"
            }
        ],
        string: [
            {
                test: false,
                value:  "nnnnz",
                expected: {
                    n: "nnnn",
                    z: "z",
                },
                message: "Should transform string to nz values"
            },
            {
                test: false,
                value:  "n",
                expected: {
                    n: "!!!n",
                    z: "!",
                },
                message: "Should transform string to nz values and add leading zeroes"
            },
            {
                test: false,
                value:  "nnnnz",
                expected: {
                    n: "nnnn",
                    z: "z",
                },
                message: "Should transform string to nz values"
            },
        ],
        core: [
            {
                test: false,
                value: {
                    before: "a",
                    after: "c",
                },
                expected: "!!!b",
                message: "Should get the middle value from the numbers"
            },
            {
                test: false,
                value: {
                    before: "a",
                    after: "b",
                },
                expected: "!!!am",
                message: "Should resolve the no room issue using the s value"
            },
            {
                test: false,
                value: {
                    before: "!!!az",
                    after: "!!!cz",
                },
                expected: "!!!b",
                message: "Should ignore the s value when there is enough room with n"
            }
        ]
    }
}

export default mocks;