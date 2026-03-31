export const INVALID_EMAILS = [
  '', ' ', 'test', 'test@', '@example.com', 'test@example',
  'test@.com', 'test@example..com', 'test@exa mple.com',
  'test@@example.com', 'test@exam_ple.com', 'test@-example.com',
  'test..email@example.com', 'tést@example.com'
  // 'test@example-.com', //TODO Create Defect for this case, as it should not be allowed, but is allowed now and causes 403 error
  // 'test@ｅｘａｍｐｌｅ.com' // TODO clarify if should be allowed: unicode local part?
];

export const INVALID_PHONE_NUMBERS = [
  "1", "12", "12345",
  "12345678901234567890",
  "123-456", "123 456", "(123)456",
  " 123456", "123456 "
];

export const UNACCEPTED_PHONE_NUMBERS = [
  " ", "\n",
  // "１２３４５", // TODO clarify if should be allowed: unicode digits?
  "abc123", "12a45"
];

export const INVALID_POSTAL_CODES = [
  '1', '12', '123', '1234',
  '123456', '1234567',
  ' 12345', '12345 ', '12 345'
  // '12-45', '12 45', '12_45', '12@45', '12a45', 'abcde', // TODO clarify if should be allowed: letters? symbols? 
  // '０１２３４' //TODO Create Defect for this case, as it should not be allowed, but is allowed now and causes 403 error
];

export const INVALID_SPECIAL_REQUESTS = [
  "a".repeat(501)
  // " ".repeat(10) // TODO clarify if should be allowed: whitespace-only?
];

export const CHECKOUT_EXPECTED = {
  page: {
    title: 'Checkout'
  },
  contact: {
    title: 'Contact'
  },
  delivery: {
    title: 'Delivery'
  },
  shippingMethod: {
    title: 'Shipping method',
    options: ['LP Express', 'Omniva', 'DPD pickup']
  },
  payment: {
    title: 'Bank Transfer',
    detailsText:
      'Bank Transfer Details: Recipient Name: John Doe Bank Name: National Bank of Commerce Account Number: 123456789 IBAN: LT12 3456 7890 1234 5678 SWIFT/BIC Code: NWBKGB2L Reference: Invoice #987654 Currency: EUR Please ensure that you include the reference to help us identify your payment. Thank you!',
    footerText:
      'You will get a copy of these instructions to your email after placing an order'
  },
  default: {
    email: '',
    fullName: '',
    shippingDestination: 'Lithuania',
    postalCode: '',
    phoneCountryCode: 'lt',
    phone: '',
    specialRequests: '',
    discountCode: ''
  },
  placeholders: {
    email: 'Email',
    fullName: 'Full name',
    postalCode: 'Postal code (Optional)',
    phone: 'Phone number',
    specialRequests:
      'Do you have any special requests or dietary restrictions we should be aware of? (e.g., gluten-free, nut allergies)',
    discountCode: 'Enter discount code'
  },
  testdata: {
    email: 'test@example.com',
    fullName: 'Test User',
    shippingDestination: 'Lithuania',
    postalCode: '12345',
    phoneCountryCode: 'ee',
    phone: '+37262345678',
    specialRequests: 'No special requests',
    shippingMethod: 'Omniva',
    parcelBox: 'vi'
  },
  errorMessage: {
    emailInvalid: 'Enter a valid email',
    fullName: 'Enter a full name',
    phoneRequired: 'Enter a phone number',
    phoneNumberInvalid: 'Enter a valid phone number',
    postalCodeInvalid: 'Postal code must be 5 digits',
    specialRequestsRequired:
      'Do you have any special requests or dietary restrictions we should be aware of? (e.g., gluten-free, nut allergies) is required',
    specialRequestsInvalid:
      'Do you have any special requests or dietary restrictions we should be aware of? (e.g., gluten-free, nut allergies) must be at most 500 characters long',
    parcelBoxRequired: 'Please choose a parcel address to continue',
    discountCodeInvalid: 'Enter a valid discount code',
    discountCodeAlreadyUsed: 'This code has already been used'
  }
}