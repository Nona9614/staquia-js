type DivergeSpy = {
    use: boolean,
    before: string,
    after: string,
    expected: string;
    message: string;
}

const mocks: {
    useAll: boolean,
    system: {
        first: "a",
        last: "z",
        zero: "!"
    },    
    spies: DivergeSpy[]
} = {
    useAll: true,
    system: {
        first: "a",
        last: "z",
        zero: "!"    
    },
    spies: [
        {
            use: false,
            before: "a",
            after: "z",
            expected: "n",
            message: "Should get the middle value from the system"
        },
        {
            use: false,
            before: "!",
            after: "z",
            expected: "m",
            message: "Should get the value before the middle value from the system"
        },
        {
            use: false,
            before: "nnnn",
            after: "nnno",
            expected: "nnnnm",
            message: "Should ignore repeated values then concatenate them again and extends because zero space"
        },
        {
            use: false,
            before: "abba",
            after: "abccc",
            expected: "abbo",
            message: "Should ignore repeated values then concatenate them again, work against zero space and ignore extra values"
        },
        {
            use: false,
            before: "ng",
            after: "n",
            expected: "nd",
            message: "Should order the values before evaluation"
        },
        {
            use: false,
            before: "az",
            after: "b!",
            expected: "azm",
            message: "Should extend itself when there is no room"
        },
        {
            use: false,
            before: "!!a",
            after: "!!z",
            expected: "!!n",
            message: "Should ignore and concat again leading zeroes"
        },
        {
            use: false,
            before: "a",
            after: "zz",
            expected: "n",
            message: "Should get the middle character ignoring the offset"
        },
        {
            use: false,
            before: "yz",
            after: "zzzy",
            expected: "zl",
            message: "Should avoid overlap when there is no room and is in the limit of the system"
        }
    ]
}

export default mocks;