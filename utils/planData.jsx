const planData = [
    {
        id:1,
        name:'Free',
        cost:0,
        offering:[
            { value:'10 mock interviews', included:true },
            { value:'Unlimited retakes', included:true },
            { value:'Practice questions', included:true },
            { value:'Live doubt access', included:false },
            { value:'Chat support', included:false },
        ]
    },
    {
        id:2,
        name:'Monthly',
        cost:5.99,
        // Stripe test-mode payment link: no real charges.
        paymentLink:'https://buy.stripe.com/test_5kA7vmedP5DbdfaeUU',
        offering:[
            { value:'50 mock interviews', included:true },
            { value:'Unlimited retakes', included:true },
            { value:'Practice questions', included:true },
            { value:'Live doubt access', included:true },
            { value:'Chat support', included:true },
        ]
    }
]

export default planData;
