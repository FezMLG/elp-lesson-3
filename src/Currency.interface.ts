export interface ICurrency {
  table: "A" | "B" | "C";
  currency: string;
  code: string;
  rates: IRates[];
}

interface IRates {
  no: string;
  effectiveDate: string;
  mid: number;
}
