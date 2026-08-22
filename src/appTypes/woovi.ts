export type ChargeType = {
  comment: string;
  correlationID: string;
  createdAt: string;
  customer: CustomerType;
  status: string;
  updatedAt: string;
  value: number;
};

export type ChargePostResponse = {
  charge?: ChargeType;
  correlationID?: string;
  brCode?: string;
  error?: string;
};

export type CustomerType = {
  name: string;
  taxID: string;
  email: string;
  phone: string;
};
export type ChargePostPayloadType = {
  correlationID: string;
  value: number;
  comment?: string;
  customer?: CustomerType;
};

export type AdditionalInfoType = {
  key: string;
  value: string;
};
export type ChargeWooviType = {
  value: number;
  status: string;
  comment: string;
  correlationID: string;
  paymentLinkID: string;
  paymentLinkUrl: string;
  createdAt: string;
  updatedAt: string;
  expiresIn: string;
  additionalInfo: AdditionalInfoType[];
};
