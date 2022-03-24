export interface ICurrency {
  table: string;
  currency: string;
  code: string;
  rates: IRates[];
}

interface IRates {
  no: string;
  effectiveDate: string;
  mid: number;
}
