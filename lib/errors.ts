export class BadRequestError {
  readonly _tag = "BadRequestError"
  constructor(readonly message: string) {}
}

export class TransactionFailedError {
  readonly _tag = "TransactionFailedError"
  readonly message: string
  readonly status: string
  readonly gateway_response: string
  constructor(status: string, gateway_response: string) {
    this.message = "Transaction was not successful"
    this.status = status
    this.gateway_response = gateway_response
  }
} 

export class UnknownError {
  readonly _tag = "UnknownError"
  constructor(readonly message: string) {}
}