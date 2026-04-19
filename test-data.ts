export interface CustomerDetails {
    firstName: string;
    lastName: string;
    postalCode: string;
    username: string;
    password: string;
}

export const customerDetails: CustomerDetails = {
    firstName: 'John',
    lastName: 'Doe',
    postalCode: 'SW1A 1AA',
    username: 'standard_user',
    password: 'secret_sauce',
};

