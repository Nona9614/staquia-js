type BeforeSpy = {
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
    spies: BeforeSpy[]
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
            value: "z",
            expected: "y",
            message: "Should go one value before"
        },
        {
            use: false,
            value: "z!",
            expected: "yz",
            message: "Should go (base * n - 1) place before when starts with 'zero'"
        }
    ]
}

export default mocks;