type BetweenSpy = {
    use: boolean,
    before: string,
    after: string,
    round?: boolean,
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
    spies: BetweenSpy[]
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
            before: "a",
            after: "z",
            expected: "mm",
            round: false,
            message: "Should middle point from the system"
        },
        {
            use: false,
            before: "r",
            after: "ri",
            expected: "in",
            message: "Should resolve hidden leading zero"
        },
        {
            use: false,
            before: "abyzz",
            after: "abz",
            expected: "!o!am",
            message: "Should resolve a coersive no room case and add missing leading zeroes"
        },
        {
            use: false,
            before: "!!abz",
            after: "abzaa",
            expected: "!o!b!",
            message: "Should evaluate considering leading zeroes and resolve no room"
        },
        {
            use: false,
            before: "akz",
            after: "abyn",
            expected: "!ort",
            message: "Should resolve hidden leading zero plus values that causes carry on substraction"
        },
        {
            use: false,
            before: "yz",
            after: "za",
            expected: "z!",
            message: "Should resolve values that may cause overflow after substraction"
        },
    ]
}

export default mocks;