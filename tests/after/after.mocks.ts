type AfterSpy = {
    use: boolean,
    value: string,
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
    spies: AfterSpy[]
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
            value: "a",
            expected: "b",
            message: "Should go one value above"
        },
        {
            use: false,
            value: "az",
            expected: "b!",
            message: "Should go (base * n + 1) place after when starts with the last character in set"
        },
        {
            use: false,
            value: "azzz",
            expected: "b!!!",
            message: "Should resolve multiple overflows"
        },
    ]
}

export default mocks;