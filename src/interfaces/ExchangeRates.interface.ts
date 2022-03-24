export interface ExchangeRates {
    table:    string;
    currency: string;
    code:     string;
    rates:    Rate[];
}

export interface Rate {
    no:            string;
    effectiveDate: Date;
    bid:           number;
    ask:           number;
}
